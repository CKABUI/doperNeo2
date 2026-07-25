/* ---------- Theme toggle (dark / light) ---------- */
const THEME_KEY="dorperpro_theme";
function applyTheme(theme){
  if(theme==="dark"){document.documentElement.setAttribute("data-theme","dark")}
  else{document.documentElement.removeAttribute("data-theme")}
  const icon=document.getElementById("themeIcon"),label=document.getElementById("themeLabel");
  if(icon)icon.textContent=theme==="dark"?"🌙":"☀️";
  if(label)label.textContent=theme==="dark"?"Dark":"Light";
}
(function initTheme(){
  const saved=localStorage.getItem(THEME_KEY);
  const theme=saved||(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
  applyTheme(theme);
})();
document.getElementById("themeToggle").onclick=()=>{
  const current=document.documentElement.getAttribute("data-theme")==="dark"?"dark":"light";
  const next=current==="dark"?"light":"dark";
  localStorage.setItem(THEME_KEY,next);
  applyTheme(next);
};

/* ---------- Interactive tabs (Breeds & Meat background info) ---------- */
document.querySelectorAll(".tabs").forEach(group=>{
  group.querySelectorAll(".tab-btn").forEach(btn=>{
    btn.onclick=()=>{
      group.querySelectorAll(".tab-btn").forEach(b=>b.classList.toggle("active",b===btn));
      group.querySelectorAll(".tab-panel").forEach(p=>p.classList.toggle("active",p.dataset.panel===btn.dataset.tab));
    };
  });
});

const KEY="dorperpro2_data";
const today=()=>new Date().toISOString().slice(0,10);
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
let data=JSON.parse(localStorage.getItem(KEY)||"null")||{
animals:[
{id:"a1",tag:"DP-R001",name:"Mfalme",sex:"Ram",breed:"Dorper",dob:"2023-04-12",weight:82,targetWeight:85,birthType:"Single",sire:"SA-R101",dam:"KE-E015",status:"Breeding",growthScore:92,fertilityScore:88,motheringScore:70,resilienceScore:84,notes:"High-growth breeding ram."},
{id:"a2",tag:"DP-E001",name:"Hope",sex:"Ewe",breed:"Dorper",dob:"2023-06-18",weight:58,targetWeight:55,birthType:"Twin",sire:"SA-R100",dam:"KE-E010",status:"Pregnant",growthScore:85,fertilityScore:90,motheringScore:94,resilienceScore:86,notes:"Proven mother."},
{id:"a3",tag:"DP-L004",name:"Baraka",sex:"Lamb",breed:"Dorper",dob:"2026-02-15",weight:42,targetWeight:45,birthType:"Twin",sire:"DP-R001",dam:"DP-E001",status:"Ready for Market",growthScore:90,fertilityScore:60,motheringScore:60,resilienceScore:82,notes:"Fast-growing lamb."}
],
feeding:[{id:"f1",animalId:"a3",feed:"Pasture + pellets",qty:"2 kg",date:"2026-07-10",notes:"Morning and evening."}],
health:[{id:"h1",animalId:"a1",type:"Vaccination",action:"Clostridial vaccine",date:"2026-06-20",nextDue:"2027-06-20",notes:"Routine vaccination."}],
questions:[{id:"q1",title:"How do I select a ram for growth?",category:"Genetics",body:"I want to improve growth and meat performance without losing fertility or hardiness. Which traits should I prioritise?",date:"2026-07-15"}],
finance:[{id:"fin1",type:"Expense",category:"Feed",amount:25000,date:"2026-07-05",notes:"Monthly feed and supplements"},{id:"fin2",type:"Revenue",category:"Sheep Sale",amount:85000,date:"2026-07-12",notes:"Sale of one market lamb"}],
sales:[{id:"s1",animalId:"a3",date:"2026-07-12",weight:42,price:85000,buyer:"Local butcher"}]
};
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function animal(id){return data.animals.find(a=>a.id===id)}
function showToast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)}
function go(section){document.querySelectorAll(".page-section").forEach(s=>s.classList.toggle("active",s.id===section));document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.section===section));document.querySelector(".app-shell").classList.remove("sidebar-open");window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".nav-link").forEach(b=>b.onclick=()=>go(b.dataset.section));
document.querySelectorAll("[data-section-target]").forEach(b=>b.onclick=()=>go(b.dataset.sectionTarget));
$("menuBtn").onclick=()=>document.querySelector(".app-shell").classList.toggle("sidebar-open");
document.querySelectorAll("[data-open-modal]").forEach(b=>b.onclick=()=>{$("animalForm").reset();$("animalId").value="";$("animalModalTitle").textContent="Add Sheep";$("animalModal").classList.add("open")});
document.querySelector(".close-modal").onclick=()=>$("animalModal").classList.remove("open");
window.onclick=e=>{if(e.target==$("animalModal"))$("animalModal").classList.remove("open")};

function renderDashboard(){
$("totalAnimals").textContent=data.animals.filter(a=>a.status!=="Sold").length;
$("totalEwes").textContent=data.animals.filter(a=>a.sex==="Ewe"&&a.status!=="Sold").length;
$("totalRams").textContent=data.animals.filter(a=>a.sex==="Ram"&&a.status!=="Sold").length;
$("readyMarket").textContent=data.animals.filter(a=>a.weight>=a.targetWeight&&a.status!=="Sold").length;
$("dashboardAnimals").innerHTML=data.animals.slice(0,5).map(a=>`<div class="list-row"><strong>${escapeHTML(a.tag)}</strong> — ${escapeHTML(a.name||"Unnamed")} <span class="badge">${a.weight} kg</span></div>`).join("")||"<p>No animals yet.</p>";
let alerts=data.health.filter(h=>h.nextDue&&h.nextDue<=new Date(Date.now()+14*86400000).toISOString().slice(0,10)).length;
let ready=data.animals.filter(a=>a.weight>=a.targetWeight&&a.status!=="Sold").length;
$("smartAlerts").innerHTML=`<h4>🔔 Smart Farm Alerts</h4><span class="alert-item">${alerts?"💉 "+alerts+" health action(s) due soon":"🟢 No health actions due soon"}</span><span class="alert-item">${ready?"🥩 "+ready+" sheep at market weight":"🟡 No sheep at target market weight"}</span>`;
let rev=data.finance.filter(x=>x.type==="Revenue").reduce((s,x)=>s+Number(x.amount),0);
$("marketSummary").innerHTML=`<h4>💰 Commercial Snapshot</h4><strong>KES ${rev.toLocaleString()}</strong><br><small>Recorded revenue · ${data.sales.length} sale(s)</small>`;
}
function renderAnimals(){
let q=($("animalSearch").value||"").toLowerCase(),f=$("animalFilter").value;
let list=data.animals.filter(a=>(!q||`${a.tag} ${a.name} ${a.breed}`.toLowerCase().includes(q))&&(!f||a.sex===f));
$("animalsTableBody").innerHTML=list.map(a=>`<tr><td><strong>${escapeHTML(a.tag)}</strong></td><td>${escapeHTML(a.name||"—")}</td><td>${a.sex}</td><td>${a.breed}</td><td>${a.dob}</td><td>${a.weight} kg</td><td>${a.status}</td><td><button class="action-btn" onclick="editAnimal('${a.id}')">Edit</button><button class="action-btn" onclick="deleteAnimal('${a.id}')">Delete</button></td></tr>`).join("")||`<tr><td colspan="8" class="empty">No animals found.</td></tr>`;
}
function selects(){
let opts=data.animals.map(a=>`<option value="${a.id}">${escapeHTML(a.tag)} — ${escapeHTML(a.name||a.breed)}</option>`).join("");
["feedingAnimal","healthAnimal","growthAnimal","saleAnimal"].forEach(id=>$(id).innerHTML='<option value="">Select sheep</option>'+opts);
let ewes=data.animals.filter(a=>a.sex==="Ewe").map(a=>`<option value="${a.id}">${escapeHTML(a.tag)} — ${escapeHTML(a.name||"Ewe")}</option>`).join("");
$("lambingEwe").innerHTML='<option value="">Select ewe</option>'+ewes;
let rams=data.animals.filter(a=>a.sex==="Ram").map(a=>`<option value="${a.id}">${escapeHTML(a.tag)} — ${escapeHTML(a.name||"Ram")}</option>`).join("");
$("compatRam").innerHTML='<option value="">Select ram</option>'+rams;$("compatEwe").innerHTML='<option value="">Select ewe</option>'+ewes;
}
function renderGrowth(){
let avg=data.animals.length?data.animals.reduce((s,a)=>s+Number(a.weight),0)/data.animals.length:0,ready=data.animals.filter(a=>a.weight>=a.targetWeight).length;
$("growthSummary").innerHTML=`<div class="analytics-card"><strong>${avg.toFixed(1)} kg</strong><small>Average flock weight</small></div><div class="analytics-card"><strong>${ready}</strong><small>At target weight</small></div><div class="analytics-card"><strong>${data.animals.length}</strong><small>Animals tracked</small></div><div class="analytics-card"><strong>${Math.round(data.animals.reduce((s,a)=>s+Math.min(100,a.weight/a.targetWeight*100),0)/Math.max(1,data.animals.length))}%</strong><small>Average target progress</small></div>`;
$("growthTableBody").innerHTML=data.animals.map(a=>{let p=Math.min(100,Math.round(a.weight/a.targetWeight*100));return`<tr><td>${a.tag}</td><td>${a.weight} kg</td><td>${a.targetWeight} kg</td><td><div class="progress"><span style="width:${p}%"></span></div>${p}%</td><td>${p>=100?"🟢 Ready":"🟡 Growing"}</td></tr>`}).join("");
}
function renderFeeding(){$("feedingTableBody").innerHTML=data.feeding.map(x=>{let a=animal(x.animalId);return`<tr><td>${x.date}</td><td>${a?.tag||"Unknown"}</td><td>${escapeHTML(x.feed)}</td><td>${escapeHTML(x.qty||"—")}</td><td>${escapeHTML(x.notes||"—")}</td></tr>`}).join("")||`<tr><td colspan="5" class="empty">No feeding records.</td></tr>`}
function renderHealth(){$("healthTableBody").innerHTML=data.health.map(x=>{let a=animal(x.animalId);return`<tr><td>${x.date}</td><td>${a?.tag||"Unknown"}</td><td>${x.type}</td><td>${escapeHTML(x.action)}</td><td>${x.nextDue||"—"}</td></tr>`}).join("")||`<tr><td colspan="5" class="empty">No health records.</td></tr>`;$("healthSummary").innerHTML=`<div class="analytics-card"><strong>${data.health.length}</strong><small>Health records</small></div><div class="analytics-card"><strong>${data.health.filter(x=>x.nextDue&&x.nextDue>=today()).length}</strong><small>Upcoming actions</small></div>`}
function renderFinance(){let rev=data.finance.filter(x=>x.type==="Revenue").reduce((s,x)=>s+Number(x.amount),0),exp=data.finance.filter(x=>x.type==="Expense").reduce((s,x)=>s+Number(x.amount),0);$("financeSummary").innerHTML=`<div class="analytics-card"><strong>KES ${rev.toLocaleString()}</strong><small>Total revenue</small></div><div class="analytics-card"><strong>KES ${exp.toLocaleString()}</strong><small>Total expenses</small></div><div class="analytics-card"><strong>KES ${(rev-exp).toLocaleString()}</strong><small>Estimated net</small></div><div class="analytics-card"><strong>${data.finance.length}</strong><small>Transactions</small></div>`;$("financeTableBody").innerHTML=data.finance.slice().reverse().map(x=>`<tr><td>${x.date}</td><td>${x.type}</td><td>${escapeHTML(x.category)}</td><td>KES ${Number(x.amount).toLocaleString()}</td><td>${escapeHTML(x.notes||"—")}</td></tr>`).join("")}
function renderSales(){$("salesTableBody").innerHTML=data.sales.slice().reverse().map(x=>`<tr><td>${x.date}</td><td>${animal(x.animalId)?.tag||"Unknown"}</td><td>${x.weight} kg</td><td>KES ${Number(x.price).toLocaleString()}</td><td>${escapeHTML(x.buyer||"—")}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">No sales recorded.</td></tr>`}
function renderQuestions(){$("questionsList").innerHTML=data.questions.slice().reverse().map(q=>`<div class="question"><span class="badge">${q.category}</span><h4>${escapeHTML(q.title)}</h4><p>${escapeHTML(q.body)}</p><small>${q.date}</small></div>`).join("")}
function editAnimal(id){let a=animal(id);$("animalId").value=a.id;["tag","animalName","animalSex","animalBreed","dob","weight","targetWeight","birthType","sire","dam","animalStatus","photo","growthScore","fertilityScore","motheringScore","resilienceScore","animalNotes"].forEach((k,i)=>{let prop=["tag","name","sex","breed","dob","weight","targetWeight","birthType","sire","dam","status","photo","growthScore","fertilityScore","motheringScore","resilienceScore","notes"][i];$(k).value=a[prop]??""});$("animalModalTitle").textContent="Edit Sheep";$("animalModal").classList.add("open")}
function deleteAnimal(id){if(confirm("Delete this animal record?")){data.animals=data.animals.filter(a=>a.id!==id);save();renderAll();showToast("Animal deleted.")}}
$("animalForm").onsubmit=e=>{e.preventDefault();let id=$("animalId").value||"a"+Date.now(),a={id,tag:$("tag").value.trim(),name:$("animalName").value.trim(),sex:$("animalSex").value,breed:$("animalBreed").value,dob:$("dob").value,weight:+$("weight").value,targetWeight:+$("targetWeight").value,birthType:$("birthType").value,sire:$("sire").value.trim(),dam:$("dam").value.trim(),status:$("animalStatus").value,photo:$("photo").value.trim(),growthScore:+$("growthScore").value,fertilityScore:+$("fertilityScore").value,motheringScore:+$("motheringScore").value,resilienceScore:+$("resilienceScore").value,notes:$("animalNotes").value.trim()},idx=data.animals.findIndex(x=>x.id===id);idx>=0?data.animals[idx]=a:data.animals.push(a);save();$("animalModal").classList.remove("open");renderAll();showToast("Sheep record saved.")};
$("animalSearch").oninput=renderAnimals;$("animalFilter").onchange=renderAnimals;
$("feedingForm").onsubmit=e=>{e.preventDefault();data.feeding.push({id:"f"+Date.now(),animalId:$("feedingAnimal").value,feed:$("feedType").value,qty:$("feedQty").value,date:$("feedingDate").value,notes:$("feedingNotes").value});save();e.target.reset();$("feedingDate").value=today();renderAll();showToast("Feeding record saved.")};
$("healthForm").onsubmit=e=>{e.preventDefault();data.health.push({id:"h"+Date.now(),animalId:$("healthAnimal").value,type:$("healthType").value,action:$("healthAction").value,date:$("healthDate").value,nextDue:$("nextDue").value,notes:$("healthNotes").value});save();e.target.reset();$("healthDate").value=today();renderAll();showToast("Health record saved.")};
$("growthForm").onsubmit=e=>{e.preventDefault();let days=Math.max(1,Math.round((new Date($("currentDate").value)-new Date($("previousDate").value))/86400000)),gain=+$("currentWeight").value-+$("previousWeight").value;$("growthResult").innerHTML=`<strong>Average Daily Gain: ${(gain/days).toFixed(3)} kg/day</strong><br><small>Weight change: ${gain.toFixed(1)} kg over ${days} days.</small>`};
$("lambingForm").onsubmit=e=>{e.preventDefault();let d=new Date($("matingDate").value);d.setDate(d.getDate()+147);$("lambingResult").innerHTML=`<strong>Estimated lambing date: ${d.toISOString().slice(0,10)}</strong><br><small>Planning estimate using an approximate 147-day gestation period.</small>`};
$("geneticsForm").onsubmit=e=>{e.preventDefault();let o=$("geneticObjective").value,env=$("geneticEnvironment").value,map={meat:["Growth rate","Weaning weight","Muscling","Structural soundness","Fertility"],growth:["Birth weight","Weaning weight","Yearling weight","Feed efficiency","Soundness"],resilience:["Adaptability","Body condition","Health history","Parasite management","Fertility"],maternal:["Fertility","Mothering ability","Lamb survival","Weaning performance","Udder soundness"],balanced:["Growth","Fertility","Mothering","Adaptability","Soundness"]};$("geneticsResult").innerHTML=`<strong>Recommended priority traits:</strong><p>${map[o].map(x=>`<span class="badge">${x}</span> `).join("")}</p><small>Environment: ${env}. Use these priorities with verified pedigree and performance records.</small>`};
$("compatibilityForm").onsubmit=e=>{e.preventDefault();let r=animal($("compatRam").value),w=animal($("compatEwe").value);if(!r||!w){$("compatibilityResult").textContent="Select a ram and ewe.";return}let close=(r.sire&&w.sire&&r.sire===w.sire)||(r.dam&&w.dam&&r.dam===w.dam),score=Math.round([r.growthScore,w.growthScore,r.fertilityScore,w.fertilityScore,r.resilienceScore,w.resilienceScore].reduce((a,b)=>a+b,0)/6);$("compatibilityResult").innerHTML=close?`<strong>🔴 Review Pairing</strong><br><small>Possible shared parentage detected. Verify pedigree before mating.</small>`:`<strong>${score>=80?"🟢 Strong Candidate":score>=65?"🟡 Moderate Candidate":"🟠 Needs Review"} — ${score}/100</strong><br><small>Score uses recorded trait fields only and is not a genetic evaluation.</small>`};
$("financeForm").onsubmit=e=>{e.preventDefault();data.finance.push({id:"fin"+Date.now(),type:$("financeType").value,category:$("financeCategory").value,amount:+$("financeAmount").value,date:$("financeDate").value,notes:$("financeNotes").value});save();e.target.reset();$("financeDate").value=today();renderAll();showToast("Transaction saved.")};
$("marketCalcForm").onsubmit=e=>{e.preventDefault();let live=+$("marketWeight").value,pct=+$("dressingPct").value,price=+$("carcassPrice").value,carcass=live*pct/100;$("marketCalcResult").innerHTML=`<strong>Estimated carcass weight: ${carcass.toFixed(1)} kg</strong><br><small>Estimated value: KES ${(carcass*price).toLocaleString(undefined,{maximumFractionDigits:0})}</small>`};
$("saleForm").onsubmit=e=>{e.preventDefault();let id=$("saleAnimal").value,price=+$("salePrice").value,a=animal(id);data.sales.push({id:"s"+Date.now(),animalId:id,date:$("saleDate").value,weight:+$("saleWeight").value,price,buyer:$("saleBuyer").value});data.finance.push({id:"fin"+Date.now(),type:"Revenue",category:"Sheep Sale",amount:price,date:$("saleDate").value,notes:`Sale of ${a?.tag||"sheep"}`});if(a)a.status="Sold";save();e.target.reset();$("saleDate").value=today();renderAll();showToast("Sale recorded.")};
$("questionForm").onsubmit=e=>{e.preventDefault();data.questions.push({id:"q"+Date.now(),category:$("questionCategory").value,title:$("questionTitle").value,body:$("questionBody").value,date:today()});save();e.target.reset();renderQuestions();showToast("Question posted.")};
document.querySelectorAll(".accordion-btn").forEach(b=>b.onclick=()=>{let p=b.nextElementSibling;p.style.display=p.style.display==="block"?"none":"block"});
["feedingDate","healthDate","financeDate","saleDate","previousDate","currentDate"].forEach(id=>$(id).value=today());
function renderAll(){renderDashboard();renderAnimals();renderGrowth();renderFeeding();renderHealth();renderFinance();renderSales();renderQuestions();selects()}
renderAll();
