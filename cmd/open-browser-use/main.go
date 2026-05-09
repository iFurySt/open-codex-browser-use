package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/ifuryst/open-browser-use/internal/host"
	"github.com/ifuryst/open-browser-use/internal/wire"
	"github.com/spf13/cobra"
)

const version = "0.1.7"
const defaultChromeExtensionID = "bgjoihaepiejlfjinojjfgokghnodnhd"

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run(args []string) error {
	if len(args) > 0 && isNativeMessagingLaunch(args[0]) {
		return runHost(host.DefaultSocketDir, "")
	}
	cmd := newRootCommand()
	cmd.SetArgs(args)
	return cmd.Execute()
}

func isNativeMessagingLaunch(arg string) bool {
	return strings.HasPrefix(arg, "chrome-extension://")
}

func newRootCommand() *cobra.Command {
	var showVersion bool
	root := &cobra.Command{
		Use:           "open-browser-use",
		Short:         "Open Browser Use native host and CLI",
		SilenceUsage:  true,
		SilenceErrors: true,
		RunE: func(cmd *cobra.Command, _ []string) error {
			if showVersion {
				fmt.Fprintln(cmd.OutOrStdout(), version)
				return nil
			}
			fmt.Fprintf(cmd.OutOrStdout(), "Open Browser Use %s\n\n", version)
			return cmd.Help()
		},
	}
	root.Flags().BoolVarP(&showVersion, "version", "v", false, "print version")
	root.AddCommand(
		newHostCommand(),
		newManifestCommand(),
		newInstallManifestCommand(),
		newCallCommand(),
		newOpenTabCommand(),
		newNavigateCommand(),
		newSimpleRPCCommand("ping", "ping", "Ping the browser backend"),
		newSimpleRPCCommand("info", "getInfo", "Print browser backend info"),
		newSimpleRPCCommand("tabs", "getTabs", "List session tabs"),
		newSimpleRPCCommand("user-tabs", "getUserTabs", "List user Chrome tabs"),
		newHistoryCommand(),
		newClaimTabCommand(),
		newFinalizeTabsCommand(),
		newNameSessionCommand(),
		newCdpCommand(),
		newMoveMouseCommand(),
		newWaitFileChooserCommand(),
		newSetFileChooserFilesCommand(),
		newSimpleRPCCommand("turn-ended", "turnEnded", "End the current browser turn"),
		newVersionCommand(),
	)
	return root
}

func newHostCommand() *cobra.Command {
	var socketDir string
	var socketPath string
	cmd := &cobra.Command{
		Use:   "host",
		Short: "Run the native messaging host relay",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			return runHost(socketDir, socketPath)
		},
	}
	cmd.Flags().StringVar(&socketDir, "socket-dir", host.DefaultSocketDir, "directory for SDK Unix sockets")
	cmd.Flags().StringVar(&socketPath, "socket-path", "", "explicit SDK Unix socket path")
	return cmd
}

func runHost(socketDir string, socketPath string) error {
	relay := host.NewRelay(host.Config{
		SocketDir:  socketDir,
		SocketPath: socketPath,
	}, os.Stdin, os.Stdout)
	return relay.Serve(context.Background())
}

func newManifestCommand() *cobra.Command {
	extensionID := defaultChromeExtensionID
	var hostPath string
	cmd := &cobra.Command{
		Use:   "manifest",
		Short: "Print a Chrome native messaging host manifest",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			manifest, err := nativeManifest(extensionID, hostPath)
			if err != nil {
				return err
			}
			return writeJSON(manifest)
		},
	}
	cmd.Flags().StringVar(&extensionID, "extension-id", defaultChromeExtensionID, "Chrome extension id for allowed_origins")
	cmd.Flags().StringVar(&hostPath, "path", "", "native host path written to manifest; defaults to the stable host link")
	return cmd
}

func newInstallManifestCommand() *cobra.Command {
	extensionID := defaultChromeExtensionID
	var binaryPath string
	var outputPath string
	cmd := &cobra.Command{
		Use:   "install-manifest",
		Short: "Install the Chrome native messaging host manifest",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			path, err := installNativeManifest(extensionID, binaryPath, outputPath)
			if err != nil {
				return err
			}
			fmt.Fprintln(cmd.OutOrStdout(), path)
			return nil
		},
	}
	cmd.Flags().StringVar(&extensionID, "extension-id", defaultChromeExtensionID, "Chrome extension id for allowed_origins")
	cmd.Flags().StringVar(&binaryPath, "path", "", "native host binary target for the stable host link")
	cmd.Flags().StringVar(&outputPath, "output", "", "native host manifest output path")
	return cmd
}

func installNativeManifest(extensionID string, binaryPath string, outputPath string) (string, error) {
	targetPath, err := resolveNativeHostTarget(binaryPath)
	if err != nil {
		return "", err
	}
	hostPath, err := stableNativeHostPath()
	if err != nil {
		return "", err
	}
	if err := installStableNativeHostLink(targetPath, hostPath); err != nil {
		return "", err
	}
	manifest, err := nativeManifest(extensionID, hostPath)
	if err != nil {
		return "", err
	}
	path := outputPath
	if path == "" {
		path, err = defaultNativeHostManifestPath()
		if err != nil {
			return "", err
		}
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return "", err
	}
	payload, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return "", err
	}
	if err := os.WriteFile(path, append(payload, '\n'), 0o600); err != nil {
		return "", err
	}
	return path, nil
}

type socketOptions struct {
	socketPath string
	socketDir  string
	timeout    time.Duration
}

func addSocketFlags(cmd *cobra.Command, options *socketOptions) {
	cmd.Flags().StringVar(&options.socketPath, "socket", "", "open-browser-use Unix socket path")
	cmd.Flags().StringVar(&options.socketDir, "socket-dir", host.DefaultSocketDir, "directory containing active socket registry")
	cmd.Flags().DurationVar(&options.timeout, "timeout", 10*time.Second, "request timeout")
}

func newCallCommand() *cobra.Command {
	var options socketOptions
	var method string
	var params string
	cmd := &cobra.Command{
		Use:   "call",
		Short: "Send an unrestricted JSON-RPC request",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			if method == "" {
				return errors.New("call requires --method")
			}
			var paramValue map[string]any
			if err := json.Unmarshal([]byte(params), &paramValue); err != nil {
				return err
			}
			return invokeAndWrite(options, method, paramValue)
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().StringVar(&method, "method", "", "JSON-RPC method")
	cmd.Flags().StringVar(&params, "params", "{}", "JSON object params")
	return cmd
}

func newSimpleRPCCommand(use string, method string, short string) *cobra.Command {
	var options socketOptions
	cmd := &cobra.Command{
		Use:   use,
		Short: short,
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			return invokeAndWrite(options, method, map[string]any{})
		},
	}
	addSocketFlags(cmd, &options)
	return cmd
}

func newHistoryCommand() *cobra.Command {
	var options socketOptions
	var query string
	var limit int
	var from string
	var to string
	cmd := &cobra.Command{
		Use:   "history",
		Short: "Search Chrome history",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			params := map[string]any{"query": query, "limit": limit}
			if from != "" {
				params["from"] = from
			}
			if to != "" {
				params["to"] = to
			}
			return invokeAndWrite(options, "getUserHistory", params)
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().StringVar(&query, "query", "", "history search query")
	cmd.Flags().IntVar(&limit, "limit", 100, "maximum result count")
	cmd.Flags().StringVar(&from, "from", "", "optional ISO start date")
	cmd.Flags().StringVar(&to, "to", "", "optional ISO end date")
	return cmd
}

func newClaimTabCommand() *cobra.Command {
	var options socketOptions
	var tabID int
	cmd := &cobra.Command{
		Use:   "claim-tab",
		Short: "Claim an existing Chrome tab",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			if tabID <= 0 {
				return errors.New("claim-tab requires --tab-id")
			}
			return invokeAndWrite(options, "claimUserTab", map[string]any{"tabId": tabID})
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().IntVar(&tabID, "tab-id", 0, "Chrome tab id to claim")
	return cmd
}

func newFinalizeTabsCommand() *cobra.Command {
	var options socketOptions
	var keepJSON string
	cmd := &cobra.Command{
		Use:   "finalize-tabs",
		Short: "Finalize session tabs",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			var keep []any
			if err := json.Unmarshal([]byte(keepJSON), &keep); err != nil {
				return fmt.Errorf("finalize-tabs --keep must be a JSON array: %w", err)
			}
			return invokeAndWrite(options, "finalizeTabs", map[string]any{"keep": keep})
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().StringVar(&keepJSON, "keep", "[]", `tabs to keep, e.g. '[{"tabId":123,"status":"handoff"}]'`)
	return cmd
}

func newNameSessionCommand() *cobra.Command {
	var options socketOptions
	var name string
	cmd := &cobra.Command{
		Use:   "name-session",
		Short: "Set the session tab group name",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			if name == "" {
				return errors.New("name-session requires --name")
			}
			return invokeAndWrite(options, "nameSession", map[string]any{"name": name})
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().StringVar(&name, "name", "", "session group title")
	return cmd
}

func newCdpCommand() *cobra.Command {
	var options socketOptions
	var tabID int
	var method string
	var commandParamsJSON string
	cmd := &cobra.Command{
		Use:   "cdp",
		Short: "Run a Chrome DevTools Protocol command",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			if method == "" {
				return errors.New("cdp requires --method")
			}
			var commandParams map[string]any
			if err := json.Unmarshal([]byte(commandParamsJSON), &commandParams); err != nil {
				return fmt.Errorf("cdp --params must be a JSON object: %w", err)
			}
			target := map[string]any{}
			if tabID > 0 {
				target["tabId"] = tabID
				_, _ = invoke(options.socketPath, options.socketDir, "attach", map[string]any{"tabId": tabID}, options.timeout)
			}
			return invokeAndWrite(options, "executeCdp", map[string]any{
				"target":        target,
				"method":        method,
				"commandParams": commandParams,
			})
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().IntVar(&tabID, "tab-id", 0, "optional tab id target")
	cmd.Flags().StringVar(&method, "method", "", "Chrome DevTools Protocol method")
	cmd.Flags().StringVar(&commandParamsJSON, "params", "{}", "Chrome DevTools Protocol command params")
	return cmd
}

func newMoveMouseCommand() *cobra.Command {
	var options socketOptions
	var tabID int
	var x float64
	var y float64
	var wait bool
	cmd := &cobra.Command{
		Use:   "move-mouse",
		Short: "Move the browser cursor overlay",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			if tabID <= 0 {
				return errors.New("move-mouse requires --tab-id")
			}
			return invokeAndWrite(options, "moveMouse", map[string]any{
				"tabId":          tabID,
				"x":              x,
				"y":              y,
				"waitForArrival": wait,
			})
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().IntVar(&tabID, "tab-id", 0, "tab id to move the cursor in")
	cmd.Flags().Float64Var(&x, "x", 0, "viewport x coordinate")
	cmd.Flags().Float64Var(&y, "y", 0, "viewport y coordinate")
	cmd.Flags().BoolVar(&wait, "wait", true, "wait for cursor arrival acknowledgement")
	return cmd
}

func newWaitFileChooserCommand() *cobra.Command {
	var options socketOptions
	var tabID int
	cmd := &cobra.Command{
		Use:   "wait-file-chooser",
		Short: "Wait for a browser session tab to open a file chooser",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			if tabID <= 0 {
				return errors.New("wait-file-chooser requires --tab-id")
			}
			return invokeAndWrite(options, "waitForFileChooser", map[string]any{
				"tabId":     tabID,
				"timeoutMs": int(options.timeout.Milliseconds()),
			})
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().IntVar(&tabID, "tab-id", 0, "tab id expected to open a file chooser")
	return cmd
}

func newSetFileChooserFilesCommand() *cobra.Command {
	var options socketOptions
	var fileChooserID string
	var files []string
	cmd := &cobra.Command{
		Use:   "set-file-chooser-files",
		Short: "Set files for an intercepted browser file chooser",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			if fileChooserID == "" {
				return errors.New("set-file-chooser-files requires --file-chooser-id")
			}
			if len(files) == 0 {
				return errors.New("set-file-chooser-files requires at least one --file")
			}
			return invokeAndWrite(options, "setFileChooserFiles", map[string]any{
				"fileChooserId": fileChooserID,
				"files":         files,
			})
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().StringVar(&fileChooserID, "file-chooser-id", "", "file chooser id returned by wait-file-chooser")
	cmd.Flags().StringSliceVar(&files, "file", nil, "file path to set; repeat or comma-separate for multiple files")
	return cmd
}

func newOpenTabCommand() *cobra.Command {
	var options socketOptions
	var url string
	cmd := &cobra.Command{
		Use:   "open-tab",
		Short: "Open a new browser session tab",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			tabResponse, err := invoke(options.socketPath, options.socketDir, "createTab", map[string]any{}, options.timeout)
			if err != nil {
				return err
			}
			result, _ := tabResponse["result"].(map[string]any)
			tabID, ok := numberAsInt(result["id"])
			if !ok {
				return errors.New("createTab response did not include numeric tab id")
			}
			output := map[string]any{"tab": result}
			if url != "" {
				_, _ = invoke(options.socketPath, options.socketDir, "attach", map[string]any{"tabId": tabID}, options.timeout)
				navigateResponse, err := invoke(options.socketPath, options.socketDir, "executeCdp", map[string]any{
					"target":        map[string]any{"tabId": tabID},
					"method":        "Page.navigate",
					"commandParams": map[string]any{"url": url},
				}, options.timeout)
				if err != nil {
					return err
				}
				output["navigate"] = navigateResponse["result"]
			}
			return writeJSON(output)
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().StringVar(&url, "url", "", "optional URL to navigate after tab creation")
	return cmd
}

func newNavigateCommand() *cobra.Command {
	var options socketOptions
	var tabID int
	var url string
	cmd := &cobra.Command{
		Use:   "navigate",
		Short: "Navigate a browser session tab",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {
			if tabID <= 0 {
				return errors.New("navigate requires --tab-id")
			}
			if url == "" {
				return errors.New("navigate requires --url")
			}
			_, _ = invoke(options.socketPath, options.socketDir, "attach", map[string]any{"tabId": tabID}, options.timeout)
			return invokeAndWrite(options, "executeCdp", map[string]any{
				"target":        map[string]any{"tabId": tabID},
				"method":        "Page.navigate",
				"commandParams": map[string]any{"url": url},
			})
		},
	}
	addSocketFlags(cmd, &options)
	cmd.Flags().IntVar(&tabID, "tab-id", 0, "tab id to navigate")
	cmd.Flags().StringVar(&url, "url", "", "URL to navigate to")
	return cmd
}

func newVersionCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "version",
		Short: "Print version",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			fmt.Fprintln(cmd.OutOrStdout(), version)
			return nil
		},
	}
}

func invokeAndWrite(options socketOptions, method string, params map[string]any) error {
	response, err := invoke(options.socketPath, options.socketDir, method, params, options.timeout)
	if err != nil {
		return err
	}
	return writeJSON(response)
}

func invoke(socketPath string, socketDir string, method string, params map[string]any, timeout time.Duration) (map[string]any, error) {
	resolvedSocketPath := socketPath
	fromRegistry := false
	if resolvedSocketPath == "" {
		record, err := host.ReadActiveSocketRecord(socketDir)
		if err != nil {
			return nil, fmt.Errorf("socket not provided and active socket registry is unavailable: %w", err)
		}
		resolvedSocketPath = record.SocketPath
		fromRegistry = true
	}
	conn, err := net.DialTimeout("unix", resolvedSocketPath, timeout)
	if err != nil {
		if fromRegistry {
			_ = host.RemoveActiveSocketRecord(socketDir, resolvedSocketPath)
			return nil, fmt.Errorf("active socket registry points to unavailable socket %q; removed stale registry entry: %w", resolvedSocketPath, err)
		}
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

func writeJSON(value any) error {
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	return encoder.Encode(value)
}

func nativeManifest(extensionID string, hostPath string) (map[string]any, error) {
	allowedExtensionID := strings.TrimSpace(extensionID)
	if allowedExtensionID == "" {
		allowedExtensionID = defaultChromeExtensionID
	}
	path := hostPath
	if path == "" {
		var err error
		path, err = stableNativeHostPath()
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
			fmt.Sprintf("chrome-extension://%s/", allowedExtensionID),
		},
	}, nil
}

func resolveNativeHostTarget(binaryPath string) (string, error) {
	path := binaryPath
	if path == "" {
		executable, err := os.Executable()
		if err != nil {
			return "", err
		}
		path = executable
	}
	absolutePath, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}
	info, err := os.Stat(absolutePath)
	if err != nil {
		return "", err
	}
	if info.IsDir() {
		return "", fmt.Errorf("native host binary target is a directory: %s", absolutePath)
	}
	if info.Mode()&0o111 == 0 {
		return "", fmt.Errorf("native host binary target is not executable: %s", absolutePath)
	}
	return absolutePath, nil
}

func stableNativeHostPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	switch runtime.GOOS {
	case "darwin":
		return filepath.Join(home, "Library/Application Support/OpenBrowserUse/native-host/open-browser-use"), nil
	case "linux":
		return filepath.Join(home, ".local/share/open-browser-use/native-host/open-browser-use"), nil
	default:
		return "", fmt.Errorf("stable native host link path is not implemented for %s", runtime.GOOS)
	}
}

func installStableNativeHostLink(targetPath string, linkPath string) error {
	if err := os.MkdirAll(filepath.Dir(linkPath), 0o700); err != nil {
		return err
	}
	if err := os.Remove(linkPath); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	return os.Symlink(targetPath, linkPath)
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
