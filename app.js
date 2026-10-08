const STORAGE_KEY="parkflow-v1";
const TOTAL_SLOTS=20;

class ParkingStack{
  constructor(items){this.items=items || Array.from({length:TOTAL_SLOTS},(_,i)=>i+1);}
  push(slot){if(!this.items.includes(slot)) this.items.push(slot);}
  pop(){return this.items.length ? this.items.pop() : null;}
  peek(){return this.items.length ? this.items[this.items.length-1] : null;}
  isEmpty(){return this.items.length===0;}
  size(){return this.items.length;}
}

let state=loadState();

function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
    if(saved && Array.isArray(saved.vehicles) && Array.isArray(saved.stack)) return saved;
  }catch(e){}
  return {vehicles:[],stack:Array.from({length:TOTAL_SLOTS},(_,i)=>i+1)};
}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function stack(){return new ParkingStack(state.stack);}
function timeNow(){return new Date().toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"});}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function showToast(msg,type="success"){
  const t=document.getElementById("toast"); t.textContent=msg; t.className="toast show "+type;
  setTimeout(()=>t.className="toast",2500);
}

function init(){
  bindNavigation();
  document.getElementById("menuBtn").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("resetBtn").onclick=()=>{
    if(confirm("Reset all parking data?")){localStorage.removeItem(STORAGE_KEY);state=loadState();renderAll();showToast("Parking data reset");}
  };
  document.getElementById("parkBtn").onclick=parkVehicle;
  document.getElementById("searchInput").oninput=renderVehicles;
  renderAll();
}
function bindNavigation(){
  document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
  document.querySelectorAll("[data-page-jump]").forEach(b=>b.onclick=()=>showPage(b.dataset.pageJump));
}
function showPage(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById("page-"+page).classList.add("active");
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  document.getElementById("pageTitle").textContent=page==="park"?"Park Vehicle":page==="slots"?"Parking Slots":page==="vehicles"?"Vehicles":page==="stack"?"Stack Operations":page==="about"?"About Project":"Dashboard";
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
  renderAll();
}

function parkVehicle(){
  const no=document.getElementById("vehicleNo").value.trim().toUpperCase();
  const owner=document.getElementById("ownerName").value.trim();
  const type=document.getElementById("vehicleType").value;
  const msg=document.getElementById("parkMessage");
  const s=stack();

  if(!no || !owner){msg.textContent="Please enter vehicle number and owner name.";msg.className="form-message error";return;}
  if(state.vehicles.some(v=>v.vehicleNo===no && v.status==="Parked")){msg.textContent="This vehicle is already parked.";msg.className="form-message error";return;}
  if(s.isEmpty()){msg.textContent="Parking is full. No slots are available.";msg.className="form-message error";return;}

  const slot=s.pop();
  state.stack=s.items;
  state.vehicles.unshift({id:Date.now(),vehicleNo:no,owner,type,slot,entryTime:timeNow(),status:"Parked"});
  saveState(); renderAll();
  document.getElementById("vehicleNo").value="";
  document.getElementById("ownerName").value="";
  msg.textContent=`Vehicle parked successfully in Slot ${slot}.`;
  msg.className="form-message success";
  showToast(`Vehicle parked in Slot ${slot}`);
}

function exitVehicle(id){
  const v=state.vehicles.find(x=>x.id===id);
  if(!v || v.status!=="Parked") return;
  const s=stack(); s.push(v.slot); state.stack=s.items;
  v.status="Exited";v.exitTime=timeNow();
  saveState();renderAll();showToast(`${v.vehicleNo} exited from Slot ${v.slot}`);
}

function renderAll(){
  const occupied=state.vehicles.filter(v=>v.status==="Parked");
  const s=stack();
  document.getElementById("totalSlots").textContent=TOTAL_SLOTS;
  document.getElementById("availableSlots").textContent=s.size();
  document.getElementById("occupiedSlots").textContent=occupied.length;
  document.getElementById("utilization").textContent=Math.round(occupied.length/TOTAL_SLOTS*100)+"%";
  document.getElementById("nextSlot").textContent=s.peek()??"Full";
  document.getElementById("parkNextSlot").textContent=s.peek()??"Full";
  document.getElementById("stackSize").textContent=`${s.size()} / ${TOTAL_SLOTS}`;
  document.getElementById("stackFill").style.width=(s.size()/TOTAL_SLOTS*100)+"%";
  renderSlots("dashboardSlots");
  renderSlots("allSlots");
  renderTable("dashboardVehicles",occupied.slice(0,5),false);
  renderVehicles();
  renderStack();
}

function renderSlots(id){
  const el=document.getElementById(id); if(!el)return;
  const occupied=state.vehicles.filter(v=>v.status==="Parked");
  el.innerHTML="";
  for(let i=1;i<=TOTAL_SLOTS;i++){
    const v=occupied.find(x=>x.slot===i);
    const div=document.createElement("div");
    div.className="slot "+(v?"occupied":"available");
    div.innerHTML=`<b>${i}</b><span>${v?esc(v.vehicleNo):"Free"}</span>`;
    if(v) div.title=`${v.vehicleNo} • ${v.owner}`;
    el.appendChild(div);
  }
}

function renderTable(id,rows,full){
  const el=document.getElementById(id);if(!el)return;
  if(!rows.length){el.innerHTML=`<tr><td colspan="${full?7:6}" class="empty">No vehicles currently parked.</td></tr>`;return;}
  el.innerHTML=rows.map(v=>full?
    `<tr><td><b>${esc(v.vehicleNo)}</b></td><td>${esc(v.owner)}</td><td>${esc(v.type)}</td><td><span class="slot-tag">${v.slot}</span></td><td>${esc(v.entryTime)}</td><td><span class="status active-status">${v.status}</span></td><td><button class="danger-btn" onclick="exitVehicle(${v.id})">Exit</button></td></tr>`:
    `<tr><td><b>${esc(v.vehicleNo)}</b></td><td>${esc(v.owner)}</td><td>${esc(v.type)}</td><td><span class="slot-tag">${v.slot}</span></td><td>${esc(v.entryTime)}</td><td><button class="danger-btn" onclick="exitVehicle(${v.id})">Exit</button></td></tr>`
  ).join("");
}

function renderVehicles(){
  const q=(document.getElementById("searchInput")?.value||"").toLowerCase();
  const rows=state.vehicles.filter(v=>v.status==="Parked" && (v.vehicleNo.toLowerCase().includes(q)||v.owner.toLowerCase().includes(q)));
  const c=document.getElementById("vehicleCount");if(c)c.textContent=`${rows.length} active vehicle${rows.length===1?"":"s"}`;
  renderTable("vehicleTable",rows,true);
}

function renderStack(){
  const el=document.getElementById("stackVisual");if(!el)return;
  const s=stack();
  el.innerHTML=s.items.slice().reverse().map((slot,i)=>`<div class="stack-item ${i===0?"top":""}"><span>Slot</span><b>${slot}</b>${i===0?"<em>TOP / PEEK</em>":""}</div>`).join("");
}

window.exitVehicle=exitVehicle;
document.addEventListener("DOMContentLoaded",init);