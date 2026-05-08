package wire

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"testing"
)

func TestWriteReadJSON(t *testing.T) {
	var buffer bytes.Buffer
	input := map[string]any{
		"jsonrpc": "2.0",
		"id":      "request-1",
		"method":  "getInfo",
	}
	if err := WriteJSON(&buffer, input); err != nil {
		t.Fatal(err)
	}

	var output map[string]any
	if err := ReadJSON(&buffer, &output); err != nil {
		t.Fatal(err)
	}
	if output["method"] != "getInfo" || output["id"] != "request-1" {
		t.Fatalf("unexpected decoded message: %#v", output)
	}
}

func TestReadFrameKeepsPayloadJSONUntouched(t *testing.T) {
	input := json.RawMessage(`{"id":1,"params":{"url":"https://example.com"}}`)
	var buffer bytes.Buffer
	if err := WriteFrame(&buffer, input); err != nil {
		t.Fatal(err)
	}
	payload, err := ReadFrame(&buffer, DefaultMaxFrame)
	if err != nil {
		t.Fatal(err)
	}
	if string(payload) != string(input) {
		t.Fatalf("payload changed: %s", payload)
	}
}

func TestReadFrameRejectsTooLarge(t *testing.T) {
	var buffer bytes.Buffer
	NativeEndian().PutUint32(make([]byte, HeaderBytes), 0)
	header := make([]byte, HeaderBytes)
	NativeEndian().PutUint32(header, 10)
	buffer.Write(header)
	_, err := ReadFrame(&buffer, 4)
	if !errors.Is(err, ErrFrameTooLarge) {
		t.Fatalf("expected ErrFrameTooLarge, got %v", err)
	}
}

func TestReadFramePropagatesEOF(t *testing.T) {
	_, err := ReadFrame(bytes.NewBuffer(nil), DefaultMaxFrame)
	if !errors.Is(err, io.EOF) {
		t.Fatalf("expected EOF, got %v", err)
	}
}
