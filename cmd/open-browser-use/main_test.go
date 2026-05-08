package main

import (
	"regexp"
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
