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
	"runtime"
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
	case "install-manifest":
		return runInstallManifest(args[1:])
	case "call":
		return runCall(args[1:])
	case "open-tab":
		return runOpenTab(args[1:])
	case "navigate":
		return runNavigate(args[1:])
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
	manifest, err := nativeManifest(*extensionID, *binaryPath)
	if err != nil {
		return err
	}
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(manifest)
}

func runInstallManifest(args []string) error {
	flags := flag.NewFlagSet("install-manifest", flag.ContinueOnError)
	extensionID := flags.String("extension-id", "", "Chrome extension id for allowed_origins")
	binaryPath := flags.String("path", "", "absolute path to open-browser-use binary")
	outputPath := flags.String("output", "", "native host manifest output path")
	if err := flags.Parse(args); err != nil {
		return err
	}
	if *extensionID == "" {
		return errors.New("install-manifest requires --extension-id")
	}
	manifest, err := nativeManifest(*extensionID, *binaryPath)
	if err != nil {
		return err
	}
	path := *outputPath
	if path == "" {
		var err error
		path, err = defaultNativeHostManifestPath()
		if err != nil {
			return err
		}
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	payload, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(path, append(payload, '\n'), 0o600); err != nil {
		return err
	}
	fmt.Println(path)
	return nil
}

func runCall(args []string) error {
	flags := flag.NewFlagSet("call", flag.ContinueOnError)
	socketPath := flags.String("socket", "", "open-browser-use Unix socket path")
	socketDir := flags.String("socket-dir", filepath.Join(os.TempDir(), "open-browser-use"), "directory containing active socket registry")
	method := flags.String("method", "", "JSON-RPC method")
	params := flags.String("params", "{}", "JSON object params")
	timeout := flags.Duration("timeout", 10*time.Second, "request timeout")
	if err := flags.Parse(args); err != nil {
		return err
	}
	if *method == "" {
		return errors.New("call requires --method")
	}
	var paramValue map[string]any
	if err := json.Unmarshal([]byte(*params), &paramValue); err != nil {
		return err
	}
	response, err := invoke(*socketPath, *socketDir, *method, paramValue, *timeout)
	if err != nil {
		return err
	}
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(response)
}

func runOpenTab(args []string) error {
	flags := flag.NewFlagSet("open-tab", flag.ContinueOnError)
	socketPath := flags.String("socket", "", "open-browser-use Unix socket path")
	socketDir := flags.String("socket-dir", filepath.Join(os.TempDir(), "open-browser-use"), "directory containing active socket registry")
	url := flags.String("url", "", "optional URL to navigate after tab creation")
	timeout := flags.Duration("timeout", 10*time.Second, "request timeout")
	if err := flags.Parse(args); err != nil {
		return err
	}
	tabResponse, err := invoke(*socketPath, *socketDir, "createTab", map[string]any{}, *timeout)
	if err != nil {
		return err
	}
	result, _ := tabResponse["result"].(map[string]any)
	tabID, ok := numberAsInt(result["id"])
	if !ok {
		return errors.New("createTab response did not include numeric tab id")
	}
	output := map[string]any{"tab": result}
	if *url != "" {
		_, _ = invoke(*socketPath, *socketDir, "attach", map[string]any{"tabId": tabID}, *timeout)
		navigateResponse, err := invoke(*socketPath, *socketDir, "executeCdp", map[string]any{
			"target":        map[string]any{"tabId": tabID},
			"method":        "Page.navigate",
			"commandParams": map[string]any{"url": *url},
		}, *timeout)
		if err != nil {
			return err
		}
		output["navigate"] = navigateResponse["result"]
	}
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(output)
}

func runNavigate(args []string) error {
	flags := flag.NewFlagSet("navigate", flag.ContinueOnError)
	socketPath := flags.String("socket", "", "open-browser-use Unix socket path")
	socketDir := flags.String("socket-dir", filepath.Join(os.TempDir(), "open-browser-use"), "directory containing active socket registry")
	tabID := flags.Int("tab-id", 0, "tab id to navigate")
	url := flags.String("url", "", "URL to navigate to")
	timeout := flags.Duration("timeout", 10*time.Second, "request timeout")
	if err := flags.Parse(args); err != nil {
		return err
	}
	if *tabID <= 0 {
		return errors.New("navigate requires --tab-id")
	}
	if *url == "" {
		return errors.New("navigate requires --url")
	}
	_, _ = invoke(*socketPath, *socketDir, "attach", map[string]any{"tabId": *tabID}, *timeout)
	response, err := invoke(*socketPath, *socketDir, "executeCdp", map[string]any{
		"target":        map[string]any{"tabId": *tabID},
		"method":        "Page.navigate",
		"commandParams": map[string]any{"url": *url},
	}, *timeout)
	if err != nil {
		return err
	}
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(response)
}

func invoke(socketPath string, socketDir string, method string, params map[string]any, timeout time.Duration) (map[string]any, error) {
	resolvedSocketPath := socketPath
	if resolvedSocketPath == "" {
		record, err := host.ReadActiveSocketRecord(socketDir)
		if err != nil {
			return nil, fmt.Errorf("socket not provided and active socket registry is unavailable: %w", err)
		}
		resolvedSocketPath = record.SocketPath
	}
	conn, err := net.DialTimeout("unix", resolvedSocketPath, timeout)
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(timeout))
	if _, ok := params["session_id"]; !ok {
		params["session_id"] = "obu-cli"
	}
	if _, ok := params["turn_id"]; !ok {
		params["turn_id"] = fmt.Sprintf("obu-cli-%d", time.Now().UnixNano())
	}
	request := map[string]any{
		"jsonrpc": "2.0",
		"id":      "cli-1",
		"method":  method,
		"params":  params,
	}
	if err := wire.WriteJSON(conn, request); err != nil {
		return nil, err
	}
	var response map[string]any
	if err := wire.ReadJSON(conn, &response); err != nil {
		return nil, err
	}
	return response, nil
}

func nativeManifest(extensionID string, binaryPath string) (map[string]any, error) {
	path := binaryPath
	if path == "" {
		executable, err := os.Executable()
		if err != nil {
			return nil, err
		}
		path, err = filepath.Abs(executable)
		if err != nil {
			return nil, err
		}
	} else {
		absolutePath, err := filepath.Abs(path)
		if err != nil {
			return nil, err
		}
		path = absolutePath
	}
	return map[string]any{
		"name":        host.NativeHostName,
		"description": "Open Browser Use Chrome native messaging host",
		"type":        "stdio",
		"path":        path,
		"allowed_origins": []string{
			fmt.Sprintf("chrome-extension://%s/", extensionID),
		},
	}, nil
}

func defaultNativeHostManifestPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	filename := host.NativeHostName + ".json"
	switch runtime.GOOS {
	case "darwin":
		return filepath.Join(home, "Library/Application Support/Google/Chrome/NativeMessagingHosts", filename), nil
	case "linux":
		return filepath.Join(home, ".config/google-chrome/NativeMessagingHosts", filename), nil
	default:
		return "", fmt.Errorf("default manifest install path is not implemented for %s; pass --output", runtime.GOOS)
	}
}

func numberAsInt(value any) (int, bool) {
	switch typed := value.(type) {
	case int:
		return typed, true
	case float64:
		if typed == float64(int(typed)) {
			return int(typed), true
		}
	}
	return 0, false
}

func printHelp() {
	fmt.Println(`open-browser-use (obu)

Usage:
  open-browser-use host [--socket-dir /tmp/open-browser-use]
  open-browser-use manifest --extension-id <id> [--path /abs/open-browser-use]
  open-browser-use install-manifest --extension-id <id> [--path /abs/open-browser-use]
  open-browser-use call [--socket <path>] --method <method> [--params '{}']
  open-browser-use info [--socket <path>]
  open-browser-use tabs [--socket <path>]
  open-browser-use open-tab [--socket <path>] [--url https://example.com]
  open-browser-use navigate [--socket <path>] --tab-id <id> --url https://example.com
  open-browser-use version

When Chrome launches this binary as a native messaging host, invoke it without
arguments or with "host".`)
}
