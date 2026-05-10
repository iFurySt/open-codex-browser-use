package host

import (
	"context"
	"encoding/json"
	"net"
	"os"
	"path/filepath"
	"regexp"
	"testing"
	"time"

	"github.com/ifuryst/open-codex-browser-use/internal/wire"
)

func TestRelayRemapsRequestIDs(t *testing.T) {
	hostToExtensionReader, hostToExtensionWriter := net.Pipe()
	defer hostToExtensionReader.Close()
	defer hostToExtensionWriter.Close()
	extensionToHostReader, extensionToHostWriter := net.Pipe()
	defer extensionToHostReader.Close()
	defer extensionToHostWriter.Close()

	socketDir := shortSocketDir(t)
	socketPath := filepath.Join(socketDir, "obu.sock")
	relay := NewRelay(Config{SocketDir: socketDir, SocketPath: socketPath}, extensionToHostReader, hostToExtensionWriter)
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

func TestRelayBroadcastsExtensionNotificationsToSDKClients(t *testing.T) {
	hostToExtensionReader, hostToExtensionWriter := net.Pipe()
	defer hostToExtensionReader.Close()
	defer hostToExtensionWriter.Close()
	extensionToHostReader, extensionToHostWriter := net.Pipe()
	defer extensionToHostReader.Close()
	defer extensionToHostWriter.Close()

	socketDir := shortSocketDir(t)
	socketPath := filepath.Join(socketDir, "obu.sock")
	relay := NewRelay(Config{SocketDir: socketDir, SocketPath: socketPath}, extensionToHostReader, hostToExtensionWriter)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	errCh := make(chan error, 1)
	go func() { errCh <- relay.Serve(ctx) }()
	waitForSocket(t, socketPath)

	firstClient, err := net.Dial("unix", socketPath)
	if err != nil {
		t.Fatal(err)
	}
	defer firstClient.Close()
	secondClient, err := net.Dial("unix", socketPath)
	if err != nil {
		t.Fatal(err)
	}
	defer secondClient.Close()
	waitForClients(t, relay, 2)

	notification := map[string]any{
		"jsonrpc": "2.0",
		"method":  "onDownloadChange",
		"params":  map[string]any{"id": "download-1", "status": "started"},
	}
	if err := wire.WriteJSON(extensionToHostWriter, notification); err != nil {
		t.Fatal(err)
	}

	for index, client := range []net.Conn{firstClient, secondClient} {
		_ = client.SetReadDeadline(time.Now().Add(time.Second))
		var received map[string]any
		if err := wire.ReadJSON(client, &received); err != nil {
			t.Fatalf("client %d did not receive notification: %v", index+1, err)
		}
		if received["method"] != "onDownloadChange" {
			encoded, _ := json.Marshal(received)
			t.Fatalf("client %d received unexpected payload: %s", index+1, encoded)
		}
	}

	cancel()
	select {
	case <-errCh:
	case <-time.After(time.Second):
		t.Fatal("relay did not stop")
	}
}

func TestActiveSocketRecordLifecycle(t *testing.T) {
	socketDir := t.TempDir()
	socketPath := filepath.Join(socketDir, "obu.sock")

	if err := WriteActiveSocketRecord(socketDir, socketPath); err != nil {
		t.Fatal(err)
	}
	record, err := ReadActiveSocketRecord(socketDir)
	if err != nil {
		t.Fatal(err)
	}
	if record.SocketPath != socketPath {
		t.Fatalf("expected socket path %q, got %q", socketPath, record.SocketPath)
	}
	if record.PID != os.Getpid() {
		t.Fatalf("expected pid %d, got %d", os.Getpid(), record.PID)
	}
	if record.StartedAt.IsZero() {
		t.Fatal("expected startedAt to be populated")
	}

	if err := RemoveActiveSocketRecord(socketDir, filepath.Join(socketDir, "other.sock")); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(ActiveSocketRecordPath(socketDir)); err != nil {
		t.Fatal("record should not be removed for a different socket path")
	}

	if err := RemoveActiveSocketRecord(socketDir, socketPath); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(ActiveSocketRecordPath(socketDir)); !os.IsNotExist(err) {
		t.Fatalf("expected active socket record to be removed, got %v", err)
	}
}

func TestDefaultSocketPathUsesUUIDFilename(t *testing.T) {
	socketDir := t.TempDir()
	relay := NewRelay(Config{SocketDir: socketDir}, nil, nil)
	socketPath := relay.SocketPath()
	if filepath.Dir(socketPath) != socketDir {
		t.Fatalf("expected socket path under %q, got %q", socketDir, socketPath)
	}
	matched, err := regexp.MatchString(
		`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.sock$`,
		filepath.Base(socketPath),
	)
	if err != nil {
		t.Fatal(err)
	}
	if !matched {
		t.Fatalf("expected UUID socket filename, got %q", filepath.Base(socketPath))
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

func waitForClients(t *testing.T, relay *Relay, count int) {
	t.Helper()
	deadline := time.Now().Add(time.Second)
	for time.Now().Before(deadline) {
		relay.mu.Lock()
		got := len(relay.clients)
		relay.mu.Unlock()
		if got >= count {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	relay.mu.Lock()
	got := len(relay.clients)
	relay.mu.Unlock()
	t.Fatalf("relay accepted %d clients, want %d", got, count)
}

func shortSocketDir(t *testing.T) string {
	t.Helper()
	dir, err := os.MkdirTemp("/tmp", "obu-")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		_ = os.RemoveAll(dir)
	})
	return dir
}
