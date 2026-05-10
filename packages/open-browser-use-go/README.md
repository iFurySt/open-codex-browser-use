# Open Browser Use Go SDK

Go client for controlling a real Chrome profile through Open Browser Use. The
package keeps the low-level JSON-RPC/CDP surface available and also provides
higher-level browser/tab helpers for common agent workflows.

## Installation

```sh
go get github.com/ifuryst/open-browser-use/packages/open-browser-use-go
```

The SDK expects the `open-browser-use` CLI and Chrome extension to already be
installed and connected:

```sh
open-browser-use ping
open-browser-use info
```

## Usage

```go
package main

import (
	"fmt"
	"log"
	"time"

	obu "github.com/ifuryst/open-browser-use/packages/open-browser-use-go"
)

func main() {
	browser, err := obu.ConnectActive(obu.Options{
		SessionID: "go-sdk-example",
		Timeout:   20 * time.Second,
	})
	if err != nil {
		log.Fatal(err)
	}
	defer browser.Close()

	defer browser.Client.FinalizeTabs(nil)

	if _, err := browser.Client.NameSession("Go SDK example - OBU"); err != nil {
		log.Fatal(err)
	}

	tab, err := browser.NewTab()
	if err != nil {
		log.Fatal(err)
	}

	if _, err := tab.Goto("https://example.com", obu.GotoOptions{
		WaitUntil: obu.LoadStateDOMContentLoaded,
		Timeout:   15 * time.Second,
	}); err != nil {
		log.Fatal(err)
	}

	title, err := tab.Title()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(title)
}
```

Use `Client.Request(method, params)` when you need an unrestricted Browser Use
JSON-RPC call, or `Client.ExecuteCDP` / `Browser.CDP.Call` for raw CDP commands.
