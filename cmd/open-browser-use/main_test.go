package main

import (
	"bytes"
	"regexp"
	"strings"
	"testing"

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

func TestCobraUnknownCommand(t *testing.T) {
	cmd := newRootCommand()
	cmd.SetArgs([]string{"does-not-exist"})
	if err := cmd.Execute(); err == nil {
		t.Fatal("expected unknown command to fail")
	}
}
