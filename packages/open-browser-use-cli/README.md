# Open Browser Use CLI

This npm package installs the `open-browser-use` native host and CLI binary.
It also exposes the short `obu` command.

```sh
npm install -g open-browser-use
obu version
```

The package contains prebuilt Go binaries for macOS, Linux, and Windows on
`amd64` and `arm64`.

After installation, run setup to register the Chrome native messaging host and
the Chrome extension install hint:

```sh
open-browser-use setup
```

While the Chrome Web Store item is pending review, use the latest GitHub Release
CRX instead:

```sh
open-browser-use setup release
```
