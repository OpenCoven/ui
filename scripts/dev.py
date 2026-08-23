#!/usr/bin/env python3
"""Serve the component browser locally with the production root rewrite.

Mirrors the `vercel.json` rewrite so `/` resolves to `Components.dc.html`
locally exactly as it does on https://ui.opencoven.ai.

Usage:
    python3 scripts/dev.py [port]
"""

from __future__ import annotations

import functools
import http.server
import socketserver
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENTRY = "/Components.dc.html"
DEFAULT_PORT = 4321


class ComponentBrowserHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        if path in ("/", "/index.html"):
            path = ENTRY
        return super().translate_path(path)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main() -> int:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    entry = ROOT / ENTRY.lstrip("/")
    if not entry.is_file():
        print(f"missing {entry}", file=sys.stderr)
        return 1

    handler = functools.partial(ComponentBrowserHandler, directory=str(ROOT))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", port), handler) as httpd:
        print(f"OpenCoven UI -> http://127.0.0.1:{port}/", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
