// Round 2, the new versions: 3 streamline bands, 4 stepped glass, 5 rethink (the name stands on the bar).
const {chromium}=require('playwright');
const G='var(--gold)', P='url(#trP)', C='var(--copper)';
const L=(d,c,w,extra='')=>`<path d="${d}" style="stroke:${c};stroke-width:${w}px;fill:none;opacity:1;${extra}"/>`;
const F=(d,c,op=1)=>`<path d="${d}" style="fill:${c};stroke:none;opacity:${op}"/>`;
const FS=(d,fill,op,stroke,w)=>`<path d="${d}" style="fill:${fill};fill-opacity:${op};stroke:${stroke};stroke-width:${w}px;opacity:1"/>`;
const dot=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" style="fill:${c}"/>`;
const mir=x=>400-x;
function logo(cy,k,w){const h=12.5*k,o=3.5*k,f=9*k;
  const dia=cx=>`M${cx-h} ${cy}L${cx} ${cy-h}L${cx+h} ${cy}L${cx} ${cy+h}Z`;
  return F(`M${200-h-o} ${cy}L${200-o} ${cy-h}L200 ${cy-h+o}L${200+o} ${cy-h}L${200+h+o} ${cy}L${200+o} ${cy+h}L200 ${cy+h-o}L${200-o} ${cy+h}Z`,'var(--bg,#0c0b0a)')
   +L(dia(200-o)+dia(200+o),G,w,'stroke-linejoin:miter')+F(`M${200-f} ${cy}L200 ${cy-f}L${200+f} ${cy}L200 ${cy+f}Z`,C);}
const edgeOf=(k,dy)=>{const h=12.5*k,o=3.5*k;return 200-o-(h-Math.abs(dy));};
// 3. Streamline bands: three bands run out from the diamonds and round the corner upward together, like the house's balconies.
// One shared turning centre per side, so the bands stay parallel; all three stop on the same line, cut clean.
function S(){const cy=22,k=1.36,X=318,top=6,out=[];
  const rows=[[-7,G,1],[0,P,1.5],[7,G,2.6]];
  for(const [dy,c,w] of rows){const y=cy+dy,r=y-top,x1=edgeOf(k,dy);
    out.push(L(`M${x1} ${y}H${mir(X)}A${r} ${r} 0 0 1 ${mir(X)-r} ${top}`,c,w,'stroke-linecap:butt'));
    out.push(L(`M${mir(x1)} ${y}H${X}A${r} ${r} 0 0 0 ${X+r} ${top}`,c,w,'stroke-linecap:butt'));}
  out.push(logo(cy,k,1.7));return {vb:'0 0 400 42',svg:out.join('')};}
// 4. Stepped glass: the lamp's frosted steps laid on their side. Four blocks per side, each lower than the one before
// (heights 20, 14, 8, 3), separated by the same gap; gold glass with a fine gold edge. The deck's colour runs through
// them as the spine and stops on a dot.
function T(){const cy=16,k=1.2,out=[];
  // one stepped silhouette per side, like the lamp's glass: each step lower than the one before (heights 20, 14, 8, 3),
  // each the same length; a fine gold edge, pale gold glass, and a riser line at every step.
  const steps=[[10,150],[7,116],[4,84],[1.5,56]];const x0=edgeOf(k,10);
  let d=`M${x0} ${cy-10}`;for(const [hh,x] of steps){d+=`V${cy-hh}H${x}`;}
  d+=`V${cy+1.5}`;for(let i=steps.length-1;i>=0;i--){const [hh,x]=steps[i];const xin=i?steps[i-1][1]:x0;d+=`V${cy+hh}H${xin}`;}
  d+=`V${cy+10}`;d=d.replace(/V\d+(\.\d+)?V/g,'V');
  const m=d.replace(/([MH])(\d+(\.\d+)?)/g,(_,c,n)=>c+(400-parseFloat(n)));
  out.push(FS(d+'Z',G,.14,G,1),FS(m+'Z',G,.14,G,1));
  for(const [hh,x] of steps.slice(0,3)){out.push(L(`M${x} ${cy-hh}V${cy+hh}M${400-x} ${cy-hh}V${cy+hh}`,G,1));}
  out.push(L(`M30 ${cy}H${edgeOf(k,0)}M${mir(edgeOf(k,0))} ${cy}H370`,P,1.5));
  out.push(dot(30,cy,2.4,P),dot(370,cy,2.4,P));
  out.push(logo(cy,k,1.6));return {vb:'0 0 400 32',svg:out.join('')};}
// 5. Rethink: the name stands on the bar. The top band is the title's floor, as wide as the word; the diamonds hang
// from it as a keystone; the floors below step inward, like the house's storeys seen from the street.
function R(){const top=3,k=1.1,h=12.5*k,cy=top+h,out=[];
  out.push(L(`M14 ${top}H386`,G,2.6,'stroke-linecap:round'));
  const rows=[[top+7,G,1,46],[top+13,P,1.5,82],[top+19,G,1,118]];
  for(const [y,c,w,x0] of rows){const x1=edgeOf(k,y-cy);out.push(L(`M${x0} ${y}H${x1}M${mir(x1)} ${y}H${mir(x0)}`,c,w));
    out.push(dot(x0,y,c===P?2.1:1.8,c),dot(mir(x0),y,c===P?2.1:1.8,c));}
  out.push(logo(cy,k,1.6));return {vb:'0 0 400 32',svg:out.join('')};}
const V={D:T()};
(async()=>{const b=await chromium.launch();
 for(const [name,v] of Object.entries(V)){
  for(const dev of ['phone','pc']){
   const p=await b.newPage(dev==='phone'?{viewport:{width:412,height:860},deviceScaleFactor:2}:{viewport:{width:1440,height:900},deviceScaleFactor:2});
   await p.addInitScript(()=>{let x=12345;Math.random=()=>{x=(x*1103515245+12345)%2147483648;return x/2147483648;};crypto.getRandomValues=a=>{a[0]=4;return a};try{localStorage.clear()}catch(e){}});
   await p.goto('http://localhost:8765/between-us.html');await p.waitForTimeout(1200);
   await p.evaluate(([v,name])=>{const s=document.querySelector('.tr-svg');const defs=s.querySelector('defs').outerHTML;
     s.setAttribute('viewBox',v.vb);s.innerHTML=defs+v.svg;
     if(name==='R'){ // the band meets the letters' foot: measure the gap between the glyphs' baseline and the rule, close it
       const t=document.querySelector('.title'),r=document.querySelector('.title-rule');
       const cs=getComputedStyle(t);const c=document.createElement('canvas').getContext('2d');c.font=`${cs.fontSize} ${cs.fontFamily}`;
       const m=c.measureText(t.textContent);const tb=t.getBoundingClientRect();
       const base=tb.top+(tb.height-(m.fontBoundingBoxAscent+m.fontBoundingBoxDescent))/2+m.fontBoundingBoxAscent;
       const rb=r.getBoundingClientRect();const bandY=rb.top+rb.width*3/400;
       const mt=parseFloat(getComputedStyle(r).marginTop);r.style.marginTop=(mt-(bandY-base)+rb.width*2.2/400)+'px';}
   },[v,name]);
   await p.click('#btn-next');await p.waitForTimeout(2600);
   if(dev==='phone')await p.screenshot({path:`r2-${name}-phone.png`,clip:{x:0,y:0,width:412,height:620}});
   else await p.screenshot({path:`r2-${name}-pc.png`,clip:{x:320,y:0,width:800,height:300}});
   await p.close();}}
 await b.close();})();
