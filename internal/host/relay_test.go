package host

import (
	"context"
	"encoding/json"
	"net"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/ifuryst/open-browser-use/internal/wire"
)

func TestRelayRemapsRequestIDs(t *testing.T) {
	hostToExtensionReader, hostToExtensionWriter := net.Pipe()
	defer hostToExtensionReader.Close()
	defer hostToExtensionWriter.Close()
	extensionToHostReader, extensionToHostWriter := net.Pipe()
	defer extensionToHostReader.Close()
	defer extensionToHostWriter.Close()

	socketPath := filepath.Join(t.TempDir(), "obu.sock")
	relay := NewRelay(Config{SocketPath: socketPath}, extensionToHostReader, hostToExtensionWriter)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	errCh := make(chan error, 1)
	go func() { errCh <- relay.Serve(ctx) }()
	waitForSocket(t, socketPath)

	client, err := net.Dial("unix", socketPath)
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	if err := wire.WriteJSON(client, map[string]any{
		"jsonrpc": "2.0",
		"id":      7,
		"method":  "getInfo",
	}); err != nil {
		t.Fatal(err)
	}

	var forwarded map[string]any
	if err := wire.ReadJSON(hostToExtensionReader, &forwarded); err != nil {
		t.Fatal(err)
	}
	hostID, ok := forwarded["id"].(string)
	if !ok || hostID == "" || hostID == "7" {
		t.Fatalf("expected remapped host id, got %#v", forwarded["id"])
	}

	if err := wire.WriteJSON(extensionToHostWriter, map[string]any{
		"jsonrpc": "2.0",
		"id":      hostID,
		"result":  map[string]any{"type": "extension"},
	}); err != nil {
		t.Fatal(err)
	}

	var response map[string]any
	if err := wire.ReadJSON(client, &response); err != nil {
		t.Fatal(err)
	}
	if response["id"].(float64) != 7 {
		encoded, _ := json.Marshal(response)
		t.Fatalf("expected original client id, got %s", encoded)
	}

	cancel()
	select {
	case <-errCh:
	case <-time.After(time.Second):
		t.Fatal("relay did not stop")
	}
}

func waitForSocket(t *testing.T, path string) {
	t.Helper()
	deadline := time.Now().Add(time.Second)
	for time.Now().Before(deadline) {
		if _, err := os.Stat(path); err == nil {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("socket was not created: %s", path)
}
