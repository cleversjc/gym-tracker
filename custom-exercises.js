/* V1.7: reusable custom exercise library */
(() => {
  const CUSTOM_PREFIX = "custom_ex_";
  const TYPE_LABELS = {
    strength: "力量 · 重量 + 次数",
    bodyweight: "自重 · 次数",
    repsOnly: "次数",
    seconds: "计时组",
    cardio: "有氧"
  };
  const CATEGORY_CHOICES = ["胸", "背", "肩", "手臂", "腿臀", "体态 / 核心", "有氧", "其他"];
  let editingCustomExerciseId = null;

  function ensureState() {
    if (!Array.isArray(state.customExercises)) state.customExercises = [];
  }

  function isCustomLibraryItem(item) {
    return !!item?.custom || String(item?.id || "").startsWith(CUSTOM_PREFIX);
  }

  function normalizeExercise(item) {
    const type = ["strength", "bodyweight", "repsOnly", "seconds", "cardio"].includes(item.type) ? item.type : "strength";
    const category = item.category || (type === "cardio" ? "有氧" : "其他");
    const base = {
      id: item.id || uid(CUSTOM_PREFIX.slice(0, -1)),
      name: String(item.name || "自定义项目").trim(),
      category,
      target: item.target || (category === "其他" ? "自定义" : category),
      type,
      custom: true,
      sets: Math.min(8, Math.max(1, Number(item.sets || (type === "cardio" ? 1 : 2))))
    };
    if (type === "cardio") {
      const minutes = Math.min(180, Math.max(5, Number(item.min || item.max || 20)));
      return {...base, sets: 1, min: minutes, max: minutes, distanceStep: Number(item.distanceStep ?? 0.1)};
    }
    const min = Math.max(1, Number(item.min || (type === "seconds" ? 30 : 8)));
    const max = Math.max(min, Number(item.max || (type === "seconds" ? 60 : 12)));
    return {...base, min, max};
  }

  function syncLibraryFromState() {
    ensureState();
    for (let i = EXERCISE_LIBRARY.length - 1; i >= 0; i--) {
      if (isCustomLibraryItem(EXERCISE_LIBRARY[i])) EXERCISE_LIBRARY.splice(i, 1);
    }
    state.customExercises = state.customExercises.map(normalizeExercise);
    state.customExercises.forEach(item => EXERCISE_LIBRARY.push({...item}));
  }

  function customExerciseById(id) {
    ensureState();
    return state.customExercises.find(e => e.id === id) || null;
  }

  function typeDescription(e) {
    if (e.type === "cardio") return `${TYPE_LABELS.cardio} · 默认 ${e.min || 20} 分钟`;
    const unit = e.type === "seconds" ? "秒" : "次";
    return `${TYPE_LABELS[e.type] || "训练"} · ${e.sets || 1} 组 × ${e.min || 1}–${e.max || e.min || 1} ${unit}`;
  }

  function ensureManagerPanel() {
    const view = qs("view-templates");
    if (!view || qs("customExerciseManager")) return;
    const panel = document.createElement("div");
    panel.id = "customExerciseManager";
    panel.className = "panel custom-exercise-manager";
    panel.innerHTML = `
      <div class="section-title-row">
        <div>
          <h3>我的训练项目</h3>
          <div class="muted">创建一次，之后可在模板和临时加动作中直接选择</div>
        </div>
        <button id="newCustomExerciseBtn" class="primary compact" type="button">＋ 新建项目</button>
      </div>
      <div id="customExerciseCount" class="custom-exercise-count muted"></div>
      <div id="customExerciseList" class="stack custom-exercise-list"></div>`;
    const templateEditor = qs("templateEditor");
    if (templateEditor) view.insertBefore(panel, templateEditor);
    else view.appendChild(panel);
    qs("newCustomExerciseBtn").onclick = () => openCustomExerciseEditor();
  }

  function renderCustomExercises() {
    ensureState();
    ensureManagerPanel();
    const count = qs("customExerciseCount"), list = qs("customExerciseList");
    if (!count || !list) return;
    count.textContent = `${state.customExercises.length} 个自定义项目`;
    if (!state.customExercises.length) {
      list.innerHTML = `<div class="empty-state">还没有自定义项目。比如健身房里有一台 App 动作库中没有的器械，就可以在这里创建。</div>`;
      return;
    }
    list.innerHTML = state.customExercises.map(e => `
      <div class="custom-exercise-card">
        <div class="custom-exercise-main">
          <div class="custom-exercise-name">${escapeHtml(e.name)}</div>
          <div class="custom-exercise-meta">${escapeHtml(e.category)} · ${escapeHtml(typeDescription(e))}</div>
        </div>
        <div class="custom-exercise-actions">
          <button class="ghost small" type="button" data-edit-custom-exercise="${e.id}">编辑</button>
          <button class="ghost small" type="button" data-delete-custom-exercise="${e.id}">删除</button>
        </div>
      </div>`).join("");
    list.querySelectorAll("[data-edit-custom-exercise]").forEach(b => b.onclick = () => openCustomExerciseEditor(b.dataset.editCustomExercise));
    list.querySelectorAll("[data-delete-custom-exercise]").forEach(b => b.onclick = () => deleteCustomExercise(b.dataset.deleteCustomExercise));
  }

  function ensureEditorModal() {
    if (qs("customExerciseModal")) return;
    const modal = document.createElement("div");
    modal.id = "customExerciseModal";
    modal.className = "custom-exercise-modal hidden";
    modal.innerHTML = `
      <div class="custom-exercise-sheet">
        <div class="custom-exercise-editor-head">
          <div><div class="muted">EXERCISE LIBRARY</div><h2 id="customExerciseEditorTitle">新建训练项目</h2></div>
          <button id="closeCustomExerciseBtn" class="icon-btn" type="button">✕</button>
        </div>
        <div class="custom-exercise-form">
          <label>项目名称 <span class="required-dot">必填</span>
            <input id="customExerciseName" maxlength="30" placeholder="例如：高位划船机" autocomplete="off" />
          </label>
          <div class="custom-exercise-grid">
            <label>记录方式
              <select id="customExerciseType">
                <option value="strength">力量：重量 + 次数 + RIR</option>
                <option value="bodyweight">自重：次数 + RIR</option>
                <option value="repsOnly">次数：不记录重量</option>
                <option value="seconds">计时组：每组记录秒数</option>
                <option value="cardio">有氧：时间 / 距离 / 强度</option>
              </select>
            </label>
            <label>类别
              <select id="customExerciseCategory">${CATEGORY_CHOICES.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}</select>
            </label>
          </div>
          <div id="customExerciseStrengthDefaults" class="custom-exercise-grid">
            <label>默认组数
              <select id="customExerciseSets">${[1,2,3,4,5,6].map(n => `<option value="${n}">${n} 组</option>`).join("")}</select>
            </label>
            <label>目标范围
              <select id="customExerciseRange"></select>
            </label>
          </div>
          <div id="customExerciseCardioDefaults" class="custom-exercise-grid hidden">
            <label>默认时长
              <select id="customExerciseMinutes">${[10,15,20,30,45,60,90].map(n => `<option value="${n}">${n} 分钟</option>`).join("")}</select>
            </label>
            <label>距离记录
              <select id="customExerciseDistance"><option value="0.1">记录距离（0.1 km）</option><option value="0">主要记录时间</option></select>
            </label>
          </div>
          <div class="custom-exercise-preview" id="customExercisePreview"></div>
          <button id="saveCustomExerciseBtn" class="primary full" type="button">保存训练项目</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    qs("closeCustomExerciseBtn").onclick = closeCustomExerciseEditor;
    modal.addEventListener("click", e => { if (e.target === modal) closeCustomExerciseEditor(); });
    qs("customExerciseType").onchange = updateCustomExerciseForm;
    qs("customExerciseCategory").onchange = updateCustomExercisePreview;
    qs("customExerciseSets").onchange = updateCustomExercisePreview;
    qs("customExerciseRange").onchange = updateCustomExercisePreview;
    qs("customExerciseMinutes").onchange = updateCustomExercisePreview;
    qs("customExerciseDistance").onchange = updateCustomExercisePreview;
    qs("customExerciseName").oninput = updateCustomExercisePreview;
    qs("saveCustomExerciseBtn").onclick = saveCustomExercise;
  }

  function rangeOptions(type) {
    if (type === "seconds") return [[15,30],[20,30],[30,45],[30,60],[45,60],[60,90]];
    return [[4,6],[6,8],[8,12],[10,12],[10,15],[12,15],[15,20],[20,30]];
  }

  function populateRangeSelect(type, selectedMin = null, selectedMax = null) {
    const select = qs("customExerciseRange");
    if (!select) return;
    const options = rangeOptions(type);
    if (selectedMin !== null && selectedMax !== null && !options.some(([a,b]) => a === Number(selectedMin) && b === Number(selectedMax))) {
      options.push([Number(selectedMin), Number(selectedMax)]);
    }
    select.innerHTML = options.map(([a,b]) => `<option value="${a}:${b}">${a}–${b} ${type === "seconds" ? "秒" : "次"}</option>`).join("");
    if (selectedMin !== null && selectedMax !== null) select.value = `${Number(selectedMin)}:${Number(selectedMax)}`;
    if (!select.value && options.length) select.value = `${options[0][0]}:${options[0][1]}`;
  }

  function updateCustomExerciseForm() {
    const type = qs("customExerciseType").value;
    const cardio = type === "cardio";
    qs("customExerciseStrengthDefaults").classList.toggle("hidden", cardio);
    qs("customExerciseCardioDefaults").classList.toggle("hidden", !cardio);
    if (cardio) qs("customExerciseCategory").value = "有氧";
    const previous = qs("customExerciseRange")?.value?.split(":").map(Number) || [];
    populateRangeSelect(type, previous[0], previous[1]);
    updateCustomExercisePreview();
  }

  function updateCustomExercisePreview() {
    const preview = qs("customExercisePreview"); if (!preview) return;
    const type = qs("customExerciseType")?.value || "strength";
    const name = qs("customExerciseName")?.value.trim() || "未命名项目";
    const category = qs("customExerciseCategory")?.value || "其他";
    let detail;
    if (type === "cardio") detail = `${qs("customExerciseMinutes")?.value || 20} 分钟 · 时间 / 距离 / 强度`;
    else {
      const [min,max] = (qs("customExerciseRange")?.value || "8:12").split(":");
      detail = `${qs("customExerciseSets")?.value || 2} 组 × ${min}–${max} ${type === "seconds" ? "秒" : "次"}`;
    }
    preview.innerHTML = `<span class="muted">保存后将显示为</span><b>${escapeHtml(name)}</b><span>${escapeHtml(category)} · ${escapeHtml(TYPE_LABELS[type] || "训练")} · ${escapeHtml(detail)}</span>`;
  }

  function openCustomExerciseEditor(id = null) {
    ensureEditorModal();
    editingCustomExerciseId = id;
    const e = id ? customExerciseById(id) : null;
    qs("customExerciseEditorTitle").textContent = e ? "编辑训练项目" : "新建训练项目";
    qs("customExerciseName").value = e?.name || "";
    qs("customExerciseType").value = e?.type || "strength";
    qs("customExerciseCategory").value = e?.category || "其他";
    qs("customExerciseSets").value = String(e?.sets || 2);
    qs("customExerciseMinutes").value = String(e?.min || 20);
    qs("customExerciseDistance").value = String(e?.distanceStep ?? 0.1);
    populateRangeSelect(e?.type || "strength", e?.min ?? 8, e?.max ?? 12);
    updateCustomExerciseForm();
    qs("customExerciseModal").classList.remove("hidden");
    document.body.classList.add("custom-exercise-open");
    setTimeout(() => qs("customExerciseName")?.focus(), 50);
  }

  function closeCustomExerciseEditor() {
    qs("customExerciseModal")?.classList.add("hidden");
    document.body.classList.remove("custom-exercise-open");
    editingCustomExerciseId = null;
  }

  function buildExerciseFromForm(existingId = null) {
    const name = qs("customExerciseName").value.trim();
    if (!name) return null;
    const type = qs("customExerciseType").value;
    const category = qs("customExerciseCategory").value || (type === "cardio" ? "有氧" : "其他");
    const id = existingId || `${CUSTOM_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    if (type === "cardio") {
      const minutes = Number(qs("customExerciseMinutes").value) || 20;
      return normalizeExercise({id,name,type,category,target:category,sets:1,min:minutes,max:minutes,distanceStep:Number(qs("customExerciseDistance").value),custom:true});
    }
    const [min,max] = qs("customExerciseRange").value.split(":").map(Number);
    return normalizeExercise({id,name,type,category,target:category,sets:Number(qs("customExerciseSets").value)||2,min,max,custom:true});
  }

  function updatePlanReferences(previous, next) {
    (state.customPlans || []).forEach(plan => {
      (plan.exercises || []).forEach((e, i) => {
        if (e.id !== next.id) return;
        if (previous?.type === next.type) {
          plan.exercises[i] = {...e, name:next.name, category:next.category, target:next.target};
        } else {
          plan.exercises[i] = {...next};
        }
      });
    });
  }

  function saveCustomExercise() {
    ensureState();
    const item = buildExerciseFromForm(editingCustomExerciseId);
    if (!item) { toast("请输入项目名称"); qs("customExerciseName")?.focus(); return; }
    const duplicate = state.customExercises.find(e => e.name.trim().toLowerCase() === item.name.trim().toLowerCase() && e.id !== item.id);
    if (duplicate && !confirm(`已经有一个叫「${duplicate.name}」的自定义项目，仍然保存吗？`)) return;
    const idx = state.customExercises.findIndex(e => e.id === item.id);
    const previous = idx >= 0 ? state.customExercises[idx] : null;
    if (idx >= 0) state.customExercises[idx] = item; else state.customExercises.push(item);
    updatePlanReferences(previous, item);
    syncLibraryFromState();
    saveState();
    closeCustomExerciseEditor();
    renderCustomExercises();
    renderTemplates();
    renderHome();
    refreshPickersForNewExercise(item);
    toast(idx >= 0 ? "训练项目已更新" : "训练项目已创建");
  }

  function deleteCustomExercise(id) {
    const item = customExerciseById(id); if (!item) return;
    if (!confirm(`从动作库删除「${item.name}」？已有训练历史和已保存模板中的记录会保留。`)) return;
    state.customExercises = state.customExercises.filter(e => e.id !== id);
    if (Array.isArray(state.favoriteExercises)) state.favoriteExercises = state.favoriteExercises.filter(x => x !== id);
    syncLibraryFromState();
    saveState();
    renderCustomExercises();
    renderTemplates();
    toast("已从自定义动作库删除");
  }

  function ensureQuickCreateButtons() {
    const editorPicker = document.querySelector("#templateEditor .exercise-picker");
    if (editorPicker && !qs("quickCustomExerciseBtn")) {
      const btn = document.createElement("button");
      btn.id = "quickCustomExerciseBtn"; btn.type = "button"; btn.className = "ghost custom-exercise-quick-btn"; btn.textContent = "＋ 自定义项目";
      editorPicker.appendChild(btn);
      btn.onclick = () => openCustomExerciseEditor();
    }
    const tempPicker = document.querySelector("#tempExercisePicker .exercise-picker");
    if (tempPicker && !qs("tempQuickCustomExerciseBtn")) {
      const btn = document.createElement("button");
      btn.id = "tempQuickCustomExerciseBtn"; btn.type = "button"; btn.className = "ghost custom-exercise-quick-btn"; btn.textContent = "＋ 自定义项目";
      tempPicker.appendChild(btn);
      btn.onclick = () => openCustomExerciseEditor();
    }
  }

  function selectExerciseInPicker(categoryId, exerciseId, categorySelectId, exerciseSelectId) {
    const categorySelect = qs(categorySelectId), exerciseSelect = qs(exerciseSelectId);
    if (!categorySelect || !exerciseSelect) return;
    if (![...categorySelect.options].some(o => o.value === categoryId)) {
      const option = document.createElement("option"); option.value = categoryId; option.textContent = categoryId; categorySelect.appendChild(option);
    }
    categorySelect.value = categoryId;
    categorySelect.dispatchEvent(new Event("change", {bubbles:true}));
    setTimeout(() => {
      if ([...exerciseSelect.options].some(o => o.value === exerciseId)) {
        exerciseSelect.value = exerciseId;
        exerciseSelect.dispatchEvent(new Event("change", {bubbles:true}));
      }
    }, 0);
  }

  function refreshPickersForNewExercise(item) {
    try { if (typeof populateCategorySelect === "function") populateCategorySelect(); } catch (_) {}
    selectExerciseInPicker(item.category, item.id, "exerciseCategory", "exerciseSelect");
    selectExerciseInPicker(item.category, item.id, "tempExerciseCategory", "tempExerciseSelect");
    ensureQuickCreateButtons();
  }

  const previousRenderTemplates = renderTemplates;
  renderTemplates = function () {
    syncLibraryFromState();
    previousRenderTemplates();
    ensureManagerPanel();
    renderCustomExercises();
    ensureQuickCreateButtons();
  };

  const previousOpenTemplateEditor = openTemplateEditor;
  openTemplateEditor = function (planId = null) {
    syncLibraryFromState();
    previousOpenTemplateEditor(planId);
    ensureQuickCreateButtons();
  };

  document.addEventListener("click", e => {
    if (e.target.closest("#toggleTempExerciseBtn") || e.target.closest("#newTemplateBtn") || e.target.closest("#quickNewTemplateBtn")) {
      setTimeout(ensureQuickCreateButtons, 0);
    }
  }, true);

  syncLibraryFromState();
  ensureEditorModal();
  ensureManagerPanel();
  ensureQuickCreateButtons();
  renderCustomExercises();
  renderTemplates();

  const aboutHeading = [...document.querySelectorAll("#view-settings .panel h3")].find(h => h.textContent.startsWith("关于"));
  if (aboutHeading) {
    aboutHeading.textContent = "关于 V1.7";
    const p = aboutHeading.parentElement.querySelector("p");
    if (p) p.textContent = "支持自定义训练项目：创建后可反复用于模板、收藏和训练中的临时加动作；训练草稿仍会自动保存。";
  }
})();