(function(){
const TZ="America/New_York";
const today=new Intl.DateTimeFormat("en-CA",{timeZone:TZ}).format(new Date());
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const get=u=>fetch(u,{cache:"no-store"}).then(r=>r.ok?r.json():null).catch(()=>null);
const nice=d=>new Date(d+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const addDays=(d,n)=>{const t=new Date(d+"T12:00:00Z");t.setUTCDate(t.getUTCDate()+n);return t.toISOString().slice(0,10)};
const camOk=(c,cam)=>{if(!c)return false;const l=(Array.isArray(c)?c:[c]).map(x=>String(x).toLowerCase());return l.includes(cam)||l.some(x=>x.includes("both"))};
const empty=t=>`<div class="empty">${esc(t)}</div>`;
const Cap=c=>c[0].toUpperCase()+c.slice(1);
window.PARENTS={today,esc,get,nice,addDays,camOk,empty,Cap};
if(!document.getElementById("home"))return;
let cam=localStorage.getItem("parents:campus")||"windermere";
const q=new URLSearchParams(location.search).get("campus");if(q==="lakeside"||q==="windermere")cam=q;
let D={};
Promise.all(["at-home.json","../announcements.json","../calendar.json","../guides.json","../service.json","../resources.json"].map(get)).then(r=>{
 D={home:r[0]||[],ann:r[1],cal:r[2],gd:r[3],svc:r[4],res:r[5]};render();});
document.querySelectorAll(".toggle button").forEach(b=>b.onclick=()=>{cam=b.dataset.c;localStorage.setItem("parents:campus",cam);render();});
const put=(id,h)=>document.querySelector("#"+id+" > div").innerHTML=h;
function render(){
 document.querySelectorAll(".toggle button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.c===cam));
 const C=Cap(cam);
 // This week at home
 const e=(Array.isArray(D.home)?D.home:[]).filter(x=>x&&x.weekOf&&camOk(x.campus,cam)&&x.weekOf<=today&&today<addDays(x.weekOf,7)).sort((a,b)=>b.weekOf<a.weekOf?-1:1)[0];
 put("home",e?`<a class="card" href="guide/?week=${esc(e.weekOf)}&campus=${cam}"><span class="date">Week of ${esc(nice(e.weekOf))}</span>
  <h3>${esc(e.sermonTitle)}</h3>${e.scripture?`<p class="where">${esc(e.scripture)}</p>`:""}
  ${(e.questions||[]).length?`<div class="ask"><b>Ask at dinner</b>${esc(e.questions[0])}</div>`:""}
  <span class="go">Open the parent guide →</span></a>`:empty(`This week's at-home guide for ${C} isn't posted yet. Check back soon!`));
 // Events
 let ev=[];
 ((D.ann&&D.ann.prompts&&D.ann.prompts[0].events)||[]).forEach(x=>{if(x.endDate&&x.endDate>=today&&camOk(x.campus,cam))ev.push({sort:x.endDate,title:x.name,when:x.when,where:x.where,detail:x.detail});});
 ((D.cal&&D.cal.events)||[]).forEach(x=>{if(x.date>=today&&!/series/i.test(x.title)&&(!x.campus||camOk(x.campus,cam))&&(x.campus||cam==="windermere")&&!ev.some(y=>y.title.toLowerCase()===x.title.toLowerCase()))
  ev.push({sort:x.date,title:x.title,when:nice(x.date)+(x.time?" · "+x.time:""),detail:x.detail});});
 ev.sort((a,b)=>a.sort<b.sort?-1:1);
 put("events",ev.length?ev.map(x=>`<div class="card"><div class="when">${esc(x.when)}</div><h3>${esc(x.title)}</h3>${x.where?`<p class="where">${esc(x.where)}</p>`:""}${x.detail?`<p>${esc(x.detail)}</p>`:""}</div>`).join(""):empty(`No upcoming ${C} events are posted yet. We'll add them here as soon as they're set.`));
 // Messages (Wednesday preaching calendar = Windermere rooms)
 let msg="";
 if(cam==="windermere"&&D.gd){const by={};D.gd.guides.forEach(g=>g.weeks.forEach(w=>{if(w.date>=today){(by[w.date]=by[w.date]||[]).push([g.label,w]);}}));
  const ds=Object.keys(by).sort().slice(0,6);
  msg=ds.map(d=>{const L=by[d],w=L[0][1];
   if(w.noService)return `<div class="card"><span class="date">${esc(nice(d))}</span><h3>${esc(w.title)}</h3>${w.note?`<p>${esc(w.note)}</p>`:""}</div>`;
   const same=L.length<2||(L[0][1].title===L[1][1].title);
   const block=(lab,w)=>`${lab?`<p class="lab">${esc(lab)}</p>`:""}<h3>${esc(w.title)}${w.sensitivity==="yellow"||w.sensitivity==="red"?'<span class="tag">Sensitive topic</span>':""}</h3>
    ${w.scripture?`<p class="where">${esc(w.scripture)}</p>`:""}${w.bigIdea?`<p>${esc(w.bigIdea)}</p>`:w.note?`<p>${esc(w.note)}</p>`:""}
    ${w.parentQuestion?`<div class="ask"><b>Ask your student</b>${esc(w.parentQuestion)}</div>`:""}`;
   return `<div class="card"><span class="date">${esc(nice(d))}</span> <span class="when">${esc(w.series)}${w.week?" · "+esc(w.week):""}</span>${same?block("",w):L.map(([l,x])=>block(l,x)).join("")}</div>`;}).join("");}
 put("messages",msg||empty(cam==="windermere"?"No upcoming messages are posted yet.":"Lakeside's message calendar isn't posted here yet. Check back soon!"));
 // Times
 const sv=((D.svc&&D.svc.services)||[]).filter(s=>s.title.toLowerCase().includes(cam));
 put("times",sv.length?sv.map(s=>`<div class="card"><h3>${esc(s.title.replace(/ · (Windermere|Lakeside)$/,""))}</h3><div class="when">${esc(s.when||"")}</div><p class="where">${esc(s.where||"")}</p></div>`).join(""):empty(`${C} service times aren't posted yet.`));
 // Connect
 const items=[];((D.res&&D.res.groups)||[]).forEach(g=>g.items.forEach(i=>{if(i.type==="page")return;
  if(i.title==="BAND invite"&&cam==="windermere")items.push(`<a class="card" href="${esc(i.url)}" rel="noopener"><h3>Join us on BAND</h3><p>BAND is where we share updates and keep families in the loop all week. Join "${esc(i.groupName||"")}"; an admin approves each request.</p><span class="go">Open BAND →</span></a>`);
  if(g.title==="Public links"&&(cam==="windermere"||/website/i.test(i.title)))items.push(`<a class="card" href="${esc(i.url)}" rel="noopener"><h3>${esc(i.title)}</h3><span class="go">Visit →</span></a>`);}));
 put("connect",items.join("")||empty("Connection links are coming soon."));
 const up=[D.ann&&D.ann.updatedAt,D.cal&&D.cal.updatedAt].filter(Boolean);
 document.getElementById("foot").textContent="Family Church Students · We're so glad your family is here."+(D.ann&&D.ann.updatedAt?" Updated "+D.ann.updatedAt+".":"");
}
})();
