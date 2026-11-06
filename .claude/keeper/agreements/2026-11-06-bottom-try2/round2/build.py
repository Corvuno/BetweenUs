# Builds index.html for round 2: the top of the live app (screenshot) with each bottom drawn from scratch.
import base64, pathlib
here = pathlib.Path(__file__).parent
def uri(n): return 'data:image/png;base64,' + base64.b64encode((here/n).read_bytes()).decode()
TOP, NOWB = uri('top.png'), uri('now-bottom.png')

GOLD = '#c9a84c'; QUIET = '#8f8171'; HINT = '#6f8579'; INK = '#14110d'
PAST = ['#2f6b45','#2b5f7a','#1f4a3a','#3b3f7a','#6b6a3e','#7a4a5e','#5e6a3a','#3d6a86','#7a4a6a','#5e6a3a','#3d5f7a','#7a4a6a','#5e6a3a']
def ticks(y=14):
    out=[]; n=20; w=13.2; gap=(339-n*w)/(n-1); x=18
    for i in range(n):
        if i < 13: c, o, h, yy = PAST[i], .55, 6, y
        elif i == 13: c, o, h, yy = '#6fb8e8', 1, 8, y-1
        else: c, o, h, yy = '#5c4f37', .5, 6, y
        out.append(f'<rect x="{x:.1f}" y="{yy}" width="{w}" height="{h}" rx="1.5" fill="{c}" opacity="{o}"/>')
        x += w + gap
    return ''.join(out)
def count(y=44): return f'<text x="187.5" y="{y}" text-anchor="middle" font-family="Jost,sans-serif" font-weight="300" font-size="13" letter-spacing="3" fill="{GOLD}" opacity=".85">14 / 20</text>'
def bar(x, y, w, h):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#g)"/>'
            f'<text x="{x+w/2}" y="{y+h/2+4.5}" text-anchor="middle" font-family="Jost,sans-serif" font-size="12.8" letter-spacing="1.8" fill="{INK}">NEXT CARD</text>')
def word(x, y, t, anchor='middle'):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Jost,sans-serif" font-size="11.5" letter-spacing="2.5" fill="{QUIET}">{t}</text>'
def hint(x, y, anchor='middle'):
    s = f'font-family="Cormorant Garamond,serif" font-style="italic" font-size="15" fill="{HINT}" text-anchor="{anchor}"'
    return f'<text x="{x}" y="{y}" {s}>the question</text><text x="{x}" y="{y+17}" {s}>takes the stage</text>'
DEFS = '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dbb45a"/><stop offset="1" stop-color="#b08840"/></linearGradient></defs>'

def bookend(h=False):
    bx, bw, by, bh = 123.5, 128, 82, 34
    lines = []; d = '<defs>'
    for i, (yy, reach) in enumerate([(93, 40), (99, 24), (105, 40)]):
        for side in (-1, 1):
            x1 = bx - 6 if side < 0 else bx + bw + 6
            x2 = reach if side < 0 else 375 - reach
            gid = f'h{i}{side}'
            d += (f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{x1}" y1="0" x2="{x2}" y2="0">'
                  '<stop offset="0" stop-color="#c9a84c" stop-opacity=".75"/><stop offset="1" stop-color="#c9a84c" stop-opacity=".2"/></linearGradient>')
            lines.append(f'<line x1="{x1}" y1="{yy}" x2="{x2}" y2="{yy}" stroke="url(#{gid})" stroke-width="1"/>')
    d += '</defs>'
    body = ticks() + count() + d + ''.join(lines) + bar(bx, by, bw, bh) + word(24, 140, 'SPOTLIGHT', 'start') + word(351, 140, 'MENU', 'end')
    if h: body += hint(24, 162, 'start')
    return body

def fan(h=False):
    import math
    bx, bw, by, bh = 102.5, 170, 62, 34
    cx, cy = 187.5, by + bh
    rays = []
    n = 11
    for i in range(n):
        a = math.radians(160 - i * (140 / (n - 1)))
        r = 92 if i % 2 == 0 else 66
        if i in (0, n - 1): r = 84
        x2, y2 = cx + r * math.cos(a), cy + r * math.sin(a)
        rays.append(f'<line x1="{cx}" y1="{cy+6}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{GOLD}" stroke-opacity=".32" stroke-width=".9"/>')
    arc_r = 40
    a1, a2 = math.radians(160), math.radians(20)
    p1 = (cx + arc_r * math.cos(a1), cy + arc_r * math.sin(a1)); p2 = (cx + arc_r * math.cos(a2), cy + arc_r * math.sin(a2))
    arc = f'<path d="M{p1[0]:.1f},{p1[1]:.1f} A{arc_r},{arc_r} 0 0 0 {p2[0]:.1f},{p2[1]:.1f}" fill="none" stroke="{GOLD}" stroke-opacity=".32" stroke-width=".9"/>'
    l = (cx + 84 * math.cos(math.radians(160)), cy + 84 * math.sin(math.radians(160)))
    r_ = (cx + 84 * math.cos(math.radians(20)), cy + 84 * math.sin(math.radians(20)))
    body = ticks() + count() + ''.join(rays) + arc + bar(bx, by, bw, bh) + word(l[0] - 6, l[1] + 4, 'SPOTLIGHT', 'end') + word(r_[0] + 6, r_[1] + 4, 'MENU', 'start')
    if h: body += hint(l[0] - 6, l[1] + 26, 'end')
    return body

def plain(h=False):
    body = ticks() + count() + bar(82.5, 76, 210, 34) + word(132, 168, 'SPOTLIGHT') + word(243, 168, 'MENU')
    if h: body += hint(132, 190)
    return body

def svg(inner, H=220):
    return f'<svg viewBox="0 0 375 {H}" role="img" aria-hidden="true">{DEFS}{inner}</svg>'
def phone(inner):
    return f'<div class="phone"><img src="{TOP}" alt="Title and card, as in the app"><div class="bot">{svg(inner)}</div></div>'

designs = [
 ('Bookend', bookend,
  'The bottom repeats the title\'s figure: three parallel gold hairlines run out from one centre, and the centre is Next card. Spotlight and Menu sit at the ends of the lines.',
  ['The title and the bottom read as the top and bottom of one frame around the card.',
   'Next card is narrower and lower than today, so the question is now the brightest thing.',
   'Spotlight and Menu are far from Next card, so a thumb aiming for Next never hits them.',
   'Against it: the two words sit at the far edges, a longer reach on a big phone, and the hairlines add one more set of lines under the ticks.']),
 ('Plain and pretty', plain,
  'No line work at all: the ticks, one slim gold Next card, and the two words Spotlight and Menu, with empty dark space doing the rest.',
  ['The fewest shapes possible: three things under the card besides the ticks.',
   'The coloured ticks become the only ornament, which gives them more room to be the flourish you like.',
   'Calmest next to the question; it relies on the title and the card for all the deco.',
   'Against it: it has the least character of the two, and the bottom no longer echoes anything above it.']),
]

cards = []
for i, (name, fn, idea, notes) in enumerate(designs, 1):
    li = ''.join(f'<li>{n}</li>' for n in notes)
    cards.append(f'''<section class="design"><h2><span>{i}</span>{name}</h2><p class="idea">{idea}</p>
{phone(fn())}
<p class="lbl">First visit: Spotlight's existing hint</p><div class="strip">{svg(fn(True))}</div>
<ul>{li}</ul></section>''')

html = f'''<title>Under the Card, Try Two</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;1,400&family=Poiret+One&family=Jost:wght@300;400&display=swap">
<style>
/* layout: one column of phones on a phone, side by side on a wide screen; the app's own dark ground */
:root{{--bg:#0c0b09;--panel:#141210;--fg:#efe7d6;--muted:#9c8f7e;--gold:#c9a84c;--line:rgba(201,168,76,.22);
--display:'Poiret One',Georgia,serif;--body:'Cormorant Garamond',Georgia,serif;--ui:'Jost',system-ui,sans-serif;color-scheme:dark}}
body{{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:17px;line-height:1.45;
padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 48px}}
.wrap{{max-width:1240px;margin:0 auto;display:grid;gap:28px}}
h1{{font-family:var(--display);font-weight:400;font-size:2rem;color:var(--gold);margin:0;letter-spacing:.04em;text-wrap:balance}}
h2{{font-family:var(--ui);font-weight:400;font-size:.85rem;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin:0;display:flex;gap:10px;align-items:baseline}}
h2 span{{color:var(--muted)}}
h3{{font-family:var(--ui);font-weight:400;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin:14px 0 6px}}
.check{{background:var(--panel);border:1px solid var(--line);padding:16px 18px;display:grid;gap:2px}}
.check ul{{margin:0;padding-left:18px}} .check li{{margin:3px 0}}
.check p{{margin:4px 0}}
.row{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:28px;align-items:start}}
.design{{display:grid;gap:12px;min-width:0}}
.idea{{margin:0;color:var(--fg)}}
.phone{{width:100%;max-width:375px;border:1px solid var(--line);background:#0e0c0a;line-height:0}}
.phone img{{display:block;width:100%}} .bot svg,.strip svg{{display:block;width:100%;height:auto}}
.strip{{width:100%;max-width:375px;border:1px solid var(--line);background:#0e0c0a}}
.lbl{{margin:4px 0 0;font-family:var(--ui);font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}}
.design ul{{margin:0;padding-left:18px;color:var(--fg)}} .design li{{margin:4px 0}}
.now .phone img+img{{border-top:0}}
</style>
<div class="wrap">
<header><h1>Under the card, try two</h1><p style="margin:6px 0 0;color:var(--muted)">Round 2: two designs on the structure you agreed. The current version comes first. Drawn from scratch under a screenshot of the real title and card, 14 cards into a 20-card mixed hand, at the size of your phone.</p></header>

<div class="check">
<h3>Decided (your words)</h3>
<ul>
<li>"too much things doing what ever and not really highrarcy": the diagnosis.</li>
<li>Three goes to The Deck. Back goes. The card is for reading only.</li>
<li>Spotlight stays on the screen, "where it fits logicaly… reachable".</li>
<li>The coloured ticks stay: "They have a sense of progression and add some coloured flusish".</li>
<li>Twist off the screen; you let me pick out or menu: I picked the menu.</li>
<li>The structure: the ticks with the count, Next card the only strong control, Spotlight and Menu quiet, The Deck above the card. "yea, that sounds good… Better make it good."</li>
</ul>
<h3>Open</h3>
<ul><li>How it looks: this round.</li><li>Whether the count "14 / 20" stays. It is in all three, because on long hands the ticks show only about 20 cards and the count is the only total.</li></ul>
<h3>My own choices in all three (overrule any)</h3>
<ul><li>Spotlight and Menu are words only, no icons, in the same typeface as Next card.</li>
<li>Next card keeps the app's one gold-button look (square, gold), but slimmer than today.</li>
<li>The small diamond at the end of the ticks is gone (diamonds belong to After Dark).</li>
<li>Nothing touches the card; there is always a gap.</li>
<li>Next card gets slimmer than today. The app has one gold-button look, shared with Draw Cards in The Deck, so Draw Cards would get the same slimmer height.</li></ul>
<h3>Outside check</h3>
<p>The design gate blocked four sets of ideas before this one; it passed these three in words: Bookend and Plain and pretty passed. A third, a fan of rays under Next card, was blocked as a variation of Bookend, so this round has two.</p>
<h3>Design skills used</h3>
<ul><li>Design critique: the assessment you agreed with (no shared look, the gold block outshining the question, progress shown twice).</li>
<li>Emil Kowalski's design engineering: one look throughout (one typeface for controls, one gold, quiet secondary words), which is why every design drops the icons and the boxes.</li></ul>
</div>

<div class="row">
<section class="design now"><h2><span>0</span>Now</h2><p class="idea">As it is in the app today, same hand.</p>
<div class="phone"><img src="{TOP}" alt="Title and card"><img src="{NOWB}" alt="The current controls under the card"></div>
<ul><li>About 19 pieces under the card in four typefaces; the gold block is the brightest thing on screen.</li></ul></section>
{''.join(cards)}
</div>
</div>'''
(here / 'index.html').write_text(html)
print('ok', len(html))
