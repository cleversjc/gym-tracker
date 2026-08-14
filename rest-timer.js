/* V1.5: session set adjustment + recorded inter-set rest timer */
(() => {
  let activeRest = null;
  let timerInterval = null;

  function installRestStyles() {
    if (document.getElementById("restTimerStyles")) return;
    const style = document.createElement("style");
    style.id = "restTimerStyles";
    style.textContent = `
.session-set-adjust{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding:9px 10px;border-radius:12px;background:var(--bg)}
.session-set-stepper{display:grid;grid-template-columns:36px 34px 36px;align-items:center;text-align:center;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--card)}
.session-set-stepper button{height:34px;border:0;background:var(--bg);color:var(--text);font-size:18px;font-weight:800}
.session-set-stepper b{font-size:14px}
.set-row.has-rest-control{grid-template-columns:54px minmax(0,1fr) 28px 68px}
.rest-inline-btn{height:40px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--text);font-size:12px;font-weight:800;padding:0 5px;white-space:nowrap;touch-action:manipulation}
.rest-inline-btn.recorded{background:var(--goodBg);color:var(--good);border-color:transparent}
.rest-inline-btn.active{background:var(--accent);color:var(--accentText);border-color:var(--accent)}
.rest-timer-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(76px + env(safe-area-inset-bottom));width:min(688px,calc(100% - 24px));z-index:45;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:12px;box-shadow:0 14px 40px rgba(0,0,0,.18)}
.rest-timer-bar.hidden{display:none}
.rest-timer-bar.target-reached{border-color:var(--good)}
.rest-timer-main{display:flex;align-items:center;justify-content:space-between;gap:10px}
.rest-timer-copy{min-width:0}.rest-timer-label{font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rest-timer-time-row{display:flex;align-items:baseline;gap:9px;margin-top:2px}
.rest-timer-time{font-size:30px;font-weight:900;letter-spacing:.02em;font-variant-numeric:tabular-nums}
.rest-target-badge{font-size:12px;color:var(--muted);font-weight:700}
.rest-targets{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}
.rest-target-chip{border:1px solid var(--line);background:var(--bg);color:var(--text);border-radius:9px;height:32px;font-size:12px;font-weight:800}
.rest-target-chip.active{background:var(--accent);color:var(--accentText);border-color:var(--accent)}
.rest-finish-btn{padding:10px 12px}
@media(max-width:420px){.set-row.has-rest-control{grid-template-columns:48px minmax(0,1fr) 24px 62px}.rest-inline-btn{font-size:11px}.rest-timer-bar{width:calc(100% - 16px);bottom:calc(74px + env(safe-area-inset-bottom))}.rest-timer-time{font-size:27px}}
`;
    document.head.appendChild(style);
  }

  function ensureRestSettings() {
    if (!state.settings) state.settings = {};
    if (![60, 90, 120, 180].includes(Number(state.settings.restTargetSec))) state.settings.restTargetSec = 90;
  }

  function ensureExerciseRestData(exercise) {
    if (!exercise || exercise.type === "cardio") return;
    if (!exercise.sessionExerciseId) exercise.sessionExerciseId = uid("sx");
    if (!Array.isArray(exercise.reps)) exercise.reps = [];
    const wanted = Math.max(0, exercise.reps.length - 1);
    if (!Array.isArray(exercise.rests)) exercise.rests = [];
    if (exercise.rests.length > wanted) exercise.rests.length = wanted;
    while (exercise.rests.length < wanted) exercise.rests.push(null);
  }

  function ensureSessionRestData() {
    if (!currentSession) return;
    if (!Array.isArray(currentSession.restEvents)) currentSession.restEvents = [];
    (currentSession.exercises || []).forEach(ensureExerciseRestData);
  }

  function restText(seconds) {
    if (seconds === null || seconds === undefined || seconds === "") return "—";
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    const min = Math.floor(total / 60);
    const sec = String(total % 60).padStart(2, "0");
    return `${min}:${sec}`;
  }

  function installRestTimerBar() {
    if (qs("restTimerBar")) return;
    const bar = document.createElement("div");
    bar.id = "restTimerBar";
    bar.className = "rest-timer-bar hidden";
    bar.innerHTML = `
      <div class="rest-timer-main">
        <div class="rest-timer-copy">
          <div id="restTimerLabel" class="rest-timer-label">组间休息</div>
          <div class="rest-timer-time-row"><span id="restTimerTime" class="rest-timer-time">0:00</span><span id="restTimerTargetBadge" class="rest-target-badge">目标 90s</span></div>
        </div>
        <button id="cancelRestBtn" class="ghost small" type="button">取消</button>
      </div>
      <div class="rest-targets" aria-label="休息目标">
        ${[60, 90, 120, 180].map(sec => `<button class="rest-target-chip" type="button" data-rest-target="${sec}">${sec < 120 ? sec + "s" : sec / 60 + "min"}</button>`).join("")}
      </div>
      <button id="finishRestBtn" class="primary full rest-finish-btn" type="button">结束休息并记录</button>`;
    document.body.appendChild(bar);
    qs("finishRestBtn").onclick = () => stopRest(true);
    qs("cancelRestBtn").onclick = () => stopRest(false);
    bar.querySelectorAll("[data-rest-target]").forEach(button => {
      button.onclick = () => {
        if (!activeRest) return;
        activeRest.targetSec = Number(button.dataset.restTarget);
        activeRest.alerted = false;
        renderTimerBar();
      };
    });
  }

  function startRest(exerciseIndex, setIndex) {
    if (!currentSession) return;
    ensureSessionRestData();
    const exercise = currentSession.exercises?.[exerciseIndex];
    if (!exercise || exercise.type === "cardio") return;
    ensureExerciseRestData(exercise);
    if (setIndex < 0 || setIndex >= exercise.reps.length - 1) return;
    if (activeRest) {
      if (activeRest.exerciseInstanceId === exercise.sessionExerciseId && activeRest.setIndex === setIndex) return;
      toast("已有一个休息计时正在进行，请先结束或取消");
      return;
    }
    activeRest = {
      exerciseInstanceId: exercise.sessionExerciseId,
      exerciseIndex,
      setIndex,
      exerciseName: exercise.name,
      startedAtMs: Date.now(),
      startedAt: new Date().toISOString(),
      targetSec: Number(state.settings.restTargetSec || 90),
      alerted: false
    };
    installRestTimerBar();
    qs("restTimerBar").classList.remove("hidden");
    renderTimerBar();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(renderTimerBar, 500);
    decorateRestControls();
  }

  function elapsedSeconds() {
    return activeRest ? Math.max(0, Math.round((Date.now() - activeRest.startedAtMs) / 1000)) : 0;
  }

  function renderTimerBar() {
    if (!activeRest) return;
    const elapsed = elapsedSeconds();
    const bar = qs("restTimerBar");
    if (!bar) return;
    qs("restTimerLabel").textContent = `${activeRest.exerciseName} · 第 ${activeRest.setIndex + 1}→${activeRest.setIndex + 2} 组`;
    qs("restTimerTime").textContent = restText(elapsed);
    qs("restTimerTargetBadge").textContent = `目标 ${activeRest.targetSec}s`;
    bar.classList.toggle("target-reached", elapsed >= activeRest.targetSec);
    bar.querySelectorAll("[data-rest-target]").forEach(button => button.classList.toggle("active", Number(button.dataset.restTarget) === Number(activeRest.targetSec)));
    if (!activeRest.alerted && elapsed >= activeRest.targetSec) {
      activeRest.alerted = true;
      if (navigator.vibrate) navigator.vibrate([100, 70, 100]);
    }
  }

  function findActiveExercise() {
    if (!activeRest || !currentSession) return null;
    return (currentSession.exercises || []).find(e => e.sessionExerciseId === activeRest.exerciseInstanceId) || null;
  }

  function stopRest(record) {
    if (!activeRest) return;
    const snapshot = { ...activeRest };
    const elapsed = elapsedSeconds();
    const exercise = findActiveExercise();
    if (record && exercise) {
      ensureExerciseRestData(exercise);
      if (snapshot.setIndex < exercise.rests.length) exercise.rests[snapshot.setIndex] = elapsed;
      if (!Array.isArray(currentSession.restEvents)) currentSession.restEvents = [];
      const event = {exerciseInstanceId:snapshot.exerciseInstanceId,exerciseId:exercise.id,exerciseName:exercise.name,afterSet:snapshot.setIndex+1,beforeSet:snapshot.setIndex+2,startedAt:snapshot.startedAt,endedAt:new Date().toISOString(),durationSec:elapsed,targetSec:snapshot.targetSec};
      const idx = currentSession.restEvents.findIndex(x => x.exerciseInstanceId === event.exerciseInstanceId && x.afterSet === event.afterSet);
      if (idx >= 0) currentSession.restEvents[idx] = event; else currentSession.restEvents.push(event);
    }
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    activeRest = null;
    const bar = qs("restTimerBar");
    if (bar) { bar.classList.add("hidden"); bar.classList.remove("target-reached"); }
    if (currentSession) renderExercises();
    toast(record ? `已记录休息 ${restText(elapsed)}` : "已取消本次休息计时");
  }

  function pruneRestEvents() {
    if (!currentSession || !Array.isArray(currentSession.restEvents)) return;
    const valid = new Map();
    (currentSession.exercises || []).forEach(e => {
      ensureExerciseRestData(e);
      if (e.sessionExerciseId) valid.set(e.sessionExerciseId, Math.max(0, (e.reps || []).length - 1));
    });
    currentSession.restEvents = currentSession.restEvents.filter(ev => valid.has(ev.exerciseInstanceId) && ev.afterSet <= valid.get(ev.exerciseInstanceId));
  }

  function adjustSessionSets(exerciseIndex, delta) {
    if (!currentSession) return;
    const exercise = currentSession.exercises?.[exerciseIndex];
    if (!exercise || exercise.type === "cardio") return;
    ensureExerciseRestData(exercise);
    const oldCount = exercise.reps.length;
    const nextCount = Math.min(8, Math.max(1, oldCount + delta));
    if (nextCount === oldCount) return;
    if (delta > 0) {
      const seed = Number(exercise.min || exercise.reps[exercise.reps.length - 1] || 1);
      while (exercise.reps.length < nextCount) exercise.reps.push(seed);
    } else {
      if (activeRest && activeRest.exerciseInstanceId === exercise.sessionExerciseId && activeRest.setIndex >= nextCount - 1) stopRest(false);
      exercise.reps.length = nextCount;
    }
    exercise.sets = nextCount;
    ensureExerciseRestData(exercise);
    pruneRestEvents();
    renderExercises();
    toast(delta > 0 ? `已增加到 ${nextCount} 组` : `已减少到 ${nextCount} 组`);
  }

  function decorateRestControls() {
    if (!currentSession) return;
    ensureSessionRestData();
    (currentSession.exercises || []).forEach((exercise, exerciseIndex) => {
      if (exercise.type === "cardio") return;
      const card = document.querySelector(`#exerciseList .exercise-card[data-ex="${exerciseIndex}"]`);
      if (!card) return;
      ensureExerciseRestData(exercise);
      const setsContainer = card.querySelector(".sets");
      if (setsContainer && !card.querySelector(".session-set-adjust")) {
        const controls = document.createElement("div");
        controls.className = "session-set-adjust";
        controls.innerHTML = `<span class="muted">本次组数</span><div class="session-set-stepper"><button type="button" data-session-set-minus="${exerciseIndex}" aria-label="减少一组">−</button><b>${exercise.reps.length}</b><button type="button" data-session-set-plus="${exerciseIndex}" aria-label="增加一组">＋</button></div>`;
        setsContainer.insertAdjacentElement("beforebegin", controls);
        controls.querySelector(`[data-session-set-minus="${exerciseIndex}"]`).onclick = () => adjustSessionSets(exerciseIndex, -1);
        controls.querySelector(`[data-session-set-plus="${exerciseIndex}"]`).onclick = () => adjustSessionSets(exerciseIndex, 1);
      }
      const setRows = card.querySelectorAll(".sets .set-row");
      setRows.forEach((row, setIndex) => {
        row.classList.add("has-rest-control");
        row.querySelector(".rest-inline-btn")?.remove();
        if (setIndex >= exercise.reps.length - 1) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "rest-inline-btn";
        const recorded = exercise.rests?.[setIndex];
        const isActive = activeRest && activeRest.exerciseInstanceId === exercise.sessionExerciseId && activeRest.setIndex === setIndex;
        button.textContent = isActive ? "计时中" : (recorded !== null && recorded !== undefined ? restText(recorded) : "休息");
        button.classList.toggle("active", !!isActive);
        button.classList.toggle("recorded", recorded !== null && recorded !== undefined && !isActive);
        button.onclick = () => startRest(exerciseIndex, setIndex);
        row.appendChild(button);
      });
    });
  }

  const previousRenderExercises = renderExercises;
  renderExercises = function () { previousRenderExercises(); decorateRestControls(); };

  const previousStartSession = startSession;
  startSession = function (planId) {
    if (activeRest) stopRest(false);
    previousStartSession(planId);
    ensureSessionRestData();
    decorateRestControls();
  };

  const previousFinishSession = finishSession;
  finishSession = function () {
    if (activeRest) stopRest(true);
    pruneRestEvents();
    previousFinishSession();
  };

  function reportRestLine(exercise) {
    const rests = Array.isArray(exercise.rests) ? exercise.rests : [];
    const recorded = rests.map((sec, i) => ({ sec, i })).filter(x => x.sec !== null && x.sec !== undefined && Number.isFinite(Number(x.sec)));
    if (!recorded.length) return null;
    const avg = Math.round(recorded.reduce((sum, x) => sum + Number(x.sec), 0) / recorded.length);
    return `组间休息：${recorded.map(x => `${x.i + 1}→${x.i + 2}组 ${restText(x.sec)}`).join("；")}（平均 ${restText(avg)}）`;
  }

  buildReport = function (s) {
    const r = s.recovery || {};
    const mins = Math.max(1, Math.round((new Date(s.finishedAt) - new Date(s.startedAt)) / 60000));
    const lines = [`${s.finishedAt.slice(0,10)}｜${s.planName}`,"","训练前状态：",`体重：${s.bodyWeight ? s.bodyWeight + " kg" : "未记录"}`,`酸痛：背 ${r.back ?? 0}/10，胸 ${r.chest ?? 0}/10，手臂 ${r.arms ?? 0}/10，腿 ${r.legs ?? 0}/10`,`精神状态：${["","很差","偏差","一般","不错","很好"][s.energy]}`,""];
    const allRests = [];
    (s.exercises || []).forEach(e => {
      if (!e.completed) return;
      lines.push(`${e.name}${e.temporary ? "（临时）" : ""}`);
      if (e.type === "cardio") lines.push(`${e.durationMin || 0} min${e.distanceKm ? ` · ${num(e.distanceKm)} km` : ""} · 强度 ${e.intensity || "中等"}`);
      else {
        if (e.weight) lines.push(`${num(e.weight)} kg`);
        lines.push(`${(e.reps || []).join(" / ")} ${e.type === "seconds" ? "秒" : "次"}`);
        lines.push(`最后一组 RIR ${e.rir}`);
        const restLine = reportRestLine(e); if (restLine) lines.push(restLine);
        (e.rests || []).forEach(sec => { if (sec !== null && sec !== undefined && Number.isFinite(Number(sec))) allRests.push(Number(sec)); });
      }
      lines.push("");
    });
    if (allRests.length) {
      const avg = Math.round(allRests.reduce((a,b)=>a+b,0)/allRests.length);
      lines.push(`本次记录组间休息：${allRests.length} 次，平均 ${restText(avg)}`);
    }
    lines.push(`训练时长：${mins} min`,"","请根据这次训练记录评估：哪些动作下次该加重量或增加次数、哪些保持；组间休息是否合适；以及训练量、恢复和有氧安排是否需要调整。");
    return lines.join("\n");
  };

  exportCSV = function () {
    const rows = [["date","plan","exercise","type","weight_kg","set_values","rir","rest_seconds","duration_min","distance_km","intensity","body_weight_kg","energy"]];
    state.sessions.forEach(s => (s.exercises || []).filter(e => e.completed).forEach(e => rows.push([s.finishedAt||s.startedAt,s.planName,e.name,e.type||"strength",e.weight||"",e.reps?e.reps.join("|"):"",e.rir??"",Array.isArray(e.rests)?e.rests.map(x=>x??"").join("|"):"",e.durationMin??"",e.distanceKm??"",e.intensity??"",s.bodyWeight||"",s.energy])));
    const csv = rows.map(row => row.map(x => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
    download("gym_training_history.csv","\ufeff"+csv,"text/csv;charset=utf-8");
  };

  function initSettingsUI() {
    ensureRestSettings();
    const settingsPanel = qs("view-settings")?.querySelector(".panel");
    if (settingsPanel && !qs("defaultRestSeconds")) {
      const label = document.createElement("label");
      label.innerHTML = `默认组间休息提醒<select id="defaultRestSeconds"><option value="60">60 秒</option><option value="90">90 秒</option><option value="120">2 分钟</option><option value="180">3 分钟</option></select>`;
      settingsPanel.insertBefore(label, qs("saveSettingsBtn"));
    }
    const select = qs("defaultRestSeconds");
    if (select) select.value = String(state.settings.restTargetSec);
    qs("saveSettingsBtn")?.addEventListener("click", () => { if (select) state.settings.restTargetSec = Number(select.value) || 90; saveState(); });
    const about = [...document.querySelectorAll("#view-settings .panel h3")].find(x => x.textContent.startsWith("关于"));
    if (about) {
      about.textContent = "关于 V1.5";
      const p = about.parentElement?.querySelector("p");
      if (p) p.textContent = "支持自定义模板、收藏/临时动作、训练中调整组数，以及可记录的组间休息计时。休息时间会进入训练报告、JSON 和 CSV，方便后续分析。";
    }
  }

  ensureRestSettings();
  installRestStyles();
  installRestTimerBar();
  initSettingsUI();
  if (qs("finishSessionBtn")) qs("finishSessionBtn").onclick = finishSession;
  if (qs("exportCsvBtn")) qs("exportCsvBtn").onclick = exportCSV;
  if (currentSession) { ensureSessionRestData(); decorateRestControls(); }
})();