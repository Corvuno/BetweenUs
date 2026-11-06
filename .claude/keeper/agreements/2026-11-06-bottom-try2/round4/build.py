# Builds index.html for round 2: the top of the live app (screenshot) with each bottom drawn from scratch.
import base64, pathlib
here = pathlib.Path(__file__).parent
def uri(n): return 'data:image/png;base64,' + base64.b64encode((here/n).read_bytes()).decode()
TOP, NOWB = uri('top.png'), uri('now-bottom.png')

GOLD = '#c9a84c'; QUIET = '#8f8171'; HINT = '#6f8579'; INK = '#14110d'
PAST = ['#2f6b45','#2b5f7a','#1f4a3a','#3b3f7a','#6b6a3e','#7a4a5e','#5e6a3a','#3d6a86','#7a4a6a','#5e6a3a','#3d5f7a','#7a4a6a','#5e6a3a']
def ticks(y=14, x0=18, x1=357, th=6):
    out=[]; n=20; w=(x1-x0)*0.78/n; gap=(x1-x0-n*w)/(n-1); x=x0
    for i in range(n):
        if i < 13: c, o, h, yy = PAST[i], .55, th, y
        elif i == 13: c, o, h, yy = '#6fb8e8', 1, th+2, y-1
        else: c, o, h, yy = '#5c4f37', .5, th, y
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
    body = ticks() + count() + bar(82.5, 76, 210, 34) + word(102, 168, 'SPOTLIGHT', 'start') + word(273, 168, 'MENU', 'end')
    if h: body += hint(145, 190)
    return body


def pair(y, h=False):
    s = word(102, y, 'SPOTLIGHT', 'start') + word(273, y, 'MENU', 'end')
    if h: s += hint(145, y + 22)
    return s

def skyline(h=False):
    out=[]; n=20; x0, x1 = 18, 357; w=(x1-x0)*0.8/n; gap=(x1-x0-n*w)/(n-1); x=x0; base=36
    for i in range(n):
        hh = max(6, 24 - 3*abs(i-13)) if i <= 13 else 6
        if i < 13: c, o = PAST[i], .7
        elif i == 13: c, o = '#6fb8e8', 1
        else: c, o = '#5c4f37', .5
        out.append(f'<rect x="{x:.1f}" y="{base-hh}" width="{w:.1f}" height="{hh}" fill="{c}" opacity="{o}"/>')
        x += w + gap
    return ''.join(out) + count(60) + bar(82.5, 78, 210, 34) + pair(150, h)

def emblems(h=False):
    import math
    g = f'stroke="{GOLD}" stroke-opacity=".85" stroke-width="1.1" fill="none"'
    cx, cy = 132, 138
    sun = f'<line x1="{cx-14}" y1="{cy}" x2="{cx+14}" y2="{cy}" {g}/>'
    sun += f'<path d="M{cx-7},{cy} A7,7 0 0 1 {cx+7},{cy}" {g}/>'
    for i in range(7):
        a = math.radians(180 - i*30)
        sun += f'<line x1="{cx+10*math.cos(a):.1f}" y1="{cy-10*math.sin(a):.1f}" x2="{cx+16*math.cos(a):.1f}" y2="{cy-16*math.sin(a):.1f}" {g}/>'
    mx = 243
    menu = ''.join(f'<line x1="{mx-wd/2}" y1="{y}" x2="{mx+wd/2}" y2="{y}" {g}/>' for y, wd in ((124, 10), (131, 18), (138, 26)))
    words = word(cx, 162, 'SPOTLIGHT') + word(mx, 162, 'MENU')
    if h: words += hint(cx, 184)
    return ticks() + count() + bar(82.5, 70, 210, 34) + sun + menu + words

def titlemenu(h=False):
    s_ = ticks() + count() + bar(82.5, 70, 210, 34) + word(187.5, 140, 'SPOTLIGHT')
    if h: s_ += hint(187.5, 162)
    return s_

_gid=[0]
def hl(x1, x2, y, o1=.75, o2=.2):
    _gid[0]+=1; g=f'q{_gid[0]}'
    return (f'<defs><linearGradient id="{g}" gradientUnits="userSpaceOnUse" x1="{x1}" y1="0" x2="{x2}" y2="0">'
            f'<stop offset="0" stop-color="{GOLD}" stop-opacity="{o1}"/><stop offset="1" stop-color="{GOLD}" stop-opacity="{o2}"/></linearGradient></defs>'
            f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="url(#{g})" stroke-width="1"/>')
def sword(x, y, t, anchor='middle'):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Jost,sans-serif" font-size="10.5" letter-spacing="2.2" fill="{QUIET}">{t}</text>'

def rails_row(bx=127.5, bw=120, cy=99, gap=8):
    L0, L1 = 10, bx-6; R0, R1 = bx+bw+6, 365
    s_ = hl(L1, L0, cy-gap) + hl(L1, L0, cy+gap) + hl(R0, R1, cy-gap) + hl(R0, R1, cy+gap)
    lc = (L0+L1)/2; rc = (R0+R1)/2
    s_ += hl(L1, lc+44, cy) + hl(lc-44, L0, cy, .4, .2) + hl(R0, rc-25, cy) + hl(rc+25, R1, cy, .4, .2)
    s_ += sword(lc, cy+3.8, 'SPOTLIGHT') + sword(rc, cy+3.8, 'MENU')
    return s_, lc, rc

def v_rails(h=False):
    r, lc, rc = rails_row()
    s_ = ticks() + count() + r + bar(127.5, 82, 120, 34)
    if h: s_ += hint(lc, 140)
    return s_

def v_drop(h=False):
    bx, bw = 123.5, 128
    lc, rc = 56.5, 318.5
    s_ = ticks() + count()
    s_ += hl(bx-6, 30, 93) + hl(bx-6, 14, 99) + hl(bx+bw+6, 345, 93) + hl(bx+bw+6, 361, 99)
    s_ += hl(bx-6, lc, 105, .75, .45) + hl(bx+bw+6, rc, 105, .75, .45)
    s_ += f'<line x1="{lc}" y1="105" x2="{lc}" y2="121" stroke="{GOLD}" stroke-opacity=".45"/><circle cx="{lc}" cy="124" r="1.8" fill="{GOLD}" fill-opacity=".6"/>'
    s_ += f'<line x1="{rc}" y1="105" x2="{rc}" y2="121" stroke="{GOLD}" stroke-opacity=".45"/><circle cx="{rc}" cy="124" r="1.8" fill="{GOLD}" fill-opacity=".6"/>'
    s_ += bar(bx, 82, bw, 34) + word(lc, 143, 'SPOTLIGHT') + word(rc, 143, 'MENU')
    if h: s_ += hint(lc+30, 165)
    return s_

def v_conv(h=False):
    bx, bw = 123.5, 128
    lc, rc = 56.5, 318.5
    s_ = ticks() + count()
    for side, cx in ((-1, lc), (1, rc)):
        x0 = bx-6 if side < 0 else bx+bw+6
        for yy in (91, 99, 107):
            s_ += f'<line x1="{x0}" y1="{yy}" x2="{cx}" y2="118" stroke="{GOLD}" stroke-opacity=".5" stroke-width="1"/>'
        s_ += f'<line x1="{cx}" y1="118" x2="{cx}" y2="124" stroke="{GOLD}" stroke-opacity=".5"/>'
    s_ += bar(bx, 82, bw, 34) + word(lc, 143, 'SPOTLIGHT') + word(rc, 143, 'MENU')
    if h: s_ += hint(lc+30, 165)
    return s_

def v_sun(h=False):
    import math
    r, lc, rc = rails_row(cy=107)
    cx, cy = 187.5, 99
    sun = f'<path d="M{cx-44},{cy} A44,44 0 0 1 {cx+44},{cy}" fill="none" stroke="{GOLD}" stroke-opacity=".45" stroke-width="1"/>'
    for i in range(1, 12):
        a = math.radians(180 - i*15)
        sun += f'<line x1="{cx+16*math.cos(a):.1f}" y1="{cy-16*math.sin(a):.1f}" x2="{cx+41*math.cos(a):.1f}" y2="{cy-41*math.sin(a):.1f}" stroke="{GOLD}" stroke-opacity=".32" stroke-width=".9"/>'
    s_ = ticks() + count() + sun + r + bar(127.5, 90, 120, 34)
    if h: s_ += hint(lc, 148)
    return s_

def svg(inner, H=220):
    return f'<svg viewBox="0 0 375 {H}" role="img" aria-hidden="true">{DEFS}{inner}</svg>'
def phone(inner):
    return f'<div class="phone"><img src="{TOP}" alt="Title and card, as in the app"><div class="bot">{svg(inner)}</div></div>'

designs = [
 ('A · As chosen', bookend, 'Round 3\'s option A, unchanged, for comparison.',
  ['Spotlight and Menu hang under the outer ends of the lines.']),
 ('V1 · Rails', v_rails, 'From stepped-bars-and-dots: the outer two lines run the full width like rails; the middle line breaks for the words, so Spotlight and Menu sit between the rails on the same line as Next card.',
  ['The words become stations on the line, level with Next card.', 'Against it: Next card is a little narrower and the words a little smaller to fit between the rails.', 'Risk: the words sit level with Next card, about 28 points from it; a thumb aiming for Next card could hit Spotlight. Built, the word\'s tap area would stop short of the button, but they stay closer than in A.', 'Risk: a rail above and below each word half closes it in, close to a box round a single control.']),
 ('V2 · Drop to the word', v_drop, 'From thin-gold-on-black and stepped-bars-and-dots: the lowest line on each side steps down at its end and finishes in a small dot right above its word.',
  ['Each line leads to its control, so the words are tied to the figure instead of floating.', 'Keeps A\'s look almost as it is; both drops sit the same distance from the centre.', 'Against it: the words still sit below the line, so the bottom is a little taller than V1.']),
 ('V3 · Converge', v_conv, 'From stepped-bars-and-dots (the bow-shaped dividers): the three lines on each side leave Next card spread apart and narrow to one point above each word, like a bow.',
  ['Each side becomes one shape that ends exactly on its control; the words belong to the figure.', 'Words stay below and apart from Next card, as in A.', 'Against it: angled lines are less like the title, whose lines are all level.']),
]

TITLEHINT = (f'<svg viewBox="0 0 375 200" role="img" aria-hidden="true"><image href="{TOP}" x="0" y="0" width="375" height="447.5"/>'
  '<text x="187.5" y="128" text-anchor="middle" font-family="Cormorant Garamond,serif" font-style="italic" font-size="15" fill="#6f8579">tap for the menu</text></svg>')
cards = []
for i, (name, fn, idea, notes) in enumerate(designs, 1):
    li = ''.join(f'<li>{n}</li>' for n in notes)
    cards.append(f'''<section class="design"><h2><span>{i}</span>{name}</h2><p class="idea">{idea}</p>
{phone(fn())}
<p class="lbl">First visit: Spotlight's existing hint</p><div class="strip">{svg(fn(True))}</div>{('<p class="lbl">First visit: the new hint under the title</p><div class="strip">' + TITLEHINT + '</div>') if fn is titlemenu else ''}
<ul>{li}</ul></section>''')

html = f'''<title>Under the Card, Round 4</title>
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
<header><h1>Under the card, round 4</h1><p style="margin:6px 0 0;color:var(--muted)">Round 4: variations on option A, which you chose, each built from a line example in your references, aiming to make Spotlight and Menu part of the lines. A is round 2's version with the lines (round 2 stays at its own link). The current version comes first. Drawn from scratch under a screenshot of the real title and card, 14 cards into a 20-card mixed hand, at the size of your phone. The empty space at the very bottom is real screen; on your phone the browser bar covers roughly the last 60 points of it.</p></header>

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
<ul><li>How it looks: this round.</li><li>Whether the count "14 / 20" stays. It is in all of them, because on long hands the ticks show only about 20 cards and the count is the only total.</li></ul>
<h3>My own choices in all of them (overrule any)</h3>
<ul><li>Spotlight and Menu are words only, no icons, in the same typeface as Next card.</li>
<li>Next card keeps the app's one gold-button look (square, gold), but slimmer than today.</li>
<li>The small diamond at the end of the ticks is gone (diamonds belong to After Dark).</li>
<li>Nothing touches the card; there is always a gap.</li>
<li>Next card gets slimmer than today, in all of them. The app has one gold-button look, shared with Draw Cards in The Deck, so Draw Cards would get the same slimmer height.</li></ul>
<h3>Outside check</h3>
<p>The design gate passed V2 and V3. It flagged V1 for the words sitting level with Next card (a mis-tap risk) and for the rails closing the words in; both are stated under V1 so you can judge by eye. A sunburst version was blocked: it crowded the count right under the card.</p>
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
