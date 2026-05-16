package main

import (
	"bufio"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

func main() {
	if len(os.Args) != 2 {
		failf("usage: windows-host-smoke <open-browser-use.exe>")
	}
	exe, err := filepath.Abs(os.Args[1])
	if err != nil {
		failf("resolve exe: %v", err)
	}

	socketDir := filepath.Join(os.TempDir(), "open-browser-use")
	_ = os.RemoveAll(socketDir)

	cmd := exec.Command(exe, "--parent-window=0")
	stdin, err := cmd.StdinPipe()
	if err != nil {
		failf("stdin pipe: %v", err)
	}
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		failf("stdout pipe: %v", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		failf("stderr pipe: %v", err)
	}
	if err := cmd.Start(); err != nil {
		failf("start host: %v", err)
	}
	defer func() {
		_ = cmd.Process.Kill()
		_ = cmd.Wait()
	}()
	go discard(stderr)

	socketPath := waitActiveSocket(filepath.Join(socketDir, "active.json"), 5*time.Second)
	conn, err := net.DialTimeout("unix", socketPath, 2*time.Second)
	if err != nil {
		failf("dial unix socket %s: %v", socketPath, err)
	}
	defer conn.Close()

	request := map[string]any{
		"jsonrpc": "2.0",
		"id":      float64(1),
		"method":  "getInfo",
		"params":  map[string]any{},
	}
	if err := writeFrame(conn, request); err != nil {
		failf("write client request: %v", err)
	}

	forwarded := readFrame(stdout)
	hostID, _ := forwarded["id"].(string)
	if hostID == "" {
		failf("forwarded request did not get host id: %#v", forwarded)
	}
	if method, _ := forwarded["method"].(string); method != "getInfo" {
		failf("forwarded method = %q, want getInfo", method)
	}

	response := map[string]any{
		"jsonrpc": "2.0",
		"id":      hostID,
		"result": map[string]any{
			"version": "smoke",
			"metadata": map[string]any{
				"extensionId": "smoke-extension",
			},
		},
	}
	if err := writeFrame(stdin, response); err != nil {
		failf("write native response: %v", err)
	}

	clientResponse := readFrame(conn)
	if id, ok := clientResponse["id"].(float64); !ok || id != 1 {
		failf("client response id = %#v, want 1", clientResponse["id"])
	}
	if _, ok := clientResponse["result"].(map[string]any); !ok {
		failf("client response missing result: %#v", clientResponse)
	}

	fmt.Println("windows host smoke ok")
}

func waitActiveSocket(path string, timeout time.Duration) string {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		payload, err := os.ReadFile(path)
		if err == nil {
			var record struct {
				SocketPath string `json:"socketPath"`
			}
			if json.Unmarshal(payload, &record) == nil && record.SocketPath != "" {
				return record.SocketPath
			}
		}
		time.Sleep(100 * time.Millisecond)
	}
	failf("active socket record was not written at %s", path)
	return ""
}

func readFrame(reader io.Reader) map[string]any {
	var header [4]byte
	if _, err := io.ReadFull(reader, header[:]); err != nil {
		failf("read frame header: %v", err)
	}
	length := binary.LittleEndian.Uint32(header[:])
	payload := make([]byte, length)
	if _, err := io.ReadFull(reader, payload); err != nil {
		failf("read frame payload: %v", err)
	}
	var message map[string]any
	if err := json.Unmarshal(payload, &message); err != nil {
		failf("decode frame %q: %v", payload, err)
	}
	return message
}

func writeFrame(writer io.Writer, value any) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}
	if len(payload) > int(^uint32(0)) {
		return errors.New("frame too large")
	}
	var header [4]byte
	binary.LittleEndian.PutUint32(header[:], uint32(len(payload)))
	if _, err := writer.Write(header[:]); err != nil {
		return err
	}
	_, err = writer.Write(payload)
	return err
}

func discard(reader io.Reader) {
	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
	}
}

func failf(format string, args ...any) {
	fmt.Fprintf(os.Stderr, format+"\n", args...)
	os.Exit(1)
}
