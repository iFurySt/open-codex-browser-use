#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
package_dir="${repo_root}/packages/open-browser-use-cli"
native_dir="${package_dir}/native"

rm -rf "${native_dir}"
mkdir -p "${native_dir}"

targets=(
  "darwin/amd64"
  "darwin/arm64"
  "linux/amd64"
  "linux/arm64"
  "windows/amd64"
  "windows/arm64"
)

for target in "${targets[@]}"; do
  goos="${target%/*}"
  goarch="${target#*/}"
  output_dir="${native_dir}/${goos}-${goarch}"
  output_name="open-browser-use"
  if [ "${goos}" = "windows" ]; then
    output_name="${output_name}.exe"
  fi
  mkdir -p "${output_dir}"
  (
    cd "${repo_root}"
    CGO_ENABLED=0 GOOS="${goos}" GOARCH="${goarch}" \
      go build -trimpath -ldflags="-s -w" -o "${output_dir}/${output_name}" ./cmd/open-browser-use
  )
done
