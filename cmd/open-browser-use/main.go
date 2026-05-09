package main

import (
	"archive/zip"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/ifuryst/open-browser-use/internal/host"
	"github.com/ifuryst/open-browser-use/internal/wire"
	"github.com/spf13/cobra"
)

const version = "0.1.11"
const defaultChromeExtensionID = "bgjoihaepiejlfjinojjfgokghnodnhd"
const chromeWebStoreUpdateURL = "https://clients2.google.com/service/update2/crx"
const offlineExtensionPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnBLT95WWVnHYH0pOBRH/eP+BWtlKVmLE/RHkERUTI2+PGDSQrbWVabmTw4CZ3yhjko04dijSX2Az8cnp65xh23Dh5mP5TCtiP9LexRFJokd8EsyeFdtKamMYr0hF1ZUc1/8ZpLnetAU65ZMB9VzHQBqpJWeUwuIvecgfRtGklDgJMjnvcq5J6pttZrzWrI/2B0BNufwsTQfEt7qLtDFPHXmUdtZfQbc2EfYFvkXLDAXicYviiocedrsAGIKUxpyQegobhUFL+tNLOuXKBpZlLFQn3xgm5CyGZwN6bueiV/S7reigVTKAMQ8BX0eacT22e8r0UzjsjkugeHOIonIvtQIDAQAB"

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
		newSetupCommand(),
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

func newSetupCommand() *cobra.Command {
	extensionID := defaultChromeExtensionID
	var binaryPath string
	var externalExtensionOutput string
	cmd := &cobra.Command{
		Use:   "setup",
		Short: "Register Chrome integration for Open Browser Use",
		Args:  cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			result, err := setupChrome(extensionID, binaryPath, externalExtensionOutput)
			if err != nil {
				return err
			}
			fmt.Fprintf(cmd.OutOrStdout(), "Native messaging host manifest: %s\n", result.NativeManifestPath)
			fmt.Fprintf(cmd.OutOrStdout(), "Chrome extension install hint: %s\n", result.ExternalExtensionPath)
			fmt.Fprintln(cmd.OutOrStdout(), "Restart Chrome and approve the Open Browser Use extension prompt if Chrome asks.")
			return nil
		},
	}
	cmd.Flags().StringVar(&extensionID, "extension-id", defaultChromeExtensionID, "Chrome extension id for allowed_origins")
	cmd.Flags().StringVar(&binaryPath, "path", "", "native host binary target for the stable host link")
	cmd.Flags().StringVar(&externalExtensionOutput, "external-extension-output", "", "Chrome external extension JSON output path")
	cmd.AddCommand(newSetupReleaseCommand())
	return cmd
}

func newSetupReleaseCommand() *cobra.Command {
	extensionID := defaultChromeExtensionID
	var binaryPath string
	var zipPath string
	var noOpen bool
	cmd := &cobra.Command{
		Use:     "release",
		Aliases: []string{"offline"},
		Short:   "Register the native host and prepare the latest release extension",
		Args:    cobra.NoArgs,
		RunE: func(cmd *cobra.Command, _ []string) error {
			resolvedZIPPath := zipPath
			if resolvedZIPPath == "" {
				var err error
				resolvedZIPPath, err = downloadLatestReleaseZIP()
				if err != nil {
					return err
				}
			} else {
				var err error
				resolvedZIPPath, err = resolveExistingExtensionZIP(resolvedZIPPath)
				if err != nil {
					return err
				}
			}
			unpackedPath, unpackedExtensionID, err := installUnpackedExtension(resolvedZIPPath)
			if err != nil {
				return err
			}
			effectiveExtensionID := extensionID
			if !cmd.Flags().Changed("extension-id") {
				effectiveExtensionID = unpackedExtensionID
			}
			manifestPath, err := installNativeManifest(effectiveExtensionID, binaryPath, "")
			if err != nil {
				return err
			}
			if !noOpen {
				if err := openChromeExtensionsPage(); err != nil {
					return err
				}
			}
			fmt.Fprintf(cmd.OutOrStdout(), "Native messaging host manifest: %s\n", manifestPath)
			fmt.Fprintf(cmd.OutOrStdout(), "Chrome extension id: %s\n", effectiveExtensionID)
			fmt.Fprintf(cmd.OutOrStdout(), "Chrome extension ZIP: %s\n", resolvedZIPPath)
			fmt.Fprintf(cmd.OutOrStdout(), "Chrome extension directory: %s\n", unpackedPath)
			if noOpen {
				fmt.Fprintln(cmd.OutOrStdout(), "Open chrome://extensions, enable Developer mode, choose Load unpacked, and select the extension directory.")
			} else {
				fmt.Fprintln(cmd.OutOrStdout(), "In chrome://extensions, enable Developer mode, choose Load unpacked, and select the extension directory.")
			}
			return nil
		},
	}
	cmd.Flags().StringVar(&extensionID, "extension-id", defaultChromeExtensionID, "Chrome extension id for allowed_origins")
	cmd.Flags().StringVar(&binaryPath, "path", "", "native host binary target for the stable host link")
	cmd.Flags().StringVar(&zipPath, "zip", "", "existing extension zip path; defaults to the latest GitHub Release zip")
	cmd.Flags().BoolVar(&noOpen, "no-open", false, "download and unpack the extension without opening Chrome")
	return cmd
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

type setupResult struct {
	NativeManifestPath    string
	ExternalExtensionPath string
}

func setupChrome(extensionID string, binaryPath string, externalExtensionOutput string) (setupResult, error) {
	manifestPath, err := installNativeManifest(extensionID, binaryPath, "")
	if err != nil {
		return setupResult{}, err
	}
	extensionPath, err := installChromeExternalExtension(extensionID, externalExtensionOutput)
	if err != nil {
		return setupResult{}, err
	}
	return setupResult{
		NativeManifestPath:    manifestPath,
		ExternalExtensionPath: extensionPath,
	}, nil
}

func installChromeExternalExtension(extensionID string, outputPath string) (string, error) {
	allowedExtensionID := strings.TrimSpace(extensionID)
	if allowedExtensionID == "" {
		allowedExtensionID = defaultChromeExtensionID
	}
	path := outputPath
	if path == "" {
		var err error
		path, err = defaultChromeExternalExtensionPath(allowedExtensionID)
		if err != nil {
			return "", err
		}
	}
	manifest := map[string]any{
		"external_update_url": chromeWebStoreUpdateURL,
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return "", fmt.Errorf("failed to create Chrome external extension directory %q: %w", filepath.Dir(path), err)
	}
	payload, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return "", err
	}
	if err := os.WriteFile(path, append(payload, '\n'), 0o644); err != nil {
		return "", fmt.Errorf("failed to write Chrome external extension manifest %q: %w", path, err)
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

func defaultChromeExternalExtensionPath(extensionID string) (string, error) {
	filename := strings.TrimSpace(extensionID) + ".json"
	if filename == ".json" {
		return "", errors.New("Chrome extension id is empty")
	}
	switch runtime.GOOS {
	case "darwin":
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		return filepath.Join(home, "Library/Application Support/Google/Chrome/External Extensions", filename), nil
	case "linux":
		return filepath.Join("/opt/google/chrome/extensions", filename), nil
	default:
		return "", fmt.Errorf("Chrome external extension setup is not implemented for %s", runtime.GOOS)
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

func downloadLatestReleaseZIP() (string, error) {
	assetName := fmt.Sprintf("open-browser-use-chrome-extension-%s.zip", version)
	url := fmt.Sprintf(
		"https://github.com/iFurySt/open-codex-browser-use/releases/download/v%s/%s",
		version,
		assetName,
	)
	return downloadReleaseAsset(assetName, url)
}

func downloadReleaseAsset(name string, url string) (string, error) {
	cacheDir, err := os.UserCacheDir()
	if err != nil {
		return "", err
	}
	targetDir := filepath.Join(cacheDir, "open-browser-use", "extensions")
	if err := os.MkdirAll(targetDir, 0o700); err != nil {
		return "", err
	}
	targetPath := filepath.Join(targetDir, filepath.Base(name))
	request, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}
	request.Header.Set("User-Agent", "open-browser-use/"+version)
	client := http.Client{Timeout: 2 * time.Minute}
	response, err := client.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return "", fmt.Errorf("extension ZIP download failed: %s", response.Status)
	}
	tempPath := targetPath + ".tmp"
	file, err := os.OpenFile(tempPath, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o600)
	if err != nil {
		return "", err
	}
	_, copyErr := io.Copy(file, response.Body)
	closeErr := file.Close()
	if copyErr != nil {
		_ = os.Remove(tempPath)
		return "", copyErr
	}
	if closeErr != nil {
		_ = os.Remove(tempPath)
		return "", closeErr
	}
	if err := os.Rename(tempPath, targetPath); err != nil {
		_ = os.Remove(tempPath)
		return "", err
	}
	return targetPath, nil
}

func resolveExistingExtensionZIP(path string) (string, error) {
	absolutePath, err := filepath.Abs(path)
	if err != nil {
		return "", err
	}
	info, err := os.Stat(absolutePath)
	if err != nil {
		return "", err
	}
	if info.IsDir() {
		return "", fmt.Errorf("extension ZIP path is a directory: %s", absolutePath)
	}
	return absolutePath, nil
}

func installUnpackedExtension(zipPath string) (string, string, error) {
	targetDir, err := defaultUnpackedExtensionDir()
	if err != nil {
		return "", "", err
	}
	if err := os.RemoveAll(targetDir); err != nil {
		return "", "", err
	}
	if err := os.MkdirAll(targetDir, 0o700); err != nil {
		return "", "", err
	}
	if err := unzipExtension(zipPath, targetDir); err != nil {
		return "", "", err
	}
	extensionID, err := pinUnpackedExtensionKey(filepath.Join(targetDir, "manifest.json"))
	if err != nil {
		return "", "", err
	}
	return targetDir, extensionID, nil
}

func defaultUnpackedExtensionDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	switch runtime.GOOS {
	case "darwin":
		return filepath.Join(home, "Library/Application Support/OpenBrowserUse/chrome-extension/release"), nil
	case "linux":
		return filepath.Join(home, ".local/share/open-browser-use/chrome-extension/release"), nil
	default:
		return "", fmt.Errorf("release extension setup is not implemented for %s", runtime.GOOS)
	}
}

func unzipExtension(zipPath string, targetDir string) error {
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return err
	}
	defer reader.Close()
	cleanTargetDir, err := filepath.Abs(targetDir)
	if err != nil {
		return err
	}
	for _, file := range reader.File {
		targetPath := filepath.Join(cleanTargetDir, file.Name)
		if targetPath != cleanTargetDir && !strings.HasPrefix(targetPath, cleanTargetDir+string(os.PathSeparator)) {
			return fmt.Errorf("extension ZIP contains unsafe path: %s", file.Name)
		}
		if file.FileInfo().IsDir() {
			if err := os.MkdirAll(targetPath, 0o700); err != nil {
				return err
			}
			continue
		}
		if err := os.MkdirAll(filepath.Dir(targetPath), 0o700); err != nil {
			return err
		}
		source, err := file.Open()
		if err != nil {
			return err
		}
		destination, err := os.OpenFile(targetPath, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o600)
		if err != nil {
			_ = source.Close()
			return err
		}
		_, copyErr := io.Copy(destination, source)
		closeDestinationErr := destination.Close()
		closeSourceErr := source.Close()
		if copyErr != nil {
			return copyErr
		}
		if closeDestinationErr != nil {
			return closeDestinationErr
		}
		if closeSourceErr != nil {
			return closeSourceErr
		}
	}
	return nil
}

func pinUnpackedExtensionKey(manifestPath string) (string, error) {
	payload, err := os.ReadFile(manifestPath)
	if err != nil {
		return "", err
	}
	var manifest map[string]any
	if err := json.Unmarshal(payload, &manifest); err != nil {
		return "", err
	}
	key, _ := manifest["key"].(string)
	if strings.TrimSpace(key) == "" {
		key = offlineExtensionPublicKey
		manifest["key"] = key
		updated, err := json.MarshalIndent(manifest, "", "  ")
		if err != nil {
			return "", err
		}
		if err := os.WriteFile(manifestPath, append(updated, '\n'), 0o600); err != nil {
			return "", err
		}
	}
	return extensionIDFromPublicKey(key)
}

func extensionIDFromPublicKey(key string) (string, error) {
	der, err := base64.StdEncoding.DecodeString(strings.TrimSpace(key))
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(der)
	return extensionIDFromCRXID(sum[:16]), nil
}

func extensionIDFromCRX(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()
	prefix := make([]byte, 12)
	if _, err := io.ReadFull(file, prefix); err != nil {
		return "", err
	}
	if string(prefix[0:4]) != "Cr24" {
		return "", fmt.Errorf("CRX %s does not start with Cr24", path)
	}
	version := binary.LittleEndian.Uint32(prefix[4:8])
	if version != 3 {
		return "", fmt.Errorf("CRX %s uses unsupported version %d", path, version)
	}
	headerLength := binary.LittleEndian.Uint32(prefix[8:12])
	header := make([]byte, headerLength)
	if _, err := io.ReadFull(file, header); err != nil {
		return "", err
	}
	signedHeaderData, err := protobufBytesField(header, 10000)
	if err != nil {
		return "", err
	}
	crxID, err := protobufBytesField(signedHeaderData, 1)
	if err != nil {
		return "", err
	}
	if len(crxID) != 16 {
		return "", fmt.Errorf("CRX %s has invalid id length %d", path, len(crxID))
	}
	return extensionIDFromCRXID(crxID), nil
}

func protobufBytesField(payload []byte, wantedField uint64) ([]byte, error) {
	for offset := 0; offset < len(payload); {
		key, n, err := readVarint(payload[offset:])
		if err != nil {
			return nil, err
		}
		offset += n
		fieldNumber := key >> 3
		wireType := key & 0x7
		switch wireType {
		case 0:
			_, n, err := readVarint(payload[offset:])
			if err != nil {
				return nil, err
			}
			offset += n
		case 1:
			offset += 8
		case 2:
			length, n, err := readVarint(payload[offset:])
			if err != nil {
				return nil, err
			}
			offset += n
			if length > uint64(len(payload)-offset) {
				return nil, errors.New("protobuf bytes field exceeds payload")
			}
			end := offset + int(length)
			if fieldNumber == wantedField {
				return payload[offset:end], nil
			}
			offset = end
		case 5:
			offset += 4
		default:
			return nil, fmt.Errorf("unsupported protobuf wire type %d", wireType)
		}
		if offset > len(payload) {
			return nil, errors.New("protobuf field exceeds payload")
		}
	}
	return nil, fmt.Errorf("protobuf bytes field %d not found", wantedField)
}

func readVarint(payload []byte) (uint64, int, error) {
	var value uint64
	for i, b := range payload {
		if i == 10 {
			return 0, 0, errors.New("protobuf varint is too long")
		}
		value |= uint64(b&0x7f) << (7 * i)
		if b < 0x80 {
			return value, i + 1, nil
		}
	}
	return 0, 0, io.ErrUnexpectedEOF
}

func extensionIDFromCRXID(crxID []byte) string {
	const alphabet = "abcdefghijklmnop"
	var builder strings.Builder
	builder.Grow(len(crxID) * 2)
	for _, b := range crxID {
		builder.WriteByte(alphabet[(b>>4)&0x0f])
		builder.WriteByte(alphabet[b&0x0f])
	}
	return builder.String()
}

func openFile(path string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", "-a", "Google Chrome", path)
	case "linux":
		cmd = exec.Command("xdg-open", path)
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", path)
	default:
		return fmt.Errorf("opening files is not implemented for %s", runtime.GOOS)
	}
	if err := cmd.Start(); err != nil {
		return err
	}
	return cmd.Process.Release()
}

func openChromeExtensionsPage() error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", "-a", "Google Chrome", "chrome://extensions/")
	case "linux":
		cmd = exec.Command("xdg-open", "chrome://extensions/")
	default:
		return fmt.Errorf("opening Chrome extensions page is not implemented for %s", runtime.GOOS)
	}
	if err := cmd.Start(); err != nil {
		return err
	}
	return cmd.Process.Release()
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
