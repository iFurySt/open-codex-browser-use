package wire

import (
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"unsafe"
)

const (
	HeaderBytes     = 4
	DefaultMaxFrame = 64 * 1024 * 1024
)

var ErrFrameTooLarge = errors.New("frame too large")

func NativeEndian() binary.ByteOrder {
	var value uint16 = 0x1
	bytes := (*[2]byte)(unsafe.Pointer(&value))
	if bytes[0] == 0x1 {
		return binary.LittleEndian
	}
	return binary.BigEndian
}

func WriteJSON(w io.Writer, value any) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return WriteFrame(w, payload)
}

func ReadJSON(r io.Reader, value any) error {
	payload, err := ReadFrame(r, DefaultMaxFrame)
	if err != nil {
		return err
	}
	return json.Unmarshal(payload, value)
}

func WriteFrame(w io.Writer, payload []byte) error {
	if len(payload) > math.MaxUint32 {
		return ErrFrameTooLarge
	}
	header := make([]byte, HeaderBytes)
	NativeEndian().PutUint32(header, uint32(len(payload)))
	if _, err := w.Write(header); err != nil {
		return err
	}
	_, err := w.Write(payload)
	return err
}

func ReadFrame(r io.Reader, maxBytes uint32) ([]byte, error) {
	header := make([]byte, HeaderBytes)
	if _, err := io.ReadFull(r, header); err != nil {
		return nil, err
	}
	length := NativeEndian().Uint32(header)
	if maxBytes > 0 && length > maxBytes {
		return nil, fmt.Errorf("%w: %d > %d", ErrFrameTooLarge, length, maxBytes)
	}
	payload := make([]byte, length)
	if _, err := io.ReadFull(r, payload); err != nil {
		return nil, err
	}
	return payload, nil
}
