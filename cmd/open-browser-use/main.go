package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"time"

	"github.com/ifuryst/open-browser-use/internal/host"
	"github.com/ifuryst/open-browser-use/internal/wire"
)

const version = "0.1.0"

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run(args []string) error {
	if len(args) == 0 {
		return runHost(args)
	}
	switch args[0] {
	case "host":
		return runHost(args[1:])
	case "manifest":
		return runManifest(args[1:])
	case "call":
		return runCall(args[1:])
	case "info":
		return runCall(append([]string{"--method", "getInfo"}, args[1:]...))
	case "tabs":
		return runCall(append([]string{"--method", "getTabs"}, args[1:]...))
	case "version", "--version", "-v":
		fmt.Println(version)
		return nil
	case "help", "--help", "-h":
		printHelp()
		return nil
	default:
		return fmt.Errorf("unknown subcommand %q", args[0])
	}
}

func runHost(args []string) error {
	flags := flag.NewFlagSet("host", flag.ContinueOnError)
	socketDir := flags.String("socket-dir", filepath.Join(os.TempDir(), "open-browser-use"), "directory for SDK Unix sockets")
	socketPath := flags.String("socket-path", "", "explicit SDK Unix socket path")
	if err := flags.Parse(args); err != nil {
		return err
	}
	relay := host.NewRelay(host.Config{
		SocketDir:  *socketDir,
		SocketPath: *socketPath,
	}, os.Stdin, os.Stdout)
	return relay.Serve(context.Background())
}

func runManifest(args []string) error {
	flags := flag.NewFlagSet("manifest", flag.ContinueOnError)
	extensionID := flags.String("extension-id", "", "Chrome extension id for allowed_origins")
	binaryPath := flags.String("path", "", "absolute path to open-browser-use binary")
	if err := flags.Parse(args); err != nil {
		return err
	}
	if *extensionID == "" {
		return errors.New("manifest requires --extension-id")
	}
	path := *binaryPath
	if path == "" {
		executable, err := os.Executable()
		if err != nil {
			return err
		}
		path, err = filepath.Abs(executable)
		if err != nil {
			return err
		}
	}
	manifest := map[string]any{
		"name":        host.NativeHostName,
		"description": "Open Browser Use Chrome native messaging host",
		"type":        "stdio",
		"path":        path,
		"allowed_origins": []string{
			fmt.Sprintf("chrome-extension://%s/", *extensionID),
		},
	}
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(manifest)
}

func runCall(args []string) error {
	flags := flag.NewFlagSet("call", flag.ContinueOnError)
	socketPath := flags.String("socket", "", "open-browser-use Unix socket path")
	method := flags.String("method", "", "JSON-RPC method")
	params := flags.String("params", "{}", "JSON object params")
	timeout := flags.Duration("timeout", 10*time.Second, "request timeout")
	if err := flags.Parse(args); err != nil {
		return err
	}
	if *socketPath == "" {
		return errors.New("call requires --socket")
	}
	if *method == "" {
		return errors.New("call requires --method")
	}
	var paramValue map[string]any
	if err := json.Unmarshal([]byte(*params), &paramValue); err != nil {
		return err
	}
	conn, err := net.DialTimeout("unix", *socketPath, *timeout)
	if err != nil {
		return err
	}
	defer conn.Close()
	deadline := time.Now().Add(*timeout)
	_ = conn.SetDeadline(deadline)
	if _, ok := paramValue["session_id"]; !ok {
		paramValue["session_id"] = "obu-cli"
	}
	if _, ok := paramValue["turn_id"]; !ok {
		paramValue["turn_id"] = fmt.Sprintf("obu-cli-%d", time.Now().UnixNano())
	}
	request := map[string]any{
		"jsonrpc": "2.0",
		"id":      "cli-1",
		"method":  *method,
		"params":  paramValue,
	}
	if err := wire.WriteJSON(conn, request); err != nil {
		return err
	}
	var response map[string]any
	if err := wire.ReadJSON(conn, &response); err != nil {
		return err
	}
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(response)
}

func printHelp() {
	fmt.Println(`open-browser-use (obu)

Usage:
  open-browser-use host [--socket-dir /tmp/open-browser-use]
  open-browser-use manifest --extension-id <id> [--path /abs/open-browser-use]
  open-browser-use call --socket <path> --method <method> [--params '{}']
  open-browser-use info --socket <path>
  open-browser-use tabs --socket <path>
  open-browser-use version

When Chrome launches this binary as a native messaging host, invoke it without
arguments or with "host".`)
}
