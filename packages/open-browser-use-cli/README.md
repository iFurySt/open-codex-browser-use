# Open Browser Use CLI

This npm package installs the `open-browser-use` native host and CLI binary.
It also exposes the short `obu` command.

```sh
npm install -g open-browser-use
obu version
```

The package contains prebuilt Go binaries for macOS, Linux, and Windows on
`amd64` and `arm64`.

Run `open-browser-use` with no subcommand to print the CLI version, browser
extension status, extension version when available, and the next setup or
upgrade command.

After installation, run setup to register the Chrome native messaging host and
guide Chrome extension installation:

```sh
open-browser-use setup
```

While the Chrome Web Store item is pending review, use the latest GitHub Release
zip as an unpacked extension instead:

```sh
open-browser-use setup release
```

That command opens `chrome://extensions/` and reveals the downloaded ZIP so the
user can drag it into Chrome for manual installation.
