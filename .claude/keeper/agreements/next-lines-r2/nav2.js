// Streamline bands beside Next card (phone). Three bands a side, at today's rows (-6, 0, +6 from the button's centre),
// leaving the button at today's gap; they share one turning centre per side so they stay parallel, and stop together
// on one line, cut clean. Heaviest band outermost, as in the bar under the name (2 / 1.25 / 1).
const {chromium}=require('playwright');
const V={today:null,bar:'bar'};
(async()=>{const b=await chromium.launch();
for(const [name,mode] of Object.entries(V)){
 const p=await b.newPage({viewport:{width:412,height:860},deviceScaleFactor:2});
 await p.addInitScript(()=>{let x=12345;Math.random=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648;};crypto.getRandomValues=a=>{a[0]=4;return a};try{localStorage.clear()}catch(e){}});
 await p.goto('http://localhost:8765/between-us.html');await p.waitForTimeout(1200);
 await p.click('#btn-next');await p.waitForTimeout(2600);
 if(mode)await p.evaluate(mode=>{
  document.querySelectorAll('.nav-lines').forEach(e=>e.style.visibility='hidden');
  const R=s=>document.querySelector(s).getBoundingClientRect();
  const btn=R('#btn-next'),sp=R('#btnParty .row-lbl'),mn=R('#btn-menu .row-lbl'),prog=R('#progress');
  const cy=btn.top+btn.height/2,gap=6*Math.min(1.2,document.querySelector('.controls-wrap').clientWidth/339);
  const W=innerWidth,edge=24;           // today's middle line ends 24 from the screen's edge
  const rows=[[-6,2],[0,1.25],[6,1]];   // [offset, weight]
  let d='';
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('style',`position:absolute;left:0;top:${scrollY}px;width:${W}px;height:${document.documentElement.scrollHeight}px;pointer-events:none;overflow:visible`);
  svg.setAttribute('viewBox',`0 0 ${W} ${document.documentElement.scrollHeight}`);
  const add=(path,w)=>{const e=document.createElementNS(ns,'path');e.setAttribute('d',path);e.setAttribute('fill','none');
    e.setAttribute('style',`stroke:var(--gold);stroke-width:${w}px`);svg.appendChild(e);};
  // down: the bands turn down and stop just above the words, so they lead the eye to Spotlight and Menu.
  // up: the bands turn up and stop just under the card's ticks, so they hold the count and the button as one piece.
  // The bar's streamline bands (round 2, option 3) at the scale they have under the name (0.8px a unit on a phone):
  // rows 5.6px apart, one turning centre a side, radii 7.2 / 12.8 / 18.4, all three ending on one line 12.8px above
  // the middle row. Heaviest band at the bottom. All gold: the middle band's deck colour is left out.
  const u=0.8,top=cy-16*u;
  const R3=[[-7*u,1,9*u],[0,1.25,16*u],[7*u,2,23*u]];
  for(const side of [-1,1]){
    const x0=side<0?btn.left-gap:btn.right+gap;
    const xc=side<0?edge+23*u:W-edge-23*u;
    for(const [o,w,rad] of R3){const y=cy+o,xe=side<0?xc-rad:xc+rad;
      add(`M${x0} ${y}H${xc}A${rad} ${rad} 0 0 ${side<0?1:0} ${xe} ${top}`,w);}
  }
  document.body.appendChild(svg);
 },mode);
 await p.waitForTimeout(200);
 await p.screenshot({path:`nav-${name}.png`});
 await p.close();}
await b.close();})();
