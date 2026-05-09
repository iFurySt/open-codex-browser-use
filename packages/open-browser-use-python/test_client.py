import json
import socket
import struct
import tempfile
import threading
import unittest
from pathlib import Path

from open_browser_use.client import OpenBrowserUseClient, encode_frame


class OpenBrowserUseClientTest(unittest.TestCase):
    def test_encode_frame(self) -> None:
        frame = encode_frame({"id": 1, "method": "getInfo"})
        (length,) = struct.unpack("=I", frame[:4])
        self.assertEqual(length, len(frame) - 4)
        self.assertEqual(json.loads(frame[4:]), {"id": 1, "method": "getInfo"})

    def test_request_round_trip(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            socket_path = str(Path(directory) / "obu.sock")
            server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            server.bind(socket_path)
            server.listen(1)

            def serve_once() -> None:
                conn, _ = server.accept()
                with conn:
                    header = conn.recv(4)
                    (length,) = struct.unpack("=I", header)
                    payload = conn.recv(length)
                    request = json.loads(payload)
                    response = {
                        "jsonrpc": "2.0",
                        "id": request["id"],
                        "result": {"name": "Open Browser Use"},
                    }
                    conn.sendall(encode_frame(response))
                server.close()

            thread = threading.Thread(target=serve_once)
            thread.start()
            client = OpenBrowserUseClient(socket_path=socket_path)
            try:
                self.assertEqual(client.get_info(), {"name": "Open Browser Use"})
            finally:
                client.close()
            thread.join(timeout=1)

    def test_file_chooser_wrapper(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            socket_path = str(Path(directory) / "obu.sock")
            server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            server.bind(socket_path)
            server.listen(1)

            def serve_once() -> None:
                conn, _ = server.accept()
                with conn:
                    header = conn.recv(4)
                    (length,) = struct.unpack("=I", header)
                    payload = conn.recv(length)
                    request = json.loads(payload)
                    self.assertEqual(request["method"], "waitForFileChooser")
                    self.assertEqual(request["params"]["tabId"], 123)
                    response = {
                        "jsonrpc": "2.0",
                        "id": request["id"],
                        "result": {"fileChooserId": "chooser-1", "isMultiple": False},
                    }
                    conn.sendall(encode_frame(response))
                server.close()

            thread = threading.Thread(target=serve_once)
            thread.start()
            client = OpenBrowserUseClient(socket_path=socket_path)
            try:
                self.assertEqual(
                    client.wait_for_file_chooser(123),
                    {"fileChooserId": "chooser-1", "isMultiple": False},
                )
            finally:
                client.close()
            thread.join(timeout=1)

    def test_download_and_clipboard_wrappers(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            socket_path = str(Path(directory) / "obu.sock")
            server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            server.bind(socket_path)
            server.listen(1)
            expected = [
                ("waitForDownload", {"tabId": 123, "timeoutMs": 5000}),
                ("downloadPath", {"downloadId": "download-1"}),
                ("readClipboardText", {"tabId": 123}),
                ("writeClipboardText", {"tabId": 123, "text": "hello"}),
            ]

            def serve() -> None:
                conn, _ = server.accept()
                with conn:
                    for method, params in expected:
                        header = conn.recv(4)
                        (length,) = struct.unpack("=I", header)
                        payload = conn.recv(length)
                        request = json.loads(payload)
                        self.assertEqual(request["method"], method)
                        for key, value in params.items():
                            self.assertEqual(request["params"][key], value)
                        response = {
                            "jsonrpc": "2.0",
                            "id": request["id"],
                            "result": {},
                        }
                        conn.sendall(encode_frame(response))
                server.close()

            thread = threading.Thread(target=serve)
            thread.start()
            client = OpenBrowserUseClient(socket_path=socket_path)
            try:
                client.wait_for_download(123, timeout_ms=5000)
                client.download_path("download-1")
                client.read_clipboard_text(123)
                client.write_clipboard_text(123, "hello")
            finally:
                client.close()
            thread.join(timeout=1)


if __name__ == "__main__":
    unittest.main()
