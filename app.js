(function(){
const WA='19786315404';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const wa=t=>'https://wa.me/'+WA+'?text='+encodeURIComponent(t);
// intro
const intro=document.getElementById('intro');
setTimeout(()=>intro.classList.add('done'),RM?50:1700);
// reveals
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.14,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// stage progress + acts
const stage=document.getElementById('stage'),acts=[...document.querySelectorAll('.act')],fill=document.getElementById('hudFill'),hudAct=document.getElementById('hudAct');
const names=['01 / BEFORE','01 / BEFORE','02 / THE HAUL','03 / CLEAN SPACE'];
window.stageProgress=0;
function onScroll(){
  const r=stage.getBoundingClientRect(),h=stage.offsetHeight-innerHeight;
  const p=Math.min(1,Math.max(0,-r.top/h));window.stageProgress=p;
  fill.style.width=(p*100)+'%';
  const vh=innerHeight;let cur=0;
  acts.forEach((a,i)=>{const top=a.offsetTop+r.top;const vis=top<vh*.55&&top+a.offsetHeight>vh*.45;a.classList.toggle('show',vis);if(vis)cur=i});
  hudAct.textContent=names[cur];
}
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();
// nav wipe transition
const wipe=document.getElementById('wipe');
document.querySelectorAll('.nav nav a, .act .btn[href^="#"], .mbar a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const t=document.querySelector(a.getAttribute('href'));if(!t)return;e.preventDefault();
  if(RM){t.scrollIntoView();return}
  wipe.classList.remove('on');void wipe.offsetWidth;wipe.classList.add('on');
  setTimeout(()=>t.scrollIntoView({behavior:'instant',block:'start'}),330);
}));
// magnetic buttons + card tilt (pointer fine only)
if(!RM&&matchMedia('(pointer:fine)').matches){
  document.querySelectorAll('.magnet').forEach(b=>{
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.28}px)`});
    b.addEventListener('pointerleave',()=>b.style.transform='');
  });
  document.querySelectorAll('.tilt').forEach(c=>{
    c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      c.style.transform=`perspective(900px) rotateX(${-y*7}deg) rotateY(${x*9}deg) translateY(-4px)`;c.style.setProperty('--mx',(x*120)+'px');c.style.setProperty('--my',(y*120)+'px')});
    c.addEventListener('pointerleave',()=>c.style.transform='');
  });
}
// service cards -> WhatsApp
document.querySelectorAll('.card[data-svc]').forEach(c=>{c.href=wa(`Hi Camilo and Eliza, I found One Call Removal online. I'd like a free quote for ${c.dataset.svc}.`);c.target='_blank';c.rel='noopener'});
// item picker
const items=[
 ['Old cabinets',2,'<path d="M6 8h36v32H6z" class="f2"/><path d="M24 8v32M18 22v4M30 22v4" class="st"/>'],
 ['Furniture / sofa',4,'<path d="M4 22h40v14H4z" class="f2"/><path d="M8 14h32v10H8z" class="f1"/><path d="M6 36v6M42 36v6" class="st"/>'],
 ['Appliances',3,'<rect x="10" y="4" width="28" height="40" rx="3" class="f2"/><path d="M10 16h28M16 9v3M16 22v8" class="st"/>'],
 ['Mattress',3,'<path d="M4 18h40v14H4z" class="f2"/><path d="M10 25h4M22 25h4M34 25h4" class="st o"/>'],
 ['Yard debris',2,'<path d="M24 44V20" class="st"/><path d="M24 6c10 6 12 16 0 22C12 22 14 12 24 6z" class="f1"/><path d="M8 44h32" class="st"/>'],
 ['Construction bags',2,'<path d="M12 14h24l4 30H8z" class="f2"/><path d="M18 14c0-6 12-6 12 0" class="st"/><path d="M14 26h20" class="st o"/>'],
 ['Cast iron tub',4,'<path d="M4 18h40c0 12-6 20-20 20S4 30 4 18z" class="f2"/><path d="M10 38l-2 6M38 38l2 6M36 18V8h4" class="st"/>'],
 ['Railroad ties',3,'<path d="M4 16h40v8H4zM4 28h40v8H4z" class="f1"/><path d="M12 16v8M30 28v8" class="st"/>'],
 ['Boxes and clutter',2,'<path d="M6 22h18v20H6zM24 14h18v28H24z" class="f2"/><path d="M6 30h18M24 24h18" class="st o"/>'],
 ['Shed demo',5,'<path d="M6 44V22L24 8l18 14v22z" class="f2"/><path d="M18 44V30h12v14" class="st"/><path d="M34 4l8 8" class="st o"/>'],
 ['Garage clean out',5,'<path d="M4 20L24 6l20 14v24H4z" class="f2"/><path d="M10 26h28M10 32h28M10 38h28" class="st"/>'],
 ['Basement clean out',5,'<path d="M4 6h40v38H4z" class="f2"/><path d="M4 30h14v-8h12v-8h14" class="st o"/>'],
 ['Storage unit move',5,'<path d="M4 10h40v34H4z" class="f2"/><path d="M10 16h28v28H10z" class="f1"/><path d="M10 22h28M10 28h28" class="st"/>'],
 ['Moving help',4,'<path d="M4 16h26v20H4zM30 22h8l6 7v7H30z" class="f2"/><circle cx="12" cy="38" r="4" class="f1"/><circle cx="36" cy="38" r="4" class="f1"/>'],
 ['Other item',1,'<circle cx="24" cy="24" r="18" class="f2"/><path d="M24 15v18M15 24h18" class="st o"/>']
];
const chips=document.getElementById('chips'),list=document.getElementById('pickList'),send=document.getElementById('pickSend'),loadTxt=document.getElementById('loadTxt'),fr=document.getElementById('fillRect');
const sel=new Set();
items.forEach(([n,w,svg],i)=>{const b=document.createElement('button');b.type='button';b.className='chip';b.setAttribute('aria-pressed','false');b.innerHTML=`<svg viewBox="0 0 48 48" aria-hidden="true">${svg}</svg>${n}`;
 b.onclick=()=>{sel.has(i)?sel.delete(i):sel.add(i);b.setAttribute('aria-pressed',sel.has(i));render()};chips.appendChild(b)});
function render(){
  const arr=[...sel].map(i=>items[i]);const load=Math.min(1,arr.reduce((s,x)=>s+x[1],0)/16);
  const h=90*load;fr.setAttribute('y',110-h);fr.setAttribute('height',h);
  loadTxt.textContent=!arr.length?'Empty truck':load<.3?'Small load':load<.6?'Medium load':load<.95?'Big load':'Full truck';
  list.innerHTML=arr.length?arr.map(x=>`<li>${x[0]}</li>`).join(''):'<li class="muted">No items yet. Tap a few on the left.</li>';
  send.href=wa(arr.length?`Hi Camilo and Eliza, I'd like a free quote from One Call Removal.\nItems: ${arr.map(x=>x[0]).join(', ')}\nRough size: ${loadTxt.textContent}\nTown: `:"Hi One Call Removal, I'd like a free quote.");
}
render();
// before/after
const ba=document.getElementById('ba'),rg=document.getElementById('baRange');
rg.addEventListener('input',()=>ba.style.setProperty('--p',rg.value+'%'));
if(!RM){let done=false;new IntersectionObserver(es=>{if(es[0].isIntersecting&&!done){done=true;let t=0;const a=()=>{t+=.02;const v=50+Math.sin(t*3)*30*(1-t);rg.value=v;ba.style.setProperty('--p',v+'%');if(t<1)requestAnimationFrame(a)};setTimeout(a,500)}},{threshold:.5}).observe(ba)}
// form
const f=document.getElementById('qform'),err=document.getElementById('qerr');
function msg(){const d=new FormData(f);return `Hi Camilo and Eliza, I'd like a free quote from One Call Removal.\nName: ${d.get('name')}\nTown: ${d.get('town')}\nService: ${d.get('svc')}\nTiming: ${d.get('when')}\nDetails: ${d.get('msg')||'-'}`}
function ok(){if(!f.name.value.trim()||!f.town.value.trim()){err.textContent='Please add your name and town so we can quote you.';(f.name.value.trim()?f.town:f.name).focus();return false}err.textContent='';return true}
f.addEventListener('submit',e=>{e.preventDefault();if(ok())window.open(wa(msg()),'_blank','noopener')});
document.getElementById('qmail').onclick=()=>{if(ok())location.href='mailto:onecallremovalllc@gmail.com?subject='+encodeURIComponent('Free quote request')+'&body='+encodeURIComponent(msg())};
})();
