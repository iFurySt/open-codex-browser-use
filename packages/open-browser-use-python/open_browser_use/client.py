from __future__ import annotations

import json
import socket
import struct
import time
from dataclasses import dataclass
from typing import Any


JsonObject = dict[str, Any]


@dataclass
class OpenBrowserUseClient:
    socket_path: str
    session_id: str = "open-browser-use-python"
    turn_id: str | None = None
    timeout: float = 10.0

    def __post_init__(self) -> None:
        if self.turn_id is None:
            self.turn_id = f"turn-{time.time_ns()}"
        self._next_id = 1
        self._socket: socket.socket | None = None

    def connect(self) -> "OpenBrowserUseClient":
        if self._socket is None:
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            sock.settimeout(self.timeout)
            sock.connect(self.socket_path)
            self._socket = sock
        return self

    def close(self) -> None:
        if self._socket is not None:
            self._socket.close()
            self._socket = None

    def request(self, method: str, params: JsonObject | None = None) -> Any:
        self.connect()
        if self._socket is None:
            raise RuntimeError("Open Browser Use socket is not connected")
        request_id = self._next_id
        self._next_id += 1
        merged_params: JsonObject = {
            "session_id": self.session_id,
            "turn_id": self.turn_id,
        }
        if params:
            merged_params.update(params)
        request = {
            "jsonrpc": "2.0",
            "id": request_id,
            "method": method,
            "params": merged_params,
        }
        self._socket.sendall(encode_frame(request))
        response = read_frame(self._socket)
        if response.get("id") != request_id:
            raise RuntimeError(f"unexpected response id: {response.get('id')!r}")
        if "error" in response:
            message = response["error"].get("message", "Open Browser Use request failed")
            raise RuntimeError(message)
        return response.get("result")

    def get_info(self) -> Any:
        return self.request("getInfo")

    def create_tab(self) -> Any:
        return self.request("createTab")

    def get_tabs(self) -> Any:
        return self.request("getTabs")

    def attach(self, tab_id: int) -> Any:
        return self.request("attach", {"tabId": tab_id})

    def detach(self, tab_id: int) -> Any:
        return self.request("detach", {"tabId": tab_id})

    def execute_cdp(self, tab_id: int, method: str, command_params: JsonObject | None = None) -> Any:
        return self.request(
            "executeCdp",
            {
                "target": {"tabId": tab_id},
                "method": method,
                "commandParams": command_params or {},
            },
        )


def encode_frame(value: JsonObject) -> bytes:
    payload = json.dumps(value, separators=(",", ":")).encode("utf-8")
    return struct.pack(_native_u32(), len(payload)) + payload


def read_frame(sock: socket.socket) -> JsonObject:
    header = _read_exact(sock, 4)
    (length,) = struct.unpack(_native_u32(), header)
    payload = _read_exact(sock, length)
    value = json.loads(payload.decode("utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError("Open Browser Use response must be a JSON object")
    return value


def _read_exact(sock: socket.socket, length: int) -> bytes:
    chunks: list[bytes] = []
    remaining = length
    while remaining > 0:
        chunk = sock.recv(remaining)
        if not chunk:
            raise EOFError("Open Browser Use socket closed")
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)


def _native_u32() -> str:
    return "=I"
