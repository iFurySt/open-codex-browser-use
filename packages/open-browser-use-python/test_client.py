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


if __name__ == "__main__":
    unittest.main()
