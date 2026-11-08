import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
tpl = open('page.tpl.html').read(); cur = open('cur.js').read(); sk = open('sketch.js').read()
open('index.html', 'w').write(tpl.replace('/*CUR*/', cur).replace('/*SKETCH*/', sk))
head = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Under the Card, PC</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500&family=Poiret+One&family=Cormorant+Garamond:ital@0;1&family=Playfair+Display:ital@1&display=swap">
<style>:root{color-scheme:dark}body{margin:0;background:#0b0a08;color:#e9dfc8;font:15px 'Jost',sans-serif}
a{color:#c9a84c;display:inline-block;padding:14px 16px}.s{overflow-x:auto}.s svg{width:1440px;height:900px;display:block}
h2{font:500 12px 'Jost',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#c9a84c;padding:0 16px;margin:18px 0 8px}</style></head>
<body><a href="index.html">&lsaquo; Back to the overview</a><h2>PC &middot; a card up (1440 &times; 900, real size)</h2><div class="s" id="a"></div>
<h2>PC &middot; end of a hand</h2><div class="s" id="b"></div>
<script>"""
tail = """
document.getElementById('a').innerHTML=pc('card');document.getElementById('b').innerHTML=pc('end');
document.addEventListener('keydown',e=>{if(e.key==='Escape')location.href='index.html'});</script></body></html>"""
open('pc.html', 'w').write(head + sk + tail)
print('built')
