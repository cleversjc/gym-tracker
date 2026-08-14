const EXERCISE_LIBRARY = [
  lib("chest_press","坐姿推胸","胸","胸 / 三头","strength",2,8,12),
  lib("bench_press","杠铃卧推","胸","胸 / 三头 / 前肩","strength",3,6,10),
  lib("dumbbell_bench_press","哑铃卧推","胸","胸 / 三头","strength",3,8,12),
  lib("incline_dumbbell_press","上斜哑铃卧推","胸","上胸 / 三头","strength",3,8,12),
  lib("pec_deck","蝴蝶机夹胸","胸","胸肌","strength",2,10,15),
  lib("cable_fly","绳索夹胸","胸","胸肌","strength",2,10,15),
  lib("lat_pulldown","高位下拉","背","背阔肌 / 二头","strength",2,8,12),
  lib("seated_row","坐姿划船","背","中背 / 背阔肌","strength",2,8,12),
  lib("cable_row","绳索坐姿划船","背","中背 / 背阔肌","strength",3,8,12),
  lib("assisted_pullup","辅助引体向上","背","背阔肌 / 二头","strength",3,6,10),
  lib("pullup","引体向上","背","背阔肌 / 二头","bodyweight",3,4,10),
  lib("straight_arm_pulldown","直臂下压","背","背阔肌","strength",2,10,15),
  lib("chest_supported_row","胸托划船","背","中背 / 背阔肌","strength",3,8,12),
  lib("shoulder_press","肩推","肩","三角肌 / 三头","strength",2,8,12),
  lib("dumbbell_shoulder_press","哑铃肩推","肩","三角肌 / 三头","strength",3,8,12),
  lib("lateral_raise","侧平举","肩","三角肌中束","strength",2,12,15),
  lib("reverse_fly","反向飞鸟","肩","后肩 / 肩胛稳定","strength",2,12,15),
  lib("face_pull","Face Pull","肩","后肩 / 上背","strength",2,12,15),
  lib("wall_slide","Wall Slide","体态 / 核心","肩胛控制","repsOnly",2,10,12),
  lib("chest_stretch","胸肌拉伸","体态 / 核心","胸前侧","seconds",2,30,45),
  lib("biceps_curl","二头弯举","手臂","二头肌","strength",2,10,15),
  lib("hammer_curl","锤式弯举","手臂","肱桡肌 / 二头","strength",2,10,15),
  lib("preacher_curl","牧师凳弯举","手臂","二头肌","strength",2,10,15),
  lib("triceps_pushdown","三头下压","手臂","三头肌","strength",2,10,15),
  lib("overhead_triceps_extension","绳索过顶臂屈伸","手臂","三头肌","strength",2,10,15),
  lib("leg_press","腿举","腿臀","股四头 / 臀","strength",2,10,12),
  lib("leg_curl","腿弯举","腿臀","大腿后侧","strength",2,10,15),
  lib("leg_extension","腿屈伸","腿臀","股四头肌","strength",2,10,15),
  lib("hack_squat","哈克深蹲","腿臀","股四头 / 臀","strength",3,8,12),
  lib("squat","杠铃深蹲","腿臀","股四头 / 臀 / 核心","strength",3,6,10),
  lib("goblet_squat","高脚杯深蹲","腿臀","股四头 / 臀","strength",3,8,12),
  lib("romanian_deadlift","罗马尼亚硬拉","腿臀","大腿后侧 / 臀","strength",3,8,12),
  lib("hip_thrust","臀推","腿臀","臀肌","strength",3,8,12),
  lib("calf_raise","提踵","腿臀","小腿","strength",2,12,15),
  lib("plank","平板支撑","体态 / 核心","核心","seconds",2,30,60),
  lib("dead_bug","Dead Bug","体态 / 核心","核心控制","repsOnly",2,8,12),
  lib("bird_dog","Bird Dog","体态 / 核心","核心 / 脊柱稳定","repsOnly",2,8,12),
  lib("cable_crunch","绳索卷腹","体态 / 核心","腹部","strength",2,10,15),
  cardio("treadmill_walk","跑步机快走","跑步机",30,0.1),
  cardio("treadmill_run","跑步机跑步","跑步机",30,0.1),
  cardio("elliptical","椭圆机","椭圆机",30,0),
  cardio("stationary_bike","健身车","单车",30,0),
  cardio("rowing_machine","划船机","划船机",20,0),
  cardio("stair_climber","登阶机 / 楼梯机","楼梯机",20,0),
  cardio("outdoor_walk","户外快走","步行",30,0.1),
  cardio("outdoor_run","户外跑步","跑步",30,0.1)
];

function lib(id,name,category,target,type,sets,min,max){return {id,name,category,target,type,sets,min,max};}
function cardio(id,name,target,minutes,distanceStep){return {id,name,category:"有氧",target,type:"cardio",sets:1,min:minutes,max:minutes,distanceStep};}
function fromLibrary(id, overrides={}){const x=EXERCISE_LIBRARY.find(e=>e.id===id);return x ? {...x,...overrides} : null;}

const DEFAULT_PLANS = [
  {id:"upperA",name:"上肢 A",subtitle:"背部 / 体态优先",builtIn:true,exercises:[fromLibrary("lat_pulldown"),fromLibrary("seated_row"),fromLibrary("chest_press"),fromLibrary("reverse_fly"),fromLibrary("biceps_curl"),fromLibrary("face_pull")]},
  {id:"lower",name:"腿 + 核心",subtitle:"上肢恢复日",builtIn:true,exercises:[fromLibrary("leg_press"),fromLibrary("leg_curl"),fromLibrary("calf_raise"),fromLibrary("plank"),fromLibrary("wall_slide"),fromLibrary("chest_stretch")]},
  {id:"upperB",name:"上肢 B",subtitle:"胸肩背综合",builtIn:true,exercises:[fromLibrary("chest_press"),fromLibrary("lat_pulldown"),fromLibrary("seated_row"),fromLibrary("shoulder_press"),fromLibrary("lateral_raise"),fromLibrary("face_pull",{name:"Face Pull / 反向飞鸟"}),fromLibrary("triceps_pushdown")]}
];

const STORAGE_KEY="gymTrackerV1";
let state=loadState();
let currentSession=null;
let editingTemplate=null;

function defaultState(){return {sessions:[],customPlans:[],recovery:{back:0,chest:0,arms:0,legs:0,updatedAt:null},settings:{increment:2.5,theme:"light"}};}
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return defaultState();
    const parsed=JSON.parse(raw),base=defaultState();
    return {...base,...parsed,customPlans:Array.isArray(parsed.customPlans)?parsed.customPlans:[],settings:{...base.settings,...(parsed.settings||{})},recovery:{...base.recovery,...(parsed.recovery||{})},sessions:Array.isArray(parsed.sessions)?parsed.sessions:[]};
  }catch(e){return defaultState();}
}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function qs(id){return document.getElementById(id);}
function allPlans(){return [...DEFAULT_PLANS,...state.customPlans];}
function getPlan(id){return allPlans().find(p=>p.id===id);}
function uid(prefix="id"){return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;}
function fmtDateTime(iso){return new Intl.DateTimeFormat("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(iso));}
function daysBetween(a,b){return Math.max(0,Math.floor((new Date(b)-new Date(a))/86400000));}
function toast(msg){const el=qs("toast");el.textContent=msg;el.classList.remove("hidden");setTimeout(()=>el.classList.add("hidden"),1600);}
function num(x){return Number(x||0).toFixed(Number(x)%1?1:0);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

function lastSessionForExercise(exId){for(const s of [...state.sessions].reverse()){const e=(s.exercises||[]).find(x=>x.id===exId&&x.completed);if(e)return{session:s,exercise:e};}return null;}
function getLatestStrength(){return [...state.sessions].reverse().find(s=>(s.exercises||[]).some(e=>e.completed&&e.type!=="cardio"));}
function weekCount(){const now=new Date(),day=(now.getDay()+6)%7,monday=new Date(now);monday.setHours(0,0,0,0);monday.setDate(now.getDate()-day);return state.sessions.filter(s=>new Date(s.finishedAt||s.startedAt)>=monday).length;}
function getSuggestedPlan(){const ids=new Set(DEFAULT_PLANS.map(p=>p.id)),recent=[...state.sessions].reverse().find(s=>ids.has(s.planId));if(!recent)return DEFAULT_PLANS[0];const idx=DEFAULT_PLANS.findIndex(p=>p.id===recent.planId);return DEFAULT_PLANS[(idx+1)%DEFAULT_PLANS.length];}
function maxUpperSoreness(){const r=state.recovery;return Math.max(r.back||0,r.chest||0,r.arms||0);}
function planSorenessScore(plan){const cats=new Set((plan.exercises||[]).map(e=>e.category||"")),upper=[...cats].some(c=>["胸","背","肩","手臂"].includes(c)),lower=cats.has("腿臀");if(upper&&lower)return Math.max(maxUpperSoreness(),state.recovery.legs||0);if(lower&&!upper)return state.recovery.legs||0;if(upper)return maxUpperSoreness();return Math.max(maxUpperSoreness(),state.recovery.legs||0);}
function recoveryStatus(plan){const score=planSorenessScore(plan);if(score>=5)return{label:"建议恢复",cls:"bad",detail:"目标肌群酸痛 ≥5/10，今天更适合休息、轻有氧或改练其他部位。"};if(score>=3)return{label:"谨慎训练",cls:"warn",detail:"仍有明显酸痛。可减轻重量/组数；如果动作范围受限，就继续恢复。"};return{label:"可训练",cls:"good",detail:"酸痛较轻；热身动作流畅、无关节痛时可正常训练。"};}

function renderHome(){
  const plan=getSuggestedPlan(),status=recoveryStatus(plan);qs("nextWorkoutName").textContent=plan.name;qs("nextWorkoutHint").textContent=plan.subtitle;
  const badge=qs("recoveryBadge");badge.textContent=status.label;badge.className=`badge ${status.cls}`;qs("recoveryAdvice").textContent=status.detail;
  const last=getLatestStrength();qs("lastStrength").textContent=last?`${daysBetween(last.finishedAt||last.startedAt,new Date())} 天前`:"暂无";qs("weekStrength").textContent=`${weekCount()} 次`;
  const r=state.recovery;[["back","backSoreness","backVal"],["chest","chestSoreness","chestVal"],["arms","armsSoreness","armsVal"],["legs","legsSoreness","legsVal"]].forEach(([k,i,v])=>{qs(i).value=r[k]||0;qs(v).textContent=r[k]||0;});
  qs("planCards").innerHTML=allPlans().map(p=>`<div class="plan-card"><div class="plan-top"><div><div class="plan-name">${escapeHtml(p.name)}</div><div class="plan-sub">${escapeHtml(p.subtitle||(p.builtIn?"内置模板":"自定义模板"))}</div></div><button class="ghost small start-plan" data-plan="${p.id}">开始</button></div><div class="plan-exercises">${(p.exercises||[]).map(e=>escapeHtml(e.name)).join(" · ")}</div></div>`).join("");
  document.querySelectorAll(".start-plan").forEach(b=>b.onclick=()=>startSession(b.dataset.plan));
}

function categories(){return [...new Set(EXERCISE_LIBRARY.map(e=>e.category))];}
function renderTemplates(){
  qs("builtInTemplates").innerHTML=DEFAULT_PLANS.map(p=>templateCard(p,false)).join("");
  qs("customTemplateCount").textContent=`${state.customPlans.length} 个`;
  qs("customTemplates").innerHTML=state.customPlans.length?state.customPlans.map(p=>templateCard(p,true)).join(""):`<div class="empty-state">还没有自定义模板。点右上角「新建」即可开始。</div>`;
  document.querySelectorAll(".template-start").forEach(b=>b.onclick=()=>startSession(b.dataset.id));
  document.querySelectorAll(".template-edit").forEach(b=>b.onclick=()=>openTemplateEditor(b.dataset.id));
  document.querySelectorAll(".template-delete").forEach(b=>b.onclick=()=>deleteTemplate(b.dataset.id));
}
function templateCard(p,editable){return `<div class="mini-template-card"><div class="mini-template-main"><div class="plan-name">${escapeHtml(p.name)}</div><div class="plan-exercises">${(p.exercises||[]).map(e=>escapeHtml(e.name)).join(" · ")||"暂无动作"}</div></div><div class="template-actions"><button class="ghost small template-start" data-id="${p.id}">开始</button>${editable?`<button class="ghost small template-edit" data-id="${p.id}">编辑</button><button class="ghost small template-delete" data-id="${p.id}">删除</button>`:""}</div></div>`;}
function openTemplateEditor(planId=null){
  const existing=planId?state.customPlans.find(p=>p.id===planId):null;
  editingTemplate=existing?JSON.parse(JSON.stringify(existing)):{id:uid("custom"),name:"",subtitle:"自定义模板",builtIn:false,exercises:[]};
  qs("editorTitle").textContent=existing?"编辑模板":"新建模板";qs("templateNamePreset").value="auto";populateCategorySelect();renderTemplateExerciseList();qs("templateEditor").classList.remove("hidden");qs("templateEditor").scrollIntoView({behavior:"smooth",block:"start"});
}
function closeTemplateEditor(){editingTemplate=null;qs("templateEditor").classList.add("hidden");}
function populateCategorySelect(){const sel=qs("exerciseCategory");sel.innerHTML=categories().map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");sel.value=categories()[0];populateExerciseSelect();}
function populateExerciseSelect(){const cat=qs("exerciseCategory").value,items=EXERCISE_LIBRARY.filter(e=>e.category===cat);qs("exerciseSelect").innerHTML=items.map(e=>`<option value="${e.id}">${escapeHtml(e.name)}</option>`).join("");}
function addExerciseToTemplate(){if(!editingTemplate)return;const id=qs("exerciseSelect").value,base=fromLibrary(id);if(!base)return;editingTemplate.exercises.push({...base,instanceId:uid("ex")});renderTemplateExerciseList();}
function renderTemplateExerciseList(){
  if(!editingTemplate)return;const wrap=qs("templateExerciseList");
  if(!editingTemplate.exercises.length){wrap.innerHTML=`<div class="empty-state">从上面的下拉菜单添加动作。可以同时加入力量和有氧项目。</div>`;return;}
  wrap.innerHTML=editingTemplate.exercises.map((e,i)=>`<div class="template-ex-card"><div class="template-ex-head"><div><div class="exercise-name">${escapeHtml(e.name)}</div><div class="exercise-target">${escapeHtml(e.category)} · ${escapeHtml(e.target)}</div></div><div class="row"><button class="icon-mini move-up" data-i="${i}" aria-label="上移">↑</button><button class="icon-mini move-down" data-i="${i}" aria-label="下移">↓</button><button class="icon-mini remove-template-ex" data-i="${i}" aria-label="删除">✕</button></div></div>${templateExerciseControls(e,i)}</div>`).join("");
  document.querySelectorAll(".move-up").forEach(b=>b.onclick=()=>moveTemplateExercise(Number(b.dataset.i),-1));
  document.querySelectorAll(".move-down").forEach(b=>b.onclick=()=>moveTemplateExercise(Number(b.dataset.i),1));
  document.querySelectorAll(".remove-template-ex").forEach(b=>b.onclick=()=>{editingTemplate.exercises.splice(Number(b.dataset.i),1);renderTemplateExerciseList();});
  document.querySelectorAll("[data-template-adjust]").forEach(b=>b.onclick=()=>adjustTemplateExercise(b));
}
function templateExerciseControls(e,i){if(e.type==="cardio")return `<div class="template-config-row"><div class="config-chip">目标时间 <button data-template-adjust="min-down" data-i="${i}">−</button><b>${e.min||20}</b><button data-template-adjust="min-up" data-i="${i}">＋</button> min</div></div>`;const unit=e.type==="seconds"?"秒":"次";return `<div class="template-config-row"><div class="config-chip">组数 <button data-template-adjust="sets-down" data-i="${i}">−</button><b>${e.sets}</b><button data-template-adjust="sets-up" data-i="${i}">＋</button></div><div class="config-chip">目标 ${e.min}–${e.max} ${unit}</div></div>`;}
function adjustTemplateExercise(button){const i=Number(button.dataset.i),e=editingTemplate.exercises[i],a=button.dataset.templateAdjust;if(a==="sets-down")e.sets=Math.max(1,Number(e.sets)-1);if(a==="sets-up")e.sets=Math.min(8,Number(e.sets)+1);if(a==="min-down"){e.min=Math.max(5,Number(e.min||20)-5);e.max=e.min;}if(a==="min-up"){e.min=Math.min(180,Number(e.min||20)+5);e.max=e.min;}renderTemplateExerciseList();}
function moveTemplateExercise(i,dir){const j=i+dir;if(j<0||j>=editingTemplate.exercises.length)return;[editingTemplate.exercises[i],editingTemplate.exercises[j]]=[editingTemplate.exercises[j],editingTemplate.exercises[i]];renderTemplateExerciseList();}
function resolveTemplateName(){const preset=qs("templateNamePreset").value;if(preset!=="auto")return preset;const currentIndex=state.customPlans.findIndex(p=>p.id===editingTemplate.id);if(currentIndex>=0)return state.customPlans[currentIndex].name;return `自定义训练 ${state.customPlans.length+1}`;}
function saveTemplate(){if(!editingTemplate||!editingTemplate.exercises.length){toast("请先添加至少一个动作");return;}editingTemplate.name=resolveTemplateName();editingTemplate.subtitle="自定义模板";editingTemplate.exercises=editingTemplate.exercises.map(({instanceId,...e})=>e);const idx=state.customPlans.findIndex(p=>p.id===editingTemplate.id);if(idx>=0)state.customPlans[idx]=editingTemplate;else state.customPlans.push(editingTemplate);saveState();closeTemplateEditor();renderTemplates();renderHome();toast(idx>=0?"模板已更新":"模板已保存");}
function deleteTemplate(id){const p=state.customPlans.find(x=>x.id===id);if(!p)return;if(!confirm(`删除「${p.name}」？已有训练历史不会被删除。`))return;state.customPlans=state.customPlans.filter(x=>x.id!==id);saveState();renderTemplates();renderHome();toast("模板已删除");}

function makeExerciseState(e){const prev=lastSessionForExercise(e.id),prevWeight=prev?.exercise?.weight??0,prevRir=prev?.exercise?.rir??3;if(e.type==="cardio")return {...e,durationMin:Number(e.min||20),distanceKm:prev?.exercise?.distanceKm??0,intensity:prev?.exercise?.intensity||"中等",completed:false};return {...e,weight:(e.type==="seconds"||e.type==="repsOnly"||e.type==="bodyweight")?0:prevWeight,reps:Array(Number(e.sets||1)).fill(Number(e.min||1)),rir:prevRir,completed:false};}
function startSession(planId){const p=getPlan(planId);if(!p)return;currentSession={id:uid("session"),planId:p.id,planName:p.name,subtitle:p.subtitle,startedAt:new Date().toISOString(),finishedAt:null,bodyWeight:"",energy:3,recovery:{...state.recovery},exercises:(p.exercises||[]).map(makeExerciseState)};qs("sessionTitle").textContent=p.name;qs("bodyWeight").value="";qs("energy").value="3";renderExercises();setView("session");}
function progressionSuggestion(e,prev){if(e.type==="cardio")return prev?`上次：${prev.durationMin||0} 分钟${prev.distanceKm?` · ${num(prev.distanceKm)} km`:""}。`:"第一次记录：先以轻到中等强度完成目标时间。";if(!prev)return"第一次记录：先以动作标准、RIR 2–3 为主。";if(e.type==="seconds"||e.type==="repsOnly"||e.type==="bodyweight")return"先保持动作质量，再逐步增加次数或持续时间。";const top=prev.reps?.every(r=>Number(r)>=Number(e.max));if(top&&Number(prev.rir)>=2)return"上次已达区间上限且仍有余力：这次可考虑增加最小一档重量。";if(Number(prev.rir)<=1)return"上次接近力竭：这次优先保持或略降重量。";return"建议保持上次重量，先把各组稳定做到区间上限。";}
function renderExercises(){const wrap=qs("exerciseList");wrap.innerHTML=currentSession.exercises.map((e,idx)=>e.type==="cardio"?renderCardioExercise(e,idx):renderStrengthExercise(e,idx)).join("");wireExerciseButtons();}
function renderStrengthExercise(e,idx){const prev=lastSessionForExercise(e.id);let prevTxt="上次：暂无记录";if(prev){const pe=prev.exercise,unit=e.type==="seconds"?"秒":"次";prevTxt=`上次：${pe.weight?pe.weight+" kg · ":""}${(pe.reps||[]).join(" / ")} ${unit} · RIR ${pe.rir??"—"}`;}const suggestion=progressionSuggestion(e,prev?.exercise),showWeight=e.type==="strength",unit=e.type==="seconds"?"秒":"次";return `<div class="exercise-card ${e.completed?"done":""}" data-ex="${idx}"><div class="exercise-title-row"><div><div class="exercise-name">${escapeHtml(e.name)}</div><div class="exercise-target">${escapeHtml(e.target)} · ${e.sets} × ${e.min}–${e.max} ${unit}</div></div><div class="exercise-status">${e.completed?"已完成":""}</div></div><div class="last-record">${prevTxt}</div>${showWeight?`<div class="weight-control"><button data-action="weight-minus" data-i="${idx}">−</button><div class="weight-box"><span>${num(e.weight)}</span> kg</div><button data-action="weight-plus" data-i="${idx}">＋</button></div>`:""}<div class="sets">${(e.reps||[]).map((r,sidx)=>`<div class="set-row"><div class="set-label">第 ${sidx+1} 组</div><div class="stepper"><button data-action="rep-minus" data-i="${idx}" data-s="${sidx}">−</button><input data-action="rep-input" data-i="${idx}" data-s="${sidx}" inputmode="numeric" value="${r}"><button data-action="rep-plus" data-i="${idx}" data-s="${sidx}">＋</button></div><div class="muted">${unit}</div></div>`).join("")}</div><div class="rir-row"><span class="muted" style="align-self:center">最后一组 RIR</span>${[0,1,2,3,4,5].map(x=>`<button class="rir-chip ${e.rir===x?"active":""}" data-action="rir" data-i="${idx}" data-rir="${x}">${x===5?"5+":x}</button>`).join("")}</div><div class="suggestion">${suggestion}</div><div class="exercise-actions"><button class="ghost" data-action="skip" data-i="${idx}">${e.completed?"重新打开":"跳过"}</button><button class="primary" data-action="complete" data-i="${idx}">${e.completed?"已完成":"完成动作"}</button></div></div>`;}
function renderCardioExercise(e,idx){const prev=lastSessionForExercise(e.id),prevTxt=prev?`上次：${prev.exercise.durationMin||0} 分钟${prev.exercise.distanceKm?` · ${num(prev.exercise.distanceKm)} km`:""} · ${prev.exercise.intensity||"中等"}`:"上次：暂无记录";return `<div class="exercise-card cardio-card ${e.completed?"done":""}" data-ex="${idx}"><div class="exercise-title-row"><div><div class="exercise-name">${escapeHtml(e.name)}</div><div class="exercise-target">有氧 · ${escapeHtml(e.target)}</div></div><div class="exercise-status">${e.completed?"已完成":""}</div></div><div class="last-record">${prevTxt}</div><div class="cardio-metric"><div class="metric-label">时间</div><div class="weight-control cardio-stepper"><button data-action="duration-minus" data-i="${idx}">−</button><div class="weight-box"><span>${num(e.durationMin)}</span> min</div><button data-action="duration-plus" data-i="${idx}">＋</button></div></div><div class="cardio-metric"><div class="metric-label">距离（可选）</div><div class="weight-control cardio-stepper"><button data-action="distance-minus" data-i="${idx}">−</button><div class="weight-box"><span>${num(e.distanceKm)}</span> km</div><button data-action="distance-plus" data-i="${idx}">＋</button></div></div><div class="cardio-intensity"><span class="muted">主观强度</span>${["轻松","中等","较高"].map(x=>`<button class="rir-chip ${e.intensity===x?"active":""}" data-action="intensity" data-i="${idx}" data-intensity="${x}">${x}</button>`).join("")}</div><div class="suggestion">${progressionSuggestion(e,prev?.exercise)}</div><div class="exercise-actions"><button class="ghost" data-action="skip" data-i="${idx}">${e.completed?"重新打开":"跳过"}</button><button class="primary" data-action="complete" data-i="${idx}">${e.completed?"已完成":"完成项目"}</button></div></div>`;}
function wireExerciseButtons(){document.querySelectorAll("[data-action]").forEach(el=>{el.onclick=()=>{const i=Number(el.dataset.i),e=currentSession.exercises[i],a=el.dataset.action;if(a==="weight-minus")e.weight=Math.max(0,Number(e.weight)-Number(state.settings.increment||2.5));if(a==="weight-plus")e.weight=Number(e.weight)+Number(state.settings.increment||2.5);if(a==="rep-minus"){const s=Number(el.dataset.s);e.reps[s]=Math.max(0,Number(e.reps[s])-1);}if(a==="rep-plus"){const s=Number(el.dataset.s);e.reps[s]=Number(e.reps[s])+1;}if(a==="rir")e.rir=Number(el.dataset.rir);if(a==="duration-minus")e.durationMin=Math.max(0,Number(e.durationMin)-5);if(a==="duration-plus")e.durationMin=Number(e.durationMin)+5;if(a==="distance-minus")e.distanceKm=Math.max(0,Math.round((Number(e.distanceKm)-0.1)*10)/10);if(a==="distance-plus")e.distanceKm=Math.round((Number(e.distanceKm)+0.1)*10)/10;if(a==="intensity")e.intensity=el.dataset.intensity;if(a==="complete")e.completed=true;if(a==="skip")e.completed=!e.completed;renderExercises();};});document.querySelectorAll('[data-action="rep-input"]').forEach(inp=>{inp.onchange=()=>{const i=Number(inp.dataset.i),s=Number(inp.dataset.s);currentSession.exercises[i].reps[s]=Math.max(0,Number(inp.value)||0);};});}

function finishSession(){if(!currentSession)return;currentSession.bodyWeight=qs("bodyWeight").value.trim();currentSession.energy=Number(qs("energy").value);currentSession.finishedAt=new Date().toISOString();state.sessions.push(currentSession);saveState();qs("reportText").value=buildReport(currentSession);qs("modal").classList.remove("hidden");renderHistory();renderHome();}
function buildReport(s){const r=s.recovery||{},mins=Math.max(1,Math.round((new Date(s.finishedAt)-new Date(s.startedAt))/60000)),lines=[`${s.finishedAt.slice(0,10)}｜${s.planName}`,"","训练前状态：",`体重：${s.bodyWeight?s.bodyWeight+" kg":"未记录"}`,`酸痛：背 ${r.back??0}/10，胸 ${r.chest??0}/10，手臂 ${r.arms??0}/10，腿 ${r.legs??0}/10`,`精神状态：${["","很差","偏差","一般","不错","很好"][s.energy]}`,""];(s.exercises||[]).forEach(e=>{if(!e.completed)return;lines.push(e.name);if(e.type==="cardio")lines.push(`${e.durationMin||0} min${e.distanceKm?` · ${num(e.distanceKm)} km`:""} · 强度 ${e.intensity||"中等"}`);else{if(e.weight)lines.push(`${num(e.weight)} kg`);lines.push(`${(e.reps||[]).join(" / ")} ${e.type==="seconds"?"秒":"次"}`);lines.push(`最后一组 RIR ${e.rir}`);}lines.push("");});lines.push(`训练时长：${mins} min`,"","请根据这次训练记录评估：哪些动作下次该加重量或增加次数、哪些保持，以及训练量、恢复和有氧安排是否需要调整。");return lines.join("\n");}
function renderHistory(){const wrap=qs("historyList");if(!state.sessions.length){wrap.innerHTML=`<div class="panel muted">还没有训练记录。完成第一次训练后会出现在这里。</div>`;return;}wrap.innerHTML=[...state.sessions].reverse().map(s=>{const done=(s.exercises||[]).filter(e=>e.completed),summary=done.map(e=>e.type==="cardio"?`${e.name} ${e.durationMin||0}min`:`${e.name} ${e.weight?num(e.weight)+"kg ":""}${(e.reps||[]).join("/")}`).join(" · ");return `<div class="history-card"><div class="plan-top"><div><div class="history-title">${escapeHtml(s.planName)}</div><div class="history-meta">${fmtDateTime(s.finishedAt||s.startedAt)}</div></div><button class="ghost small history-copy" data-id="${s.id}">复制</button></div><div class="history-summary">${escapeHtml(summary||"未记录完成动作")}</div></div>`;}).join("");document.querySelectorAll(".history-copy").forEach(b=>b.onclick=async()=>{const s=state.sessions.find(x=>x.id===b.dataset.id);await copyText(buildReport(s));toast("已复制训练报告");});}
async function copyText(text){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();}
function download(name,content,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}
function exportCSV(){const rows=[["date","plan","exercise","type","weight_kg","set_values","rir","duration_min","distance_km","intensity","body_weight_kg","energy"]];state.sessions.forEach(s=>(s.exercises||[]).filter(e=>e.completed).forEach(e=>rows.push([s.finishedAt||s.startedAt,s.planName,e.name,e.type||"strength",e.weight||"",e.reps?e.reps.join("|"):"",e.rir??"",e.durationMin??"",e.distanceKm??"",e.intensity??"",s.bodyWeight||"",s.energy])));const csv=rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");download("gym_training_history.csv","\ufeff"+csv,"text/csv;charset=utf-8");}
function saveRecovery(){state.recovery={back:Number(qs("backSoreness").value),chest:Number(qs("chestSoreness").value),arms:Number(qs("armsSoreness").value),legs:Number(qs("legsSoreness").value),updatedAt:new Date().toISOString()};saveState();renderHome();toast("恢复状态已保存");}
function setView(name){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));qs(`view-${name}`).classList.add("active");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));if(name==="history")renderHistory();if(name==="templates")renderTemplates();}
function applyTheme(){document.documentElement.classList.toggle("dark",state.settings.theme==="dark");}
function bind(){document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelectorAll("[data-go-templates]").forEach(b=>b.onclick=()=>setView("templates"));qs("startSuggestedBtn").onclick=()=>startSession(getSuggestedPlan().id);qs("backHomeBtn").onclick=()=>setView("home");qs("finishSessionBtn").onclick=finishSession;qs("closeModalBtn").onclick=()=>qs("modal").classList.add("hidden");qs("copyReportBtn").onclick=async()=>{await copyText(qs("reportText").value);toast("已复制，可以直接发给 ChatGPT");};qs("shareReportBtn").onclick=async()=>{const text=qs("reportText").value;if(navigator.share)await navigator.share({title:"训练记录",text});else{await copyText(text);toast("当前浏览器不支持分享，已复制");}};qs("saveRecoveryBtn").onclick=saveRecovery;["back","chest","arms","legs"].forEach(k=>{const input=qs(k+"Soreness"),val=qs(k+"Val");input.oninput=()=>val.textContent=input.value;});qs("themeBtn").onclick=()=>{state.settings.theme=state.settings.theme==="dark"?"light":"dark";saveState();applyTheme();};qs("defaultIncrement").value=state.settings.increment||2.5;qs("saveSettingsBtn").onclick=()=>{state.settings.increment=Math.max(.5,Number(qs("defaultIncrement").value)||2.5);saveState();toast("设置已保存");};qs("exportJsonBtn").onclick=()=>download("gym_tracker_backup.json",JSON.stringify(state,null,2),"application/json");qs("exportCsvBtn").onclick=exportCSV;qs("importFile").onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text()),base=defaultState();state={...base,...data,customPlans:Array.isArray(data.customPlans)?data.customPlans:[],settings:{...base.settings,...(data.settings||{})},recovery:{...base.recovery,...(data.recovery||{})}};saveState();applyTheme();renderHome();renderHistory();renderTemplates();toast("备份已导入");}catch(err){alert("导入失败：不是有效的备份文件。");}};qs("clearDataBtn").onclick=()=>{if(confirm("确定清空全部训练记录和自定义模板吗？这个操作不可撤销。")){state=defaultState();saveState();applyTheme();renderHome();renderHistory();renderTemplates();toast("数据已清空");}};qs("newTemplateBtn").onclick=()=>openTemplateEditor();qs("cancelTemplateBtn").onclick=closeTemplateEditor;qs("exerciseCategory").onchange=populateExerciseSelect;qs("addExerciseBtn").onclick=addExerciseToTemplate;qs("saveTemplateBtn").onclick=saveTemplate;}

applyTheme();bind();renderHome();renderHistory();renderTemplates();
if("serviceWorker" in navigator&&location.protocol.startsWith("http")){navigator.serviceWorker.register("./sw.js").catch(()=>{});}
