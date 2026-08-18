/* V1.6: template manager UX + crash-safe workout drafts */
(() => {
  const DRAFT_KEY = "gymTrackerV1Draft";
  let restoringDraft = false;
  let draftSaveTimer = null;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function validDraft(raw) {
    if (!raw || !raw.session || !raw.session.id || raw.session.finishedAt) return false;
    if ((state.sessions || []).some(s => s.id === raw.session.id)) return false;
    return true;
  }
  function readDraft() {
    try {
      const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (!validDraft(raw)) {
        if (raw) localStorage.removeItem(DRAFT_KEY);
        return null;
      }
      return raw;
    } catch (_) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
  }
  function syncSessionMetaFromUI() {
    if (!currentSession) return;
    const bw = qs("bodyWeight");
    const energy = qs("energy");
    if (bw) currentSession.bodyWeight = bw.value.trim();
    if (energy) currentSession.energy = Number(energy.value) || 3;
  }
  function writeDraftNow() {
    if (!currentSession || currentSession.finishedAt) return;
    syncSessionMetaFromUI();
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 2, savedAt: new Date().toISOString(), session: currentSession }));
      renderDraftBanner();
    } catch (_) {}
  }
  function scheduleDraftSave() {
    if (!currentSession || currentSession.finishedAt) return;
    clearTimeout(draftSaveTimer);
    draftSaveTimer = setTimeout(writeDraftNow, 60);
  }
  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    renderDraftBanner();
  }
  function draftProgress(session) {
    const exercises = session.exercises || [];
    const completed = exercises.filter(e => e.completed).length;
    return { completed, total: exercises.length };
  }
  function elapsedLabel(startedAt) {
    const mins = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000));
    if (mins < 60) return `${mins} 分钟前开始`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return `${h}小时${m ? m + "分" : ""}前开始`;
  }
  function renderDraftBanner() {
    const home = qs("view-home");
    if (!home) return;
    let box = qs("draftResumeCard");
    const draft = readDraft();
    if (!draft) { box?.remove(); return; }
    if (!box) {
      box = document.createElement("div");
      box.id = "draftResumeCard";
      home.insertBefore(box, home.firstElementChild);
    }
    const p = draftProgress(draft.session);
    box.className = "draft-resume-card";
    box.innerHTML = `
      <div class="draft-resume-main">
        <div class="draft-pulse"></div>
        <div class="draft-resume-text">
          <div class="muted">未完成训练 · 已自动保存</div>
          <div class="draft-resume-title">${escapeHtml(draft.session.planName || "训练")}</div>
          <div class="draft-resume-meta">已完成 ${p.completed}/${p.total} 个项目 · ${elapsedLabel(draft.session.startedAt)}</div>
        </div>
      </div>
      <div class="draft-resume-actions">
        <button class="ghost" id="discardDraftBtn" type="button">放弃</button>
        <button class="primary" id="resumeDraftBtn" type="button">继续训练</button>
      </div>`;
    qs("resumeDraftBtn").onclick = resumeDraft;
    qs("discardDraftBtn").onclick = () => {
      if (!confirm("放弃这次未完成训练？已记录的内容将被删除。")) return;
      if (currentSession?.id === draft.session.id) currentSession = null;
      clearDraft();
      toast("已放弃未完成训练");
    };
  }
  function resumeDraft() {
    const draft = readDraft();
    if (!draft) { toast("没有可恢复的训练"); return; }
    restoringDraft = true;
    currentSession = clone(draft.session);
    qs("sessionTitle").textContent = currentSession.planName || "训练";
    qs("bodyWeight").value = currentSession.bodyWeight || "";
    qs("energy").value = String(currentSession.energy || 3);
    renderExercises();
    setView("session");
    restoringDraft = false;
    scheduleDraftSave();
    toast("已恢复上次训练");
  }

  const previousRenderExercises = renderExercises;
  renderExercises = function () {
    previousRenderExercises();
    scheduleDraftSave();
  };

  const previousStartSession = startSession;
  startSession = function (planId) {
    const oldDraft = readDraft();
    if (!restoringDraft && oldDraft && (!currentSession || currentSession.id !== oldDraft.session.id)) {
      if (!confirm(`还有一场未完成的「${oldDraft.session.planName}」。开始新训练会放弃它，继续吗？`)) return;
      clearDraft();
    }
    previousStartSession(planId);
    scheduleDraftSave();
  };

  const previousFinishSession = finishSession;
  finishSession = function () {
    previousFinishSession();
    clearDraft();
  };

  document.addEventListener("change", e => {
    if (!currentSession) return;
    if (e.target.closest("#view-session")) scheduleDraftSave();
  }, true);
  document.addEventListener("input", e => {
    if (!currentSession) return;
    if (e.target.id === "bodyWeight" || e.target.id === "energy") scheduleDraftSave();
  }, true);
  document.addEventListener("click", e => {
    if (!currentSession) return;
    if (e.target.closest("#view-session") || e.target.closest("#restTimerBar")) setTimeout(scheduleDraftSave, 0);
  }, true);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") writeDraftNow(); });
  window.addEventListener("pagehide", writeDraftNow);
  window.addEventListener("beforeunload", writeDraftNow);

  function formatExerciseConfig(e) {
    if (e.type === "cardio") return `${e.min || 20} 分钟`;
    const unit = e.type === "seconds" ? "秒" : "次";
    return `${e.sets || 1} 组 × ${e.min || 1}–${e.max || e.min || 1} ${unit}`;
  }
  function templateStats(plan) {
    const ex = plan.exercises || [];
    const cardio = ex.filter(e => e.type === "cardio").length;
    const strength = ex.length - cardio;
    return `${ex.length} 项${strength ? ` · ${strength} 力量` : ""}${cardio ? ` · ${cardio} 有氧` : ""}`;
  }
  function ensureTemplateDetailModal() {
    if (qs("templateDetailModal")) return;
    const modal = document.createElement("div");
    modal.id = "templateDetailModal";
    modal.className = "template-detail-modal hidden";
    modal.innerHTML = `<div class="template-detail-sheet">
      <div class="template-detail-head">
        <div><div class="muted">TEMPLATE</div><h2 id="templateDetailName"></h2><div id="templateDetailStats" class="template-detail-stats"></div></div>
        <button id="closeTemplateDetailBtn" class="icon-btn" type="button">✕</button>
      </div>
      <div id="templateDetailExercises" class="template-detail-exercises"></div>
      <div id="templateDetailActions" class="template-detail-actions"></div>
    </div>`;
    document.body.appendChild(modal);
    qs("closeTemplateDetailBtn").onclick = closeTemplateDetail;
    modal.addEventListener("click", e => { if (e.target === modal) closeTemplateDetail(); });
  }
  function closeTemplateDetail() {
    qs("templateDetailModal")?.classList.add("hidden");
    document.body.classList.remove("template-detail-open");
  }
  function showTemplateDetail(id) {
    const plan = getPlan(id); if (!plan) return;
    ensureTemplateDetailModal();
    qs("templateDetailName").textContent = plan.name;
    qs("templateDetailStats").textContent = templateStats(plan);
    qs("templateDetailExercises").innerHTML = (plan.exercises || []).map((e, i) => `
      <div class="template-detail-row">
        <div class="template-detail-index">${String(i + 1).padStart(2, "0")}</div>
        <div class="template-detail-copy"><div class="exercise-name">${escapeHtml(e.name)}</div><div class="exercise-target">${escapeHtml(e.category || "")} · ${escapeHtml(e.target || "")}</div></div>
        <div class="template-detail-config">${escapeHtml(formatExerciseConfig(e))}</div>
      </div>`).join("") || `<div class="empty-state">这个模板还没有动作。</div>`;
    const actions = qs("templateDetailActions");
    actions.innerHTML = `<button class="ghost" data-detail-copy="${plan.id}" type="button">复制模板</button>${plan.builtIn ? "" : `<button class="ghost" data-detail-edit="${plan.id}" type="button">编辑</button>`}<button class="primary grow" data-detail-start="${plan.id}" type="button">开始训练</button>`;
    actions.querySelector("[data-detail-copy]").onclick = () => duplicateTemplate(plan.id);
    actions.querySelector("[data-detail-edit]")?.addEventListener("click", () => { closeTemplateDetail(); openTemplateEditor(plan.id); });
    actions.querySelector("[data-detail-start]").onclick = () => { closeTemplateDetail(); startSession(plan.id); };
    qs("templateDetailModal").classList.remove("hidden");
    document.body.classList.add("template-detail-open");
  }
  function duplicateTemplate(id) {
    const source = getPlan(id); if (!source) return;
    const copy = clone(source);
    copy.id = uid("custom");
    copy.builtIn = false;
    copy.name = `${source.name} · 副本`;
    copy.subtitle = "自定义模板";
    state.customPlans.push(copy);
    saveState();
    renderTemplates();
    renderHome();
    closeTemplateDetail();
    toast("已复制为自定义模板");
  }
  function decorateTemplateCards() {
    document.querySelectorAll(".mini-template-card").forEach(card => {
      const start = card.querySelector(".template-start");
      if (!start) return;
      const id = start.dataset.id;
      const plan = getPlan(id);
      if (!plan) return;
      card.classList.add("template-manager-card");
      const main = card.querySelector(".mini-template-main");
      if (main) {
        main.setAttribute("role", "button"); main.tabIndex = 0;
        main.onclick = () => showTemplateDetail(id);
        main.onkeydown = e => { if (e.key === "Enter" || e.key === " ") showTemplateDetail(id); };
        let stats = main.querySelector(".template-card-stats");
        if (!stats) { stats = document.createElement("div"); stats.className = "template-card-stats"; main.appendChild(stats); }
        stats.textContent = templateStats(plan);
      }
      const actions = card.querySelector(".template-actions");
      if (actions && !actions.querySelector(".template-view")) {
        const view = document.createElement("button");
        view.className = "ghost small template-view"; view.type = "button"; view.textContent = "查看"; view.onclick = () => showTemplateDetail(id);
        actions.insertBefore(view, actions.firstChild);
      }
      if (actions && !actions.querySelector(".template-duplicate")) {
        const dup = document.createElement("button");
        dup.className = "ghost small template-duplicate"; dup.type = "button"; dup.textContent = "复制"; dup.onclick = () => duplicateTemplate(id);
        actions.appendChild(dup);
      }
    });
  }
  function enhanceTemplatePageOrder() {
    const view = qs("view-templates"); if (!view || view.dataset.v16Ordered) return;
    const panels = [...view.querySelectorAll(":scope > .panel")];
    const builtIn = panels.find(p => p.querySelector("#builtInTemplates"));
    const custom = panels.find(p => p.querySelector("#customTemplates"));
    if (builtIn && custom) view.insertBefore(custom, builtIn);
    view.dataset.v16Ordered = "1";
  }
  function ensureTemplateIntro() {
    const view = qs("view-templates"), header = view?.querySelector(".template-header");
    if (!view || !header || qs("templateQuickIntro")) return;
    const intro = document.createElement("div");
    intro.id = "templateQuickIntro";
    intro.className = "template-quick-intro";
    intro.innerHTML = `<div><b>点模板即可查看详情</b><span class="muted">可直接开始、编辑或复制；新建模板仍以选择为主，尽量少打字。</span></div><button class="primary compact" id="quickNewTemplateBtn" type="button">＋ 新建模板</button>`;
    header.insertAdjacentElement("afterend", intro);
    qs("quickNewTemplateBtn").onclick = () => openTemplateEditor();
  }

  const previousRenderTemplates = renderTemplates;
  renderTemplates = function () {
    previousRenderTemplates();
    enhanceTemplatePageOrder();
    ensureTemplateIntro();
    decorateTemplateCards();
  };

  const previousOpenTemplateEditor = openTemplateEditor;
  openTemplateEditor = function (planId = null) {
    previousOpenTemplateEditor(planId);
    document.body.classList.add("template-editor-open");
    const existing = planId ? state.customPlans.find(p => p.id === planId) : null;
    const currentName = existing?.name || "";
    ensureCustomNameOption(currentName);
  };
  const previousCloseTemplateEditor = closeTemplateEditor;
  closeTemplateEditor = function () {
    previousCloseTemplateEditor();
    document.body.classList.remove("template-editor-open");
  };

  function ensureCustomNameOption(currentName = "") {
    const select = qs("templateNamePreset"); if (!select) return;
    if (![...select.options].some(o => o.value === "__custom__")) {
      const option = document.createElement("option"); option.value = "__custom__"; option.textContent = "自定义名称…"; select.appendChild(option);
    }
    let input = qs("templateCustomName");
    if (!input) {
      input = document.createElement("input");
      input.id = "templateCustomName"; input.placeholder = "可选：输入模板名称"; input.maxLength = 24; input.className = "template-custom-name hidden";
      select.parentElement.appendChild(input);
    }
    input.value = currentName;
    const update = () => input.classList.toggle("hidden", select.value !== "__custom__");
    select.onchange = update;
    update();
  }
  const previousResolveTemplateName = resolveTemplateName;
  resolveTemplateName = function () {
    if (qs("templateNamePreset")?.value === "__custom__") {
      const value = qs("templateCustomName")?.value.trim();
      if (value) return value;
    }
    return previousResolveTemplateName();
  };

  const previousSaveTemplate = saveTemplate;
  saveTemplate = function () { previousSaveTemplate(); renderTemplates(); };
  const previousDeleteTemplate = deleteTemplate;
  deleteTemplate = function (id) { previousDeleteTemplate(id); renderTemplates(); };

  const aboutHeading = [...document.querySelectorAll("#view-settings .panel h3")].find(h => h.textContent.startsWith("关于"));
  if (aboutHeading) {
    aboutHeading.textContent = "关于 V1.6";
    const p = aboutHeading.parentElement.querySelector("p");
    if (p) p.textContent = "模板管理更直观，并支持训练自动草稿：重量、次数、RIR、组数、临时动作等会持续保存在本机，误关 App 后可继续。";
  }

  ensureTemplateDetailModal();
  renderDraftBanner();
  renderTemplates();

  if (qs("newTemplateBtn")) qs("newTemplateBtn").onclick = () => openTemplateEditor();
  if (qs("cancelTemplateBtn")) qs("cancelTemplateBtn").onclick = closeTemplateEditor;
  if (qs("saveTemplateBtn")) qs("saveTemplateBtn").onclick = saveTemplate;
  if (qs("finishSessionBtn")) qs("finishSessionBtn").onclick = finishSession;
  document.querySelectorAll("[data-go-templates]").forEach(b => b.onclick = () => { setView("templates"); renderTemplates(); });
})();