# Open Browser Use CLI

This npm package installs the `open-browser-use` native host and CLI binary.
It also exposes the short `obu` command.

```sh
npm install -g open-browser-use
obu version
```

The package contains prebuilt Go binaries for macOS, Linux, and Windows on
`amd64` and `arm64`.

On macOS and Linux, package installation attempts to register the Chrome native
messaging host automatically for the Chrome Web Store extension. If the Chrome
extension reports that the native host was not found, repair registration with:

```sh
open-browser-use install-manifest
```
