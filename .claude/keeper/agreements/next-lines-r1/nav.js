// Streamline bands beside Next card (phone). Three bands a side, at today's rows (-6, 0, +6 from the button's centre),
// leaving the button at today's gap; they share one turning centre per side so they stay parallel, and stop together
// on one line, cut clean. Heaviest band outermost, as in the bar under the name (2 / 1.25 / 1).
const {chromium}=require('playwright');
const V={today:null,down:'down',up:'up'};
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
  const stop=mode==='down'?Math.min(sp.top,mn.top)-6:prog.bottom+8;
  const sgn=mode==='down'?1:-1;            // turning direction
  // turning centre per side: the outermost vertical sits `edge` from the screen edge; the bands are 6px apart
  for(const side of [-1,1]){
    const x0=side<0?btn.left-gap:btn.right+gap;
    // the band whose vertical sits outermost is the one turning on the largest radius: the row on the far side of the turn
    const ordered=rows.map(([o,w])=>({o,w,y:cy+o}));
    const yc=mode==='down'?cy+6+10:cy-6-10;       // centre 10px past the inner row, so the tightest radius is 10
    for(const r of ordered){
      const rad=Math.abs(yc-r.y);
      const xv=side<0?edge+(rad-(Math.abs(yc-(mode==='down'?cy-6:cy+6))))*-1+0:0; // placeholder
    }
    const big=Math.abs(yc-(mode==='down'?cy-6:cy+6));   // largest radius
    const xc=side<0?edge+big:W-edge-big;
    for(const r of ordered){
      const rad=Math.abs(yc-r.y),xv=side<0?xc-rad:xc+rad;
      const sweep=(side<0)===(mode==='down')?0:1;
      add(`M${x0} ${r.y}H${xc}A${rad} ${rad} 0 0 ${sweep} ${xv} ${yc}V${stop}`,r.w);
    }
  }
  document.body.appendChild(svg);
 },mode);
 await p.waitForTimeout(200);
 await p.screenshot({path:`nav-${name}.png`});
 await p.close();}
await b.close();})();
