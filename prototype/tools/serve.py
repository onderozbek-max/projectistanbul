#!/usr/bin/env python3
"""Phone-test server: serves prototype/ on all interfaces and tells the browser never to cache.

python3's plain http.server sends Last-Modified but no Cache-Control, so Safari reuses old JS and CSS after an edit and a phone
playtest runs a stale build (the missing telemetry button was one case). This handler sends Cache-Control: no-store.

    cd prototype && python3 tools/serve.py [port]        (default 8765)
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    os.chdir(ROOT)
    print("serving", os.getcwd(), "on 0.0.0.0:%d" % port, flush=True)
    Server(("0.0.0.0", port), NoCache).serve_forever()
