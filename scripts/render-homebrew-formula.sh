#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -ne 5 ]; then
  echo "usage: $0 <version> <darwin-amd64-sha256> <darwin-arm64-sha256> <linux-amd64-sha256> <linux-arm64-sha256>" >&2
  exit 1
fi

version="$1"
darwin_amd64_sha256="$2"
darwin_arm64_sha256="$3"
linux_amd64_sha256="$4"
linux_arm64_sha256="$5"

cat <<EOF
class OpenBrowserUse < Formula
  desc "Browser automation native host and CLI"
  homepage "https://github.com/iFurySt/open-browser-use"
  license "MIT"
  version "${version}"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/iFurySt/open-browser-use/releases/download/v${version}/open-browser-use-cli-${version}-darwin-arm64.tar.gz"
      sha256 "${darwin_arm64_sha256}"
    else
      url "https://github.com/iFurySt/open-browser-use/releases/download/v${version}/open-browser-use-cli-${version}-darwin-amd64.tar.gz"
      sha256 "${darwin_amd64_sha256}"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/iFurySt/open-browser-use/releases/download/v${version}/open-browser-use-cli-${version}-linux-arm64.tar.gz"
      sha256 "${linux_arm64_sha256}"
    else
      url "https://github.com/iFurySt/open-browser-use/releases/download/v${version}/open-browser-use-cli-${version}-linux-amd64.tar.gz"
      sha256 "${linux_amd64_sha256}"
    end
  end

  def install
    bin.install "open-browser-use"
    bin.install_symlink "open-browser-use" => "obu"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/open-browser-use version")
    assert_match version.to_s, shell_output("#{bin}/obu version")
  end

  def caveats
    <<~EOS
      Run the following command to install:

        open-browser-use setup
    EOS
  end
end
EOF
