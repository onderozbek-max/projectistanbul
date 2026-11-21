#!/usr/bin/env python3
"""Serve one explicitly named immutable snapshot. No cache, no downloads, standard library only."""
import functools
import http.server
import pathlib
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def log_message(self, *_args):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1])
    root = pathlib.Path(sys.argv[2]).resolve(strict=True)
    host = sys.argv[3] if len(sys.argv) > 3 else '127.0.0.1'
    if not (root / 'index.html').is_file():
        raise SystemExit('Snapshot must contain index.html')
    print(f'Serving exact snapshot {root} on {host}:{port}', flush=True)
    handler = functools.partial(NoCache, directory=str(root))
    http.server.ThreadingHTTPServer((host, port), handler).serve_forever()
