package main

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/ifuryst/open-codex-browser-use/internal/host"
	"github.com/ifuryst/open-codex-browser-use/internal/wire"
)

func TestNativeHostNameIsChromeCompatible(t *testing.T) {
	valid := regexp.MustCompile(`^[a-z0-9_]+(\.[a-z0-9_]+)*$`)
	if !valid.MatchString(host.NativeHostName) {
		t.Fatalf("native host name is not Chrome-compatible: %q", host.NativeHostName)
	}
}

func TestNativeMessagingLaunchArg(t *testing.T) {
	if !isNativeMessagingLaunch("chrome-extension://nfjjgckfgejeofdcmaepbapclmldcflf/") {
		t.Fatal("expected Chrome extension origin to launch host mode")
	}
	if isNativeMessagingLaunch("host") {
		t.Fatal("expected CLI subcommand not to be treated as native messaging launch")
	}
}

func TestCobraVersionCommand(t *testing.T) {
	cmd := newRootCommand()
	var output bytes.Buffer
	cmd.SetOut(&output)
	cmd.SetArgs([]string{"version"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
	if got := strings.TrimSpace(output.String()); got != version {
		t.Fatalf("expected version %q, got %q", version, got)
	}
}

func TestCobraNoArgsPrintsVersionAndExtensionStatus(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)

	cmd := newRootCommand()
	var output bytes.Buffer
	cmd.SetOut(&output)
	cmd.SetArgs([]string{})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
	got := output.String()
	if !strings.Contains(got, "📦 CLI version: "+version) {
		t.Fatalf("expected no-arg output to include CLI version, got %q", got)
	}
	if !strings.Contains(got, "🧩 Browser extension:") {
		t.Fatalf("expected no-arg output to include browser extension status, got %q", got)
	}
	if !strings.Contains(got, "open-browser-use setup") && !strings.Contains(got, "open-browser-use user-tabs") {
		t.Fatalf("expected no-arg output to include a setup or ready next step, got %q", got)
	}
}

func TestCobraVersionFlag(t *testing.T) {
	cmd := newRootCommand()
	var output bytes.Buffer
	cmd.SetOut(&output)
	cmd.SetArgs([]string{"-v"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
	if got := strings.TrimSpace(output.String()); got != version {
		t.Fatalf("expected version %q, got %q", version, got)
	}
}

func TestNativeManifestDefaultsToStoreExtensionAndStableHostPath(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)

	manifest, err := nativeManifest("", "")
	if err != nil {
		t.Fatal(err)
	}
	origins, ok := manifest["allowed_origins"].([]string)
	if !ok || len(origins) != 1 {
		t.Fatalf("expected one allowed origin, got %#v", manifest["allowed_origins"])
	}
	if origins[0] != "chrome-extension://"+defaultChromeExtensionID+"/" {
		t.Fatalf("expected default extension origin, got %q", origins[0])
	}
	hostPath, err := stableNativeHostPath()
	if err != nil {
		t.Fatal(err)
	}
	if manifest["path"] != hostPath {
		t.Fatalf("expected manifest path %q, got %#v", hostPath, manifest["path"])
	}
}

func TestInstallNativeManifestCreatesStableLink(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("stable native host link is not implemented on windows")
	}
	home := t.TempDir()
	t.Setenv("HOME", home)
	targetPath := filepath.Join(t.TempDir(), "open-browser-use")
	if err := os.WriteFile(targetPath, []byte("#!/bin/sh\nexit 0\n"), 0o755); err != nil {
		t.Fatal(err)
	}

	manifestPath, err := installNativeManifest("", targetPath, "")
	if err != nil {
		t.Fatal(err)
	}
	hostPath, err := stableNativeHostPath()
	if err != nil {
		t.Fatal(err)
	}
	linkTarget, err := os.Readlink(hostPath)
	if err != nil {
		t.Fatal(err)
	}
	if linkTarget != targetPath {
		t.Fatalf("expected stable link to point at %q, got %q", targetPath, linkTarget)
	}
	payload, err := os.ReadFile(manifestPath)
	if err != nil {
		t.Fatal(err)
	}
	var manifest map[string]any
	if err := json.Unmarshal(payload, &manifest); err != nil {
		t.Fatal(err)
	}
	if manifest["path"] != hostPath {
		t.Fatalf("expected manifest path %q, got %#v", hostPath, manifest["path"])
	}
}

func TestCobraInstallManifestDefaultsToStoreExtension(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("stable native host link is not implemented on windows")
	}
	home := t.TempDir()
	t.Setenv("HOME", home)
	targetPath := filepath.Join(t.TempDir(), "open-browser-use")
	if err := os.WriteFile(targetPath, []byte("#!/bin/sh\nexit 0\n"), 0o755); err != nil {
		t.Fatal(err)
	}

	cmd := newRootCommand()
	var output bytes.Buffer
	cmd.SetOut(&output)
	cmd.SetArgs([]string{"install-manifest", "--path", targetPath})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}

	manifestPath := strings.TrimSpace(output.String())
	payload, err := os.ReadFile(manifestPath)
	if err != nil {
		t.Fatal(err)
	}
	var manifest map[string]any
	if err := json.Unmarshal(payload, &manifest); err != nil {
		t.Fatal(err)
	}
	origins, ok := manifest["allowed_origins"].([]any)
	if !ok || len(origins) != 1 {
		t.Fatalf("expected one allowed origin, got %#v", manifest["allowed_origins"])
	}
	if origins[0] != "chrome-extension://"+defaultChromeExtensionID+"/" {
		t.Fatalf("expected default extension origin, got %#v", origins[0])
	}
}

func TestInstallChromeExternalExtensionWritesWebStoreHint(t *testing.T) {
	outputPath := filepath.Join(t.TempDir(), defaultChromeExtensionID+".json")
	path, err := installChromeExternalExtension("", outputPath)
	if err != nil {
		t.Fatal(err)
	}
	if path != outputPath {
		t.Fatalf("expected output path %q, got %q", outputPath, path)
	}
	payload, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var manifest map[string]any
	if err := json.Unmarshal(payload, &manifest); err != nil {
		t.Fatal(err)
	}
	if manifest["external_update_url"] != chromeWebStoreUpdateURL {
		t.Fatalf("expected Chrome Web Store update URL, got %#v", manifest["external_update_url"])
	}
}

func TestCobraSetupWritesNativeAndExternalManifests(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("stable native host link is not implemented on windows")
	}
	home := t.TempDir()
	t.Setenv("HOME", home)
	targetPath := filepath.Join(t.TempDir(), "open-browser-use")
	if err := os.WriteFile(targetPath, []byte("#!/bin/sh\nexit 0\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	externalPath := filepath.Join(t.TempDir(), defaultChromeExtensionID+".json")

	cmd := newRootCommand()
	var output bytes.Buffer
	cmd.SetOut(&output)
	cmd.SetArgs([]string{"setup", "--path", targetPath, "--external-extension-output", externalPath, "--no-open"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(output.String(), "✅ Open Browser Use setup") {
		t.Fatalf("expected setup output to mention native manifest, got %q", output.String())
	}
	if !strings.Contains(output.String(), "Registered native host") {
		t.Fatalf("expected setup output to mention native host registration, got %q", output.String())
	}
	if !strings.Contains(output.String(), "Browser extension") {
		t.Fatalf("expected setup output to mention browser extension status, got %q", output.String())
	}
	if !strings.Contains(output.String(), chromeWebStoreExtensionURL) {
		t.Fatalf("expected setup output to mention Chrome Web Store URL, got %q", output.String())
	}
	if _, err := os.Stat(filepath.Join(home, "Library/Application Support/Google/Chrome/NativeMessagingHosts", host.NativeHostName+".json")); runtime.GOOS == "darwin" && err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(externalPath); err != nil {
		t.Fatal(err)
	}
}

func TestCobraSetupBetaUsesProvidedZIP(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("stable native host link is not implemented on windows")
	}
	home := t.TempDir()
	t.Setenv("HOME", home)
	targetPath := filepath.Join(t.TempDir(), "open-browser-use")
	if err := os.WriteFile(targetPath, []byte("#!/bin/sh\nexit 0\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	zipPath := filepath.Join(t.TempDir(), "open-browser-use-chrome-extension.zip")
	expectedExtensionID, err := extensionIDFromPublicKey(betaExtensionPublicKey)
	if err != nil {
		t.Fatal(err)
	}
	if err := writeTestExtensionZIP(zipPath); err != nil {
		t.Fatal(err)
	}

	cmd := newRootCommand()
	var output bytes.Buffer
	cmd.SetOut(&output)
	cmd.SetArgs([]string{"setup", "beta", "--path", targetPath, "--zip", zipPath, "--no-open"})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
	got := output.String()
	if !strings.Contains(got, "ZIP:") || !strings.Contains(got, zipPath) {
		t.Fatalf("expected setup beta output to mention install ZIP path, got %q", got)
	}
	if strings.Contains(got, "-manual.zip") {
		t.Fatalf("expected setup beta output to avoid a separate manual ZIP path, got %q", got)
	}
	if !strings.Contains(got, "Extension id: "+expectedExtensionID) {
		t.Fatalf("expected setup beta output to mention unpacked extension id, got %q", got)
	}
	if !strings.Contains(got, "Drag the ZIP file into the Chrome extensions page") && !strings.Contains(got, "All set.") {
		t.Fatalf("expected setup beta output to mention manual install or connected status, got %q", got)
	}
	manifestPath := filepath.Join(home, "Library/Application Support/Google/Chrome/NativeMessagingHosts", host.NativeHostName+".json")
	if runtime.GOOS == "linux" {
		manifestPath = filepath.Join(home, ".config/google-chrome/NativeMessagingHosts", host.NativeHostName+".json")
	}
	payload, err := os.ReadFile(manifestPath)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(payload), "chrome-extension://"+expectedExtensionID+"/") {
		t.Fatalf("expected native manifest to allow unpacked extension id, got %s", payload)
	}
	unpackedPath, err := defaultUnpackedExtensionDir()
	if err != nil {
		t.Fatal(err)
	}
	unpackedManifest, err := os.ReadFile(filepath.Join(unpackedPath, "manifest.json"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(unpackedManifest), betaExtensionPublicKey) {
		t.Fatalf("expected unpacked manifest to include stable key, got %s", unpackedManifest)
	}
	installManifest, err := readManifestFromZIP(zipPath)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(installManifest), betaExtensionPublicKey) {
		t.Fatalf("expected install ZIP manifest to include stable key, got %s", installManifest)
	}
}

func TestDetectInstalledChromeExtensionFromProfile(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	profileRoot := filepath.Join(home, "Library/Application Support/Google/Chrome/Default/Extensions", defaultChromeExtensionID, "0.1.10")
	if runtime.GOOS == "linux" {
		profileRoot = filepath.Join(home, ".config/google-chrome/Default/Extensions", defaultChromeExtensionID, "0.1.10")
	}
	if runtime.GOOS == "windows" {
		t.Skip("Chrome profile detection is not implemented on windows")
	}
	if err := os.MkdirAll(profileRoot, 0o700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(profileRoot, "manifest.json"), []byte(`{"version":"0.1.10"}`), 0o600); err != nil {
		t.Fatal(err)
	}

	detected, ok := detectInstalledChromeExtension()
	if !ok {
		t.Fatal("expected installed extension to be detected")
	}
	if detected.ExtensionID != defaultChromeExtensionID {
		t.Fatalf("expected extension id %q, got %q", defaultChromeExtensionID, detected.ExtensionID)
	}
	if detected.Version != "0.1.10" {
		t.Fatalf("expected version 0.1.10, got %q", detected.Version)
	}
}

func TestCompareChromeVersions(t *testing.T) {
	tests := []struct {
		left  string
		right string
		want  int
	}{
		{left: "0.1.15", right: "0.1.11", want: 1},
		{left: "0.1.15", right: "0.1.15", want: 0},
		{left: "0.1.11", right: "0.1.15", want: -1},
		{left: "0.1", right: "0.1.0", want: 0},
	}
	for _, test := range tests {
		got := compareChromeVersions(test.left, test.right)
		if got != test.want {
			t.Fatalf("compareChromeVersions(%q, %q) = %d, want %d", test.left, test.right, got, test.want)
		}
	}
}

func TestBrowserExtensionStatusSummaries(t *testing.T) {
	ready := browserExtensionStatus{
		Installed:       true,
		Reachable:       true,
		Version:         version,
		ExpectedVersion: version,
	}
	if got := ready.summary(); !strings.Contains(got, "Ready") || !strings.Contains(got, version) {
		t.Fatalf("expected ready summary with version, got %q", got)
	}

	outdated := browserExtensionStatus{
		Installed:       true,
		Version:         "0.1.0",
		ExpectedVersion: version,
		UpgradeCommand:  "open-browser-use setup",
	}
	if got := outdated.summary(); !strings.Contains(got, "CLI expects v"+version) || !strings.Contains(got, "open-browser-use setup") {
		t.Fatalf("expected upgrade summary with command, got %q", got)
	}
}

func TestCobraUnknownCommand(t *testing.T) {
	cmd := newRootCommand()
	cmd.SetArgs([]string{"does-not-exist"})
	if err := cmd.Execute(); err == nil {
		t.Fatal("expected unknown command to fail")
	}
}

func TestInvokeRemovesStaleActiveSocketRecord(t *testing.T) {
	socketDir := t.TempDir()
	socketPath := filepath.Join(socketDir, "missing.sock")
	if err := host.WriteActiveSocketRecord(socketDir, socketPath); err != nil {
		t.Fatal(err)
	}

	_, err := invoke("", socketDir, "getInfo", map[string]any{}, 10*time.Millisecond)
	if err == nil {
		t.Fatal("expected stale active socket to fail")
	}
	if !strings.Contains(err.Error(), "removed stale registry entry") {
		t.Fatalf("expected stale registry cleanup error, got %v", err)
	}
	if _, err := host.ReadActiveSocketRecord(socketDir); err == nil {
		t.Fatal("expected stale active socket record to be removed")
	}
}

func TestInvokeScansSocketDirWhenActiveRecordMissing(t *testing.T) {
	socketDir, err := os.MkdirTemp("/tmp", "obu-socket-test-")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(socketDir)
	stalePath := filepath.Join(socketDir, "stale.sock")
	staleListener, err := net.Listen("unix", stalePath)
	if err != nil {
		t.Fatal(err)
	}
	if err := staleListener.Close(); err != nil {
		t.Fatal(err)
	}
	socketPath := filepath.Join(socketDir, "live.sock")
	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		t.Fatal(err)
	}
	defer listener.Close()

	serverDone := make(chan error, 1)
	go func() {
		conn, err := listener.Accept()
		if err != nil {
			serverDone <- err
			return
		}
		defer conn.Close()

		var request map[string]any
		if err := wire.ReadJSON(conn, &request); err != nil {
			serverDone <- err
			return
		}
		if request["method"] != "getInfo" {
			serverDone <- fmt.Errorf("expected getInfo request, got %#v", request["method"])
			return
		}
		if err := wire.WriteJSON(conn, map[string]any{
			"jsonrpc": "2.0",
			"id":      request["id"],
			"result":  map[string]any{"version": version},
		}); err != nil {
			serverDone <- err
			return
		}
		serverDone <- nil
	}()

	response, err := invoke("", socketDir, "getInfo", map[string]any{}, time.Second)
	if err != nil {
		t.Fatal(err)
	}
	result, _ := response["result"].(map[string]any)
	if result["version"] != version {
		t.Fatalf("expected scanned socket response, got %#v", response)
	}
	if err := <-serverDone; err != nil {
		t.Fatal(err)
	}
	record, err := host.ReadActiveSocketRecord(socketDir)
	if err != nil {
		t.Fatal(err)
	}
	if record.SocketPath != socketPath {
		t.Fatalf("expected active socket record to be repaired to %q, got %#v", socketPath, record)
	}
	if record.PID != 0 {
		t.Fatalf("expected repaired active socket pid to be unknown, got %d", record.PID)
	}
	if _, err := os.Stat(stalePath); !os.IsNotExist(err) {
		t.Fatalf("expected stale socket file to be removed after fallback success, got %v", err)
	}
}

func TestInvokeCleansStaleSocketFilesDuringScan(t *testing.T) {
	socketDir, err := os.MkdirTemp("/tmp", "obu-socket-test-")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(socketDir)

	stalePath := filepath.Join(socketDir, "stale.sock")
	staleListener, err := net.Listen("unix", stalePath)
	if err != nil {
		t.Fatal(err)
	}
	if err := staleListener.Close(); err != nil {
		t.Fatal(err)
	}
	if err := host.WriteActiveSocketRecord(socketDir, stalePath); err != nil {
		t.Fatal(err)
	}

	livePath := filepath.Join(socketDir, "live.sock")
	listener, err := net.Listen("unix", livePath)
	if err != nil {
		t.Fatal(err)
	}
	defer listener.Close()

	serverDone := make(chan error, 1)
	go func() {
		conn, err := listener.Accept()
		if err != nil {
			serverDone <- err
			return
		}
		defer conn.Close()

		var request map[string]any
		if err := wire.ReadJSON(conn, &request); err != nil {
			serverDone <- err
			return
		}
		if err := wire.WriteJSON(conn, map[string]any{
			"jsonrpc": "2.0",
			"id":      request["id"],
			"result":  map[string]any{"version": version},
		}); err != nil {
			serverDone <- err
			return
		}
		serverDone <- nil
	}()

	if _, err := invoke("", socketDir, "getInfo", map[string]any{}, time.Second); err != nil {
		t.Fatal(err)
	}
	if err := <-serverDone; err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(stalePath); !os.IsNotExist(err) {
		t.Fatalf("expected stale socket file to be removed, got %v", err)
	}
	record, err := host.ReadActiveSocketRecord(socketDir)
	if err != nil {
		t.Fatal(err)
	}
	if record.SocketPath != livePath {
		t.Fatalf("expected active socket record to point to live socket %q, got %#v", livePath, record)
	}
}

func TestCobraRunActionPlan(t *testing.T) {
	socketPath := filepath.Join(t.TempDir(), "obu.sock")
	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		t.Fatal(err)
	}
	defer listener.Close()

	requests := make(chan map[string]any, 16)
	serverDone := make(chan error, 1)
	go func() {
		defer close(requests)
		var sessionID string
		var turnID string
		for count := 0; count < 10; count++ {
			conn, err := listener.Accept()
			if err != nil {
				serverDone <- err
				return
			}
			var request map[string]any
			if err := wire.ReadJSON(conn, &request); err != nil {
				_ = conn.Close()
				serverDone <- err
				return
			}
			params, _ := request["params"].(map[string]any)
			if sessionID == "" {
				sessionID, _ = params["session_id"].(string)
				turnID, _ = params["turn_id"].(string)
			}
			if params["session_id"] != sessionID || params["turn_id"] != turnID {
				_ = conn.Close()
				serverDone <- errors.New("run action requests did not share session and turn")
				return
			}
			requests <- request

			method, _ := request["method"].(string)
			cdpMethod, _ := params["method"].(string)
			result := map[string]any{}
			switch {
			case method == "createTab":
				result = map[string]any{"id": 123}
			case method == "executeCdp" && cdpMethod == "Runtime.evaluate":
				commandParams, _ := params["commandParams"].(map[string]any)
				expression, _ := commandParams["expression"].(string)
				if expression == "document.readyState" {
					result = map[string]any{"result": map[string]any{"value": "interactive"}}
				} else {
					result = map[string]any{"result": map[string]any{"value": map[string]any{
						"title":      "Browser Use Docs",
						"url":        "https://docs.browser-use.com",
						"readyState": "interactive",
						"text":       "Docs",
					}}}
				}
			}
			if err := wire.WriteJSON(conn, map[string]any{
				"jsonrpc": "2.0",
				"id":      request["id"],
				"result":  result,
			}); err != nil {
				_ = conn.Close()
				serverDone <- err
				return
			}
			_ = conn.Close()
		}
		serverDone <- nil
	}()

	cmd := newRootCommand()
	var output bytes.Buffer
	cmd.SetOut(&output)
	cmd.SetArgs([]string{
		"run",
		"--socket", socketPath,
		"--timeout", "100ms",
		"-c", `
name-session "Docs scan - OBU"
open-tab https://docs.browser-use.com
wait-load domcontentloaded
page-info
finalize-tabs []
`,
	})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
	if err := <-serverDone; err != nil {
		t.Fatal(err)
	}

	var got actionRunOutput
	if err := json.Unmarshal(output.Bytes(), &got); err != nil {
		t.Fatal(err)
	}
	if got.CurrentTabID != 123 {
		t.Fatalf("expected current tab id 123, got %d", got.CurrentTabID)
	}
	if len(got.Steps) != 5 {
		t.Fatalf("expected 5 action steps, got %d", len(got.Steps))
	}
	if got.Steps[1].Action != "open-tab" || got.Steps[1].TabID != 123 {
		t.Fatalf("expected open-tab step to capture tab id, got %#v", got.Steps[1])
	}

	var methods []string
	var sessions []string
	for request := range requests {
		method, _ := request["method"].(string)
		params, _ := request["params"].(map[string]any)
		sessionID, _ := params["session_id"].(string)
		sessions = append(sessions, sessionID)
		if cdpMethod, _ := params["method"].(string); cdpMethod != "" {
			method += ":" + cdpMethod
		}
		methods = append(methods, method)
	}
	want := []string{
		"nameSession",
		"createTab",
		"attach",
		"executeCdp:Page.navigate",
		"attach",
		"executeCdp:Page.enable",
		"executeCdp:Runtime.evaluate",
		"attach",
		"executeCdp:Runtime.evaluate",
		"finalizeTabs",
	}
	if strings.Join(methods, ",") != strings.Join(want, ",") {
		t.Fatalf("expected methods %v, got %v", want, methods)
	}
	for _, sessionID := range sessions {
		if sessionID != defaultCLISessionID {
			t.Fatalf("expected run action plan to use CLI session %q, got %q", defaultCLISessionID, sessionID)
		}
	}
}

func TestInvokeWithOptionsUsesSessionID(t *testing.T) {
	socketPath := filepath.Join(os.TempDir(), fmt.Sprintf("obu-test-%d.sock", time.Now().UnixNano()))
	defer os.Remove(socketPath)
	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		t.Fatal(err)
	}
	defer listener.Close()

	requests := make(chan map[string]any, 1)
	serverDone := make(chan error, 1)
	go func() {
		conn, err := listener.Accept()
		if err != nil {
			serverDone <- err
			return
		}
		defer conn.Close()
		var request map[string]any
		if err := wire.ReadJSON(conn, &request); err != nil {
			serverDone <- err
			return
		}
		requests <- request
		if err := wire.WriteJSON(conn, map[string]any{
			"jsonrpc": "2.0",
			"id":      request["id"],
			"result":  []any{},
		}); err != nil {
			serverDone <- err
			return
		}
		serverDone <- nil
	}()

	if _, err := invokeWithOptions(socketOptions{
		socketPath: socketPath,
		timeout:    time.Second,
		sessionID:  "custom-cli-session",
	}, "getTabs", map[string]any{}); err != nil {
		t.Fatal(err)
	}
	if err := <-serverDone; err != nil {
		t.Fatal(err)
	}
	request := <-requests
	params, _ := request["params"].(map[string]any)
	if params["session_id"] != "custom-cli-session" {
		t.Fatalf("expected custom session id, got %#v", params["session_id"])
	}
}

func testCRX(crxID []byte) []byte {
	signedHeaderData := testProtoBytes(1, crxID)
	header := testProtoBytes(10000, signedHeaderData)
	prefix := make([]byte, 12)
	copy(prefix[0:4], "Cr24")
	prefix[4] = 3
	prefix[8] = byte(len(header))
	prefix[9] = byte(len(header) >> 8)
	prefix[10] = byte(len(header) >> 16)
	prefix[11] = byte(len(header) >> 24)
	return append(append(prefix, header...), []byte("zip")...)
}

func testProtoBytes(fieldNumber uint64, value []byte) []byte {
	key := testVarint((fieldNumber << 3) | 2)
	length := testVarint(uint64(len(value)))
	payload := append(key, length...)
	return append(payload, value...)
}

func testVarint(value uint64) []byte {
	var out []byte
	for value > 0x7f {
		out = append(out, byte(value&0x7f)|0x80)
		value >>= 7
	}
	return append(out, byte(value))
}

func writeTestExtensionZIP(path string) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()
	writer := zip.NewWriter(file)
	files := map[string]string{
		"manifest.json": `{"manifest_version":3,"name":"Open Browser Use","version":"0.1.0","background":{"service_worker":"background.js"},"permissions":["nativeMessaging"]}`,
		"background.js": "chrome.runtime.onInstalled.addListener(() => {});\n",
	}
	for name, content := range files {
		entry, err := writer.Create(name)
		if err != nil {
			_ = writer.Close()
			return err
		}
		if _, err := entry.Write([]byte(content)); err != nil {
			_ = writer.Close()
			return err
		}
	}
	return writer.Close()
}

func readManifestFromZIP(path string) ([]byte, error) {
	reader, err := zip.OpenReader(path)
	if err != nil {
		return nil, err
	}
	defer reader.Close()
	for _, file := range reader.File {
		if file.Name != "manifest.json" {
			continue
		}
		source, err := file.Open()
		if err != nil {
			return nil, err
		}
		payload, readErr := io.ReadAll(source)
		closeErr := source.Close()
		if readErr != nil {
			return nil, readErr
		}
		return payload, closeErr
	}
	return nil, errors.New("manifest.json not found in ZIP")
}
