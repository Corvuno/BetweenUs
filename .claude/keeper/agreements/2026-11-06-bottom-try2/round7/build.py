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

def v_ring(h=False):
    bx, bw = 123.5, 128
    lc, rc = 56.5, 318.5
    s_ = ticks() + count()
    s_ += hl(bx-6, 30, 93) + hl(bx-6, 14, 99) + hl(bx+bw+6, 345, 93) + hl(bx+bw+6, 361, 99)
    for x0, cx in ((bx-6, lc), (bx+bw+6, rc)):
        s_ += f'<path d="M{x0},105 C{(x0+cx)/2},105 {cx},105 {cx},118" fill="none" stroke="{GOLD}" stroke-opacity=".55" stroke-width="1"/>'
        s_ += f'<circle cx="{cx}" cy="121.5" r="3" fill="none" stroke="{GOLD}" stroke-opacity=".6" stroke-width="1"/>'
    s_ += bar(bx, 82, bw, 34) + word(lc, 143, 'SPOTLIGHT') + word(rc, 143, 'MENU')
    if h: s_ += hint(lc+30, 165)
    return s_

def v_base(h=False):
    bx, bw = 123.5, 128
    s_ = ticks() + count()
    s_ += hl(bx-6, 40, 93) + hl(bx-6, 24, 99) + hl(bx-6, 40, 105) + hl(bx+bw+6, 335, 93) + hl(bx+bw+6, 351, 99) + hl(bx+bw+6, 335, 105)
    s_ += bar(bx, 82, bw, 34)
    s_ += hl(187.5, 92, 131, .55, .15) + hl(187.5, 283, 131, .55, .15)
    s_ += f'<line x1="187.5" y1="138" x2="187.5" y2="152" stroke="{GOLD}" stroke-opacity=".45"/>'
    s_ += word(176, 149, 'SPOTLIGHT', 'end') + word(199, 149, 'MENU', 'start')
    if h: s_ += hint(140, 171)
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

def L(x1,y1,x2,y2,o=.6,w=1):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{GOLD}" stroke-opacity="{o}" stroke-width="{w}"/>'
def P(pts,o=.6,w=1,close=False,fill='none'):
    d='M'+' L'.join(f'{x:.1f},{y:.1f}' for x,y in pts)+(' Z' if close else '')
    return f'<path d="{d}" fill="{fill}" stroke="{GOLD}" stroke-opacity="{o}" stroke-width="{w}" stroke-linejoin="miter"/>'
def dot(x,y,r=1.8,o=.75):
    return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{GOLD}" fill-opacity="{o}"/>'
def mirror(fn):
    return fn(lambda x: x) + fn(lambda x: 375-x)
def cnt(y=40): return count(y)

# 1. Cartouche: from dividers-gold-on-slate / stepped-bars (long bevelled frame round the centre piece, lines running out to dot ends)
def d_cart(h=False):
    s_ = ticks(12) + cnt(40)
    cy = 99
    outer = [(10,cy),(28,80),(347,80),(365,cy),(347,118),(28,118)]
    inner = [(18,cy),(32,85),(343,85),(357,cy),(343,113),(32,113)]
    s_ += P(outer,.55,1,True) + P(inner,.28,.8,True)
    def side(m):
        o = L(m(117),93,m(48),93,.45) + L(m(117),99,m(34),99,.55) + L(m(117),105,m(48),105,.45)
        o += L(m(150),73,m(44),73,.3) + dot(m(41),73,1.4,.55)
        return o
    s_ += mirror(side)
    s_ += bar(123.5,84,128,30)
    s_ += word(14, 140, 'SPOTLIGHT', 'start') + word(361, 140, 'MENU', 'end')
    if h: s_ += hint(14, 162, 'start')
    return s_

# 2. Fan and count: from layered-diamonds-and-fans (a fan rising from stepped lines) - the count sits in the fan
def d_fan(h=False):
    import math
    s_ = ticks(12)
    cx, base = 187.5, 80
    for r_, o in ((44,.55),(39,.3)):
        s_ += f'<path d="M{cx-r_},{base} A{r_},{r_} 0 0 1 {cx+r_},{base}" fill="none" stroke="{GOLD}" stroke-opacity="{o}" stroke-width="1"/>'
    for i in range(1,8):
        a = math.radians(180 - i*22.5)
        s_ += L(cx+26*math.cos(a), base-26*math.sin(a), cx+37*math.cos(a), base-37*math.sin(a), .4, .9)
    s_ += f'<path d="M{cx-23},{base} A23,23 0 0 1 {cx+23},{base}" fill="#0e0c0a" stroke="{GOLD}" stroke-opacity=".55" stroke-width="1"/>'
    s_ += f'<text x="{cx}" y="{base-6}" text-anchor="middle" font-family="Jost,sans-serif" font-weight="300" font-size="10" fill="{GOLD}">14 / 20</text>'
    def side(m):
        o = L(m(cx-48),base,m(30),base,.6) + L(m(30),base,m(22),base+8,.6) + L(m(22),base+8,m(22),base+46,.6) + dot(m(22),base+49,1.8)
        o += L(m(cx-66),base+5,m(42),base+5,.3)
        return o
    s_ += mirror(side)
    s_ += bar(118.5,86,138,34)
    s_ += word(70, base+64, 'SPOTLIGHT') + word(305, base+64, 'MENU')
    if h: s_ += hint(70, base+86)
    return s_

# 3. Bow: from stepped-bars-and-dots (bow-shaped wings either side of the centre, lines running through to dot ends)
def d_bow(h=False):
    s_ = ticks(12) + cnt(40)
    cy = 99
    def side(m):
        o = P([(m(117),92),(m(80),80),(m(80),118),(m(117),106)],.55,1,True)
        o += P([(m(111),95),(m(86),87),(m(86),111),(m(111),103)],.3,.8,True)
        o += L(m(117),cy,m(84),cy,.35,.8)
        o += L(m(80),cy,m(18),cy,.55) + dot(m(15),cy,2)
        o += L(m(80),88,m(46),88,.3) + dot(m(43),88,1.4,.55)
        o += L(m(80),110,m(46),110,.3) + dot(m(43),110,1.4,.55)
        return o
    s_ += mirror(side)
    s_ += bar(123.5,82,128,34)
    s_ += word(13, cy+38, 'SPOTLIGHT', 'start') + word(362, cy+38, 'MENU', 'end')
    if h: s_ += hint(13, cy+60, 'start')
    return s_

# 4. Setback: from corners-and-elements-sheet (stepped towers): Next card is the top of a stepped base; the words stand on its lowest steps
def d_setback(h=False):
    s_ = ticks(12) + cnt(40)
    def side(m):
        o = P([(m(123.5),116),(m(123.5),126),(m(108),126),(m(108),136),(m(94),136),(m(94),148),(m(8),148)],.55,1)
        o += P([(m(117),116),(m(117),121),(m(102),121),(m(102),131),(m(88),131),(m(88),142),(m(8),142)],.28,.8)
        return o
    s_ += mirror(side)
    s_ += L(123.5,126,251.5,126,.3,.8)
    s_ += bar(123.5,82,128,34)
    s_ += sword(48, 137, 'SPOTLIGHT') + sword(327, 137, 'MENU')
    if h: s_ += hint(48, 168)
    return s_

BG = '#0e0c0a'
def frame(cy=99, top=78, bot=120):
    outer = [(6,cy),(24,top),(351,top),(369,cy),(351,bot),(24,bot)]
    inner = [(14,cy),(28,top+5),(347,top+5),(361,cy),(347,bot-5),(28,bot-5)]
    return P(outer,.55,1,True) + P(inner,.28,.8,True)
def gapbox(x, y, w, h):
    return f'<rect x="{x-w/2:.1f}" y="{y-h/2:.1f}" width="{w}" height="{h}" fill="{BG}"/>'
SW, MW = 80, 42   # word widths at 10.5pt

def c_mid(h=False):
    s_ = ticks(12) + cnt(40) + frame()
    def side(m):
        return L(m(124),92,m(36),92,.45) + L(m(124),106,m(36),106,.45) + L(m(124),99,m(26),99,.55)
    s_ += mirror(side)
    s_ += gapbox(78,99,SW+10,9) + gapbox(297,99,MW+10,9)
    s_ += sword(78,102.8,'SPOTLIGHT') + sword(297,102.8,'MENU')
    s_ += bar(134.5,85,106,28)
    if h: s_ += hint(78, 146)
    return s_

def c_border(h=False):
    s_ = ticks(12) + cnt(40) + frame()
    def side(m):
        return L(m(124),92,m(48),92,.45) + L(m(124),99,m(34),99,.55) + L(m(124),106,m(48),106,.45)
    s_ += mirror(side)
    s_ += gapbox(78,118,SW+12,12) + gapbox(297,118,SW+12,12)
    s_ += sword(78,121.8,'SPOTLIGHT') + sword(297,121.8,'MENU')
    s_ += bar(134.5,85,106,28)
    if h: s_ += hint(78, 146)
    return s_

def c_band(h=False):
    s_ = ticks(12) + cnt(40) + frame(cy=104, top=76, bot=132)
    def side(m):
        return L(m(122),86,m(44),86,.45) + L(m(122),92,m(36),92,.55) + L(m(122),98,m(44),98,.45) + L(m(122),104,m(30),104,.25,.8)
    s_ += mirror(side)
    s_ += sword(80,120,'SPOTLIGHT') + sword(295,120,'MENU')
    s_ += bar(134.5,90,106,28)
    if h: s_ += hint(80, 156)
    return s_

def endmark(x, y, s=4.5):
    return f'<path d="M{x},{y-s} L{x+s},{y} L{x},{y+s} L{x-s},{y} Z" fill="none" stroke="{GOLD}" stroke-opacity=".9" stroke-width="1"/>'
def tk(y=22, x0=18, x1=343):
    return ticks(y, x0, x1) + endmark(x1+10, y+3)
def wl(x, y, t, size=11, ls=1.8):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Jost,sans-serif" font-size="{size}" letter-spacing="{ls}" fill="{QUIET}">{t}</text>'
def bigbar(x, y, w, h):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#g)"/>'
            f'<text x="{x+w/2}" y="{y+h/2+5}" text-anchor="middle" font-family="Jost,sans-serif" font-size="14" letter-spacing="2.2" fill="{INK}">NEXT CARD</text>')
SPW, MNW = 78, 40
def wordlines(cy, x_in, x_out, lc, rc, top_off=10, o=.5):
    # top and bottom lines run full; the middle line gives way to the word
    s_ = ''
    for m, c, w in ((lambda x: x, lc, SPW), (lambda x: 375-x, 375-rc, MNW)):
        s_ += L(m(x_in), cy-top_off, m(x_out), cy-top_off, o) + L(m(x_in), cy+top_off, m(x_out), cy+top_off, o)
        a, b = c + w/2 + 6, c - w/2 - 6
        if x_in > a: s_ += L(m(x_in), cy, m(a), cy, o+.1)
        if b > x_out: s_ += L(m(b), cy, m(x_out), cy, o+.1)
    s_ += wl(lc, cy+4, 'SPOTLIGHT') + wl(rc, cy+4, 'MENU')
    return s_

def r_room(h=False):
    cy = 92
    s_ = tk(22)
    s_ += P([(4,cy),(26,62),(349,62),(371,cy),(349,122),(26,122)],.55,1,True)
    s_ += P([(12,cy),(30,67),(345,67),(363,cy),(345,117),(30,117)],.28,.8,True)
    s_ += wordlines(cy, 110, 26, 66, 309)
    s_ += bigbar(117.5, 72, 140, 40)
    if h: s_ += hint(66, 150)
    return s_

def r_crown(h=False):
    cy = 96
    s_ = P([(4,70),(24,46),(351,46),(371,70),(371,112),(351,132),(24,132),(4,112)],.55,1,True)
    s_ += P([(10,72),(27,62),(348,62),(365,72),(365,110),(348,127),(27,127),(10,110)],.28,.8,True)
    s_ += tk(51, 40, 321)
    s_ += wordlines(cy, 110, 22, 66, 309)
    s_ += bigbar(117.5, 76, 140, 40)
    if h: s_ += hint(66, 160)
    return s_

def r_open(h=False):
    cy = 92
    s_ = tk(22)
    for m in (lambda x: x, lambda x: 375-x):
        s_ += P([(m(26),cy-18),(m(8),cy),(m(26),cy+18)],.55,1)
        s_ += P([(m(32),cy-14),(m(18),cy),(m(32),cy+14)],.3,.8)
    s_ += wordlines(cy, 110, 30, 66, 309, 8)
    s_ += bigbar(117.5, 72, 140, 40)
    if h: s_ += hint(66, 140)
    return s_

def r_step(h=False):
    cy = 98
    s_ = tk(18)
    outer = [(4,cy),(22,80),(104,80),(104,62),(271,62),(271,80),(353,80),(371,cy),(353,116),(271,116),(271,134),(104,134),(104,116),(22,116)]
    inner = [(12,cy),(26,85),(109,85),(109,67),(266,67),(266,85),(349,85),(363,cy),(349,111),(266,111),(266,129),(109,129),(109,111),(26,111)]
    s_ += P(outer,.55,1,True) + P(inner,.28,.8,True)
    s_ += wordlines(cy, 98, 30, 63, 312, 10)
    s_ += bigbar(120.5, 74, 134, 48)
    if h: s_ += hint(63, 158)
    return s_

def svg(inner, H=220):
    return f'<svg viewBox="0 0 375 {H}" role="img" aria-hidden="true">{DEFS}{inner}</svg>'
def phone(inner):
    return f'<div class="phone"><img src="{TOP}" alt="Title and card, as in the app"><div class="bot">{svg(inner)}</div></div>'

designs = [
 ('Round 6 · 1, as you picked it', c_mid, 'For comparison.', ['Words in the middle line, Next card slim.']),
 ('1 · The nameplate, roomier', r_room, 'Your pick with more room: the frame is taller and runs edge to edge, Next card is larger with larger letters, the three lines keep their spacing and the words sit in the middle one. No count; the end-of-hand diamond is back at the end of the ticks.',
  ['The closest to what you asked: same idea, more breathing space, a stronger Next card.', 'Against it: Spotlight still almost fills its side; the phone is only so wide.']),
 ('2 · Ticks as the crown', r_crown, 'The ticks move into the plate: they run along a band at its top, between the outer and inner frame, with the end-of-hand diamond at their end. The frame gets cut corners, an octagon.',
  ['Everything under the card is one object: progress, the action and the two words.', 'The colours of the evening become the plate\'s jewelled top edge.', 'Against it: the most enclosed; the ticks get a frame round them.']),
 ('3 · Open ends', r_open, 'Back to A: no closed frame, only the three lines with the words in the middle one, ending at each side in a double point, like the arrow ends in your references.',
  ['Lighter than any framed version; the old design with the words finally in it.', 'The pointed ends give it the nameplate\'s shape without the box.', 'Against it: less of a single object than the framed ones.']),
 ('4 · Stepped plate', r_step, 'The plate steps up in the middle around Next card, like a deco building with a taller centre tower; the low wings either side carry the three lines and the words.',
  ['The biggest Next card, and the step makes it the clear centre without colour or glow.', 'The silhouette is the most deco of the four.', 'Against it: the tallest; Next card is closer to today\'s weight, which you now asked for.']),
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

html = f'''<title>Under the Card, Round 7</title>
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
<header><h1>Under the card, round 7</h1><p style="margin:6px 0 0;color:var(--muted)">Round 7: playing with your pick (words in the middle line) and the old design, with more room, a bigger Next card, no count, and the end-of-hand diamond back. The current version comes first. Drawn from scratch under a screenshot of the real title and card, 14 cards into a 20-card mixed hand, at the size of your phone. The empty space at the very bottom is real screen; on your phone the browser bar covers roughly the last 60 points of it.</p></header>

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
<li>Next card gets slimmer than today, in all of them.</li>
<li>No small diamonds, though the references use many: you reserved them for After Dark. The app has one gold-button look, shared with Draw Cards in The Deck, so Draw Cards would get the same slimmer height.</li></ul>
<h3>Outside check</h3>
<p>GATE_R7</p>
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
