#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <version> <sha256>" >&2
  exit 1
fi

version="$1"
sha256="$2"

cat <<EOF
class OpenBrowserUse < Formula
  desc "Browser automation native host and CLI"
  homepage "https://github.com/iFurySt/open-codex-browser-use"
  url "https://github.com/iFurySt/open-codex-browser-use/archive/refs/tags/v${version}.tar.gz"
  sha256 "${sha256}"
  license "MIT"

  depends_on "go" => :build

  def install
    system "go", "build", *std_go_args(ldflags: "-s -w"), "./cmd/open-browser-use"
    bin.install_symlink "open-browser-use" => "obu"
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/open-browser-use version")
    assert_match version.to_s, shell_output("#{bin}/obu version")
  end

  def caveats
    <<~EOS
      执行以下命令安装：

        open-browser-use setup beta
    EOS
  end
end
EOF
