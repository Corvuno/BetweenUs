// Round 1: the bar under the name. Today, A (the same bar, unapologetic), B (full ornament).
const {chromium}=require('playwright');
const G='var(--gold)', P='url(#trP)', C='var(--copper)';
const L=(d,c,w,extra='')=>`<path d="${d}" style="stroke:${c};stroke-width:${w}px;fill:none;opacity:1;${extra}"/>`;
const F=(d,c)=>`<path d="${d}" style="fill:${c};stroke:none;opacity:1"/>`;
const dot=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" style="fill:${c}"/>`;
const ring=(x,y,r,c,w)=>`<circle cx="${x}" cy="${y}" r="${r}" style="fill:none;stroke:${c};stroke-width:${w}px" vector-effect="non-scaling-stroke"/>`;
const mir=x=>400-x;
// logo diamonds, scaled about (200,cy): today's half-diagonal 12.5, centres 196.5/203.5, inner filled half 9
function logo(cy,k,w){const h=12.5*k,o=3.5*k,f=9*k;
  const dia=(cx)=>`M${cx-h} ${cy}L${cx} ${cy-h}L${cx+h} ${cy}L${cx} ${cy+h}Z`;
  return L(dia(200-o)+dia(200+o),G,w,'stroke-linejoin:miter')+F(`M${200-f} ${cy}L200 ${cy-f}L${200+f} ${cy}L200 ${cy+f}Z`,C);}
// A: today's composition exactly, weight raised, nothing fades, every line stops on a dot
function A(){const cy=14,out=[];
  out.push(L(`M10 14H184M216 14H390`,G,2.2));                       // spine, full strength to its ends
  out.push(dot(10,14,3.6,G),dot(390,14,3.6,G));                      // spine: the largest stop
  out.push(L(`M150 1.5H196.5M150 26.5H196.5M203.5 1.5H250M203.5 26.5H250`,G,2.2)); // gold bars off the diamond tips
  out.push(dot(150,1.5,2.4,G),dot(150,26.5,2.4,G),dot(250,1.5,2.4,G),dot(250,26.5,2.4,G));
  out.push(L(`M112 8H178M112 20H178M222 8H288M222 20H288`,P,2));      // the deck's colour pair
  out.push(dot(112,8,2.4,P),dot(112,20,2.4,P),dot(288,8,2.4,P),dot(288,20,2.4,P));
  out.push(logo(cy,1,2.2));
  return {vb:'0 0 400 28',svg:out.join('')};}
// B: a stepped bundle. Lines grow out of the diamonds; the nearer the spine, the further out they reach (steps of 22);
// the gold bands come off the diamond tips as solid rounded bands (the house's balconies); every thin line stops on a dot,
// the spine on a ring with a dot (its largest stop).
function B(){const cy=22,k=1.36,h=12.5*k,o=3.5*k,out=[];
  const edge=dy=>200-o-(h-Math.abs(dy));   // where row dy leaves the left diamond's outline
  const row=(dy,x0,c,w,stop)=>{const y=cy+dy,x1=edge(dy);
    out.push(L(`M${x0} ${y}H${x1}M${mir(x1)} ${y}H${mir(x0)}`,c,w,'stroke-linecap:round'));
    if(stop)out.push(dot(x0,y,stop,c),dot(mir(x0),y,stop,c));};
  row(-h,140,G,3.6,0); row(h,140,G,3.6,0);              // gold bands, solid, round ends
  row(-12.5,118,G,1.4,2.2); row(12.5,118,G,1.4,2.2);    // fine gold
  row(-7,96,P,2.2,2.6); row(7,96,P,2.2,2.6);            // the deck's colour pair
  const sx=200-o-h; out.push(L(`M34 ${cy}H${sx}M${mir(sx)} ${cy}H366`,G,2.2));
  out.push(ring(27,cy,6,G,1.6),dot(27,cy,2.6,G),ring(373,cy,6,G,1.6),dot(373,cy,2.6,G));
  out.push(logo(cy,k,2.4));
  return {vb:'0 0 400 44',svg:out.join('')};}
const V={today:null,A:A(),B:B()};
(async()=>{const b=await chromium.launch();
 for(const [name,v] of Object.entries(V)){
  for(const dev of ['phone','pc']){
   const p=await b.newPage(dev==='phone'?{viewport:{width:412,height:860},deviceScaleFactor:2}:{viewport:{width:1440,height:900},deviceScaleFactor:2});
   await p.addInitScript(()=>{let x=12345;Math.random=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648;};crypto.getRandomValues=a=>{a[0]=4;return a};try{localStorage.clear()}catch(e){}});
   await p.goto('http://localhost:8765/between-us.html');await p.waitForTimeout(1200);
   if(v)await p.evaluate(v=>{const s=document.querySelector('.tr-svg');const defs=s.querySelector('defs').outerHTML;
     s.setAttribute('viewBox',v.vb);s.innerHTML=defs+v.svg;},v);
   await p.waitForTimeout(300);
   if(dev==='phone')await p.screenshot({path:`r1-${name}-phone.png`,clip:{x:0,y:0,width:412,height:620}});
   else await p.screenshot({path:`r1-${name}-pc.png`,clip:{x:320,y:0,width:800,height:300}});
   await p.close();}}
 await b.close();})();
