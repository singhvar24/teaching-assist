#!/usr/bin/env python3
"""Inline style.css, data.js and app.js into one page fragment (no <html>/<head>/<body>),
the form the Claude artifact publisher expects. Usage: build-standalone.py OUT.html"""
import re, sys, pathlib
here = pathlib.Path(__file__).parent
read = lambda n: (here / n).read_text(encoding="utf-8")
html = read("index.html")
body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
body = re.sub(r'<script src="[^"]+"></script>\s*', "", body).strip()
fonts = re.search(r'<link rel="stylesheet" href="(https://fonts[^"]+)">', html).group(1)
js = read("data.js") + "\n" + read("app.js")
assert "</script" not in js, "script text would end the inline script early"
out = ("<title>Question Paper Builder</title>\n"
       f'<link rel="stylesheet" href="{fonts}">\n<style>\n{read("style.css")}\n</style>\n'
       f"{body}\n<script>\n{js}\n</script>\n")
pathlib.Path(sys.argv[1]).write_text(out, encoding="utf-8")
print("wrote", sys.argv[1], len(out), "bytes")
