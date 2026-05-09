package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/ifuryst/open-browser-use/internal/host"
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

func TestCobraNoArgsPrintsVersionAndUsage(t *testing.T) {
	cmd := newRootCommand()
	var output bytes.Buffer
	cmd.SetOut(&output)
	cmd.SetArgs([]string{})
	if err := cmd.Execute(); err != nil {
		t.Fatal(err)
	}
	got := output.String()
	if !strings.Contains(got, "Open Browser Use "+version) {
		t.Fatalf("expected no-arg output to include version, got %q", got)
	}
	if !strings.Contains(got, "Usage:") {
		t.Fatalf("expected no-arg output to include usage, got %q", got)
	}
	if !strings.Contains(got, "host") {
		t.Fatalf("expected no-arg output to mention host command, got %q", got)
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
