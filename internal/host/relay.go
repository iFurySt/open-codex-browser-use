package host

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"sync/atomic"

	"github.com/ifuryst/open-browser-use/internal/wire"
)

const NativeHostName = "com.ifuryst.open-computer-use.extension"

type Config struct {
	SocketDir  string
	SocketPath string
	Logger     *slog.Logger
}

type Relay struct {
	config Config
	logger *slog.Logger

	stdin  io.Reader
	stdout io.Writer

	listener net.Listener

	mu        sync.Mutex
	clients   map[int64]*clientConn
	pending   map[string]pendingRequest
	nextID    atomic.Int64
	nextReqID atomic.Int64
	writeMu   sync.Mutex
}

type clientConn struct {
	id   int64
	conn net.Conn
	mu   sync.Mutex
}

type pendingRequest struct {
	client     *clientConn
	originalID any
}

func NewRelay(config Config, stdin io.Reader, stdout io.Writer) *Relay {
	logger := config.Logger
	if logger == nil {
		logger = slog.New(slog.NewTextHandler(os.Stderr, nil))
	}
	return &Relay{
		config:  config,
		logger:  logger,
		stdin:   stdin,
		stdout:  stdout,
		clients: make(map[int64]*clientConn),
		pending: make(map[string]pendingRequest),
	}
}

func (r *Relay) SocketPath() string {
	if r.config.SocketPath != "" {
		return r.config.SocketPath
	}
	return filepath.Join(socketDir(r.config.SocketDir), fmt.Sprintf("%s.sock", randomID()))
}

func (r *Relay) Serve(ctx context.Context) error {
	socketPath := r.SocketPath()
	if err := os.MkdirAll(filepath.Dir(socketPath), 0o700); err != nil {
		return err
	}
	_ = os.Remove(socketPath)
	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		return err
	}
	r.listener = listener
	if err := os.Chmod(socketPath, 0o600); err != nil {
		_ = listener.Close()
		return err
	}
	r.logger.Info("open-browser-use native host listening", "socket", socketPath)

	errCh := make(chan error, 2)
	go func() { errCh <- r.acceptLoop(ctx) }()
	go func() { errCh <- r.readExtensionLoop() }()
	go func() {
		<-ctx.Done()
		_ = listener.Close()
		r.closeClients()
	}()

	err = <-errCh
	_ = listener.Close()
	_ = os.Remove(socketPath)
	r.closeClients()
	if errors.Is(err, net.ErrClosed) || errors.Is(err, io.EOF) || errors.Is(err, context.Canceled) {
		return nil
	}
	return err
}

func (r *Relay) acceptLoop(ctx context.Context) error {
	for {
		conn, err := r.listener.Accept()
		if err != nil {
			if ctx.Err() != nil {
				return ctx.Err()
			}
			return err
		}
		id := r.nextID.Add(1)
		client := &clientConn{id: id, conn: conn}
		r.mu.Lock()
		r.clients[id] = client
		r.mu.Unlock()
		go r.readClientLoop(client)
	}
}

func (r *Relay) readClientLoop(client *clientConn) {
	defer func() {
		_ = client.conn.Close()
		r.mu.Lock()
		delete(r.clients, client.id)
		for requestID, pending := range r.pending {
			if pending.client == client {
				delete(r.pending, requestID)
			}
		}
		r.mu.Unlock()
	}()

	for {
		payload, err := wire.ReadFrame(client.conn, wire.DefaultMaxFrame)
		if err != nil {
			return
		}
		forwarded, hostID, originalID, err := r.rewriteClientRequest(payload)
		if err != nil {
			r.writeClientError(client, nil, err)
			continue
		}
		if hostID != "" {
			r.mu.Lock()
			r.pending[hostID] = pendingRequest{client: client, originalID: originalID}
			r.mu.Unlock()
		}
		if err := r.writeExtension(forwarded); err != nil {
			if hostID != "" {
				r.mu.Lock()
				delete(r.pending, hostID)
				r.mu.Unlock()
			}
			r.writeClientError(client, originalID, err)
		}
	}
}

func (r *Relay) readExtensionLoop() error {
	for {
		payload, err := wire.ReadFrame(r.stdin, wire.DefaultMaxFrame)
		if err != nil {
			return err
		}
		if err := r.dispatchExtensionPayload(payload); err != nil {
			r.logger.Warn("failed to dispatch extension payload", "error", err)
		}
	}
}

func (r *Relay) rewriteClientRequest(payload []byte) ([]byte, string, any, error) {
	var message map[string]any
	if err := json.Unmarshal(payload, &message); err != nil {
		return nil, "", nil, err
	}
	id, hasID := message["id"]
	if !hasID {
		return payload, "", nil, nil
	}
	hostID := "obu:" + strconv.FormatInt(r.nextReqID.Add(1), 10)
	message["id"] = hostID
	forwarded, err := json.Marshal(message)
	return forwarded, hostID, id, err
}

func (r *Relay) dispatchExtensionPayload(payload []byte) error {
	var message map[string]any
	if err := json.Unmarshal(payload, &message); err != nil {
		return err
	}
	id, hasID := message["id"].(string)
	if hasID {
		r.mu.Lock()
		pending, ok := r.pending[id]
		if ok {
			delete(r.pending, id)
		}
		r.mu.Unlock()
		if ok {
			message["id"] = pending.originalID
			rewritten, err := json.Marshal(message)
			if err != nil {
				return err
			}
			return pending.client.write(rewritten)
		}
	}
	r.broadcast(payload)
	return nil
}

func (r *Relay) writeExtension(payload []byte) error {
	r.writeMu.Lock()
	defer r.writeMu.Unlock()
	return wire.WriteFrame(r.stdout, payload)
}

func (r *Relay) writeClientError(client *clientConn, id any, err error) {
	if id == nil {
		id = nil
	}
	_ = client.writeJSON(map[string]any{
		"jsonrpc": "2.0",
		"id":      id,
		"error": map[string]any{
			"code":    -32000,
			"message": err.Error(),
		},
	})
}

func (r *Relay) broadcast(payload []byte) {
	r.mu.Lock()
	clients := make([]*clientConn, 0, len(r.clients))
	for _, client := range r.clients {
		clients = append(clients, client)
	}
	r.mu.Unlock()
	for _, client := range clients {
		_ = client.write(payload)
	}
}

func (r *Relay) closeClients() {
	r.mu.Lock()
	clients := make([]*clientConn, 0, len(r.clients))
	for _, client := range r.clients {
		clients = append(clients, client)
	}
	r.clients = make(map[int64]*clientConn)
	r.pending = make(map[string]pendingRequest)
	r.mu.Unlock()
	for _, client := range clients {
		_ = client.conn.Close()
	}
}

func (c *clientConn) writeJSON(value any) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return c.write(payload)
}

func (c *clientConn) write(payload []byte) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	return wire.WriteFrame(c.conn, payload)
}

func socketDir(configured string) string {
	if configured != "" {
		return configured
	}
	return filepath.Join(os.TempDir(), "open-browser-use")
}

func randomID() string {
	host, _ := os.Hostname()
	return fmt.Sprintf("%d-%d-%s", os.Getpid(), os.Getuid(), host)
}
