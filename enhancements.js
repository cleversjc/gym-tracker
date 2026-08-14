/* V1.4: temporary session exercises + favorite exercise shortcuts */
(() => {
  const FAVORITES_VALUE = "__favorites__";

  function ensureFavoriteState() {
    if (!Array.isArray(state.favoriteExercises)) state.favoriteExercises = [];
  }

  function favorites() {
    ensureFavoriteState();
    return state.favoriteExercises;
  }

  function isFavorite(id) {
    return favorites().includes(id);
  }

  function toggleFavorite(id) {
    if (!id) return;
    ensureFavoriteState();
    if (isFavorite(id)) {
      state.favoriteExercises = state.favoriteExercises.filter(x => x !== id);
      toast("已取消收藏");
    } else {
      state.favoriteExercises.push(id);
      toast("已收藏动作");
    }
    saveState();
  }

  function sortedItems(items) {
    return [...items].sort((a, b) => {
      const favDiff = Number(isFavorite(b.id)) - Number(isFavorite(a.id));
      if (favDiff) return favDiff;
      return a.name.localeCompare(b.name, "zh-CN");
    });
  }

  function pickerItems(category) {
    if (category === FAVORITES_VALUE) {
      return sortedItems(EXERCISE_LIBRARY.filter(e => isFavorite(e.id)));
    }
    return sortedItems(EXERCISE_LIBRARY.filter(e => e.category === category));
  }

  function categoryOptions(selected) {
    const favOption = favorites().length
      ? `<option value="${FAVORITES_VALUE}">★ 收藏 (${favorites().length})</option>`
      : "";
    const normal = categories().map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    return { html: favOption + normal, selected };
  }

  function fillCategorySelect(select, preferred = null) {
    if (!select) return;
    const current = preferred || select.value;
    const opts = categoryOptions(current);
    select.innerHTML = opts.html;
    const available = [...select.options].map(o => o.value);
    if (current && available.includes(current)) select.value = current;
    else if (favorites().length) select.value = FAVORITES_VALUE;
    else select.value = categories()[0] || "";
  }

  function fillExerciseSelect(categorySelect, exerciseSelect, preferredId = null) {
    if (!categorySelect || !exerciseSelect) return;
    const items = pickerItems(categorySelect.value);
    exerciseSelect.innerHTML = items.map(e =>
      `<option value="${e.id}">${isFavorite(e.id) ? "★ " : ""}${escapeHtml(e.name)}</option>`
    ).join("");
    if (preferredId && items.some(e => e.id === preferredId)) exerciseSelect.value = preferredId;
  }

  function syncFavoriteButton(button, exerciseSelect) {
    if (!button || !exerciseSelect) return;
    const id = exerciseSelect.value;
    const fav = !!id && isFavorite(id);
    button.textContent = fav ? "★ 已收藏" : "☆ 收藏";
    button.classList.toggle("favorite-active", fav);
    button.disabled = !id;
  }

  const originalPopulateCategorySelect = populateCategorySelect;
  const originalPopulateExerciseSelect = populateExerciseSelect;

  populateCategorySelect = function () {
    const categorySelect = qs("exerciseCategory");
    const exerciseSelect = qs("exerciseSelect");
    fillCategorySelect(categorySelect);
    fillExerciseSelect(categorySelect, exerciseSelect);
    syncFavoriteButton(qs("favoriteExerciseBtn"), exerciseSelect);
  };

  populateExerciseSelect = function () {
    const categorySelect = qs("exerciseCategory");
    const exerciseSelect = qs("exerciseSelect");
    fillExerciseSelect(categorySelect, exerciseSelect);
    syncFavoriteButton(qs("favoriteExerciseBtn"), exerciseSelect);
  };

  function installTemplateFavoriteUI() {
    const picker = document.querySelector("#templateEditor .exercise-picker");
    const exerciseSelect = qs("exerciseSelect");
    const categorySelect = qs("exerciseCategory");
    if (!picker || !exerciseSelect || !categorySelect) return;

    if (!qs("favoriteExerciseBtn")) {
      const btn = document.createElement("button");
      btn.id = "favoriteExerciseBtn";
      btn.type = "button";
      btn.className = "ghost favorite-btn";
      btn.textContent = "☆ 收藏";
      const addButton = qs("addExerciseBtn");
      picker.insertBefore(btn, addButton);
      btn.onclick = () => {
        const id = exerciseSelect.value;
        toggleFavorite(id);
        const keepCategory = categorySelect.value;
        fillCategorySelect(categorySelect, keepCategory);
        if (keepCategory === FAVORITES_VALUE && !favorites().length) {
          categorySelect.value = categories()[0] || "";
        }
        fillExerciseSelect(categorySelect, exerciseSelect, id);
        syncFavoriteButton(btn, exerciseSelect);
        refreshTempPicker(id);
      };
    }

    categorySelect.onchange = () => populateExerciseSelect();
    exerciseSelect.onchange = () => syncFavoriteButton(qs("favoriteExerciseBtn"), exerciseSelect);
    syncFavoriteButton(qs("favoriteExerciseBtn"), exerciseSelect);
  }

  const originalOpenTemplateEditor = openTemplateEditor;
  openTemplateEditor = function (planId = null) {
    originalOpenTemplateEditor(planId);
    installTemplateFavoriteUI();
    populateCategorySelect();
  };

  function installTempExerciseUI() {
    const sessionView = qs("view-session");
    const exerciseList = qs("exerciseList");
    if (!sessionView || !exerciseList || qs("tempExercisePanel")) return;

    const panel = document.createElement("div");
    panel.id = "tempExercisePanel";
    panel.className = "session-add-panel";
    panel.innerHTML = `
      <button id="toggleTempExerciseBtn" class="ghost full session-add-toggle" type="button">＋ 临时加动作</button>
      <div id="tempExercisePicker" class="temp-picker hidden">
        <div class="picker-title-row">
          <div>
            <div class="exercise-name">临时添加</div>
            <div class="muted">只加入本次训练，不修改原模板</div>
          </div>
          <button id="closeTempExerciseBtn" class="icon-mini" type="button">✕</button>
        </div>
        <div class="exercise-picker temp-exercise-picker">
          <label>动作类别<select id="tempExerciseCategory"></select></label>
          <label>选择动作<select id="tempExerciseSelect"></select></label>
          <button id="tempFavoriteExerciseBtn" class="ghost favorite-btn" type="button">☆ 收藏</button>
          <button id="addTempExerciseBtn" class="primary" type="button">＋ 加入本次训练</button>
        </div>
      </div>`;
    exerciseList.parentNode.insertBefore(panel, exerciseList);

    const toggle = qs("toggleTempExerciseBtn");
    const picker = qs("tempExercisePicker");
    const close = qs("closeTempExerciseBtn");
    const categorySelect = qs("tempExerciseCategory");
    const exerciseSelect = qs("tempExerciseSelect");
    const favBtn = qs("tempFavoriteExerciseBtn");

    toggle.onclick = () => {
      picker.classList.toggle("hidden");
      if (!picker.classList.contains("hidden")) refreshTempPicker();
    };
    close.onclick = () => picker.classList.add("hidden");
    categorySelect.onchange = () => {
      fillExerciseSelect(categorySelect, exerciseSelect);
      syncFavoriteButton(favBtn, exerciseSelect);
    };
    exerciseSelect.onchange = () => syncFavoriteButton(favBtn, exerciseSelect);
    favBtn.onclick = () => {
      const id = exerciseSelect.value;
      toggleFavorite(id);
      const keepCategory = categorySelect.value;
      fillCategorySelect(categorySelect, keepCategory);
      if (keepCategory === FAVORITES_VALUE && !favorites().length) {
        categorySelect.value = categories()[0] || "";
      }
      fillExerciseSelect(categorySelect, exerciseSelect, id);
      syncFavoriteButton(favBtn, exerciseSelect);
      refreshTemplatePicker(id);
    };
    qs("addTempExerciseBtn").onclick = () => addTemporaryExercise();

    refreshTempPicker();
  }

  function refreshTempPicker(preferredId = null) {
    const categorySelect = qs("tempExerciseCategory");
    const exerciseSelect = qs("tempExerciseSelect");
    if (!categorySelect || !exerciseSelect) return;
    const keepCategory = categorySelect.value;
    fillCategorySelect(categorySelect, keepCategory);
    fillExerciseSelect(categorySelect, exerciseSelect, preferredId);
    syncFavoriteButton(qs("tempFavoriteExerciseBtn"), exerciseSelect);
  }

  function refreshTemplatePicker(preferredId = null) {
    const categorySelect = qs("exerciseCategory");
    const exerciseSelect = qs("exerciseSelect");
    if (!categorySelect || !exerciseSelect) return;
    const keepCategory = categorySelect.value;
    fillCategorySelect(categorySelect, keepCategory);
    fillExerciseSelect(categorySelect, exerciseSelect, preferredId);
    syncFavoriteButton(qs("favoriteExerciseBtn"), exerciseSelect);
  }

  function addTemporaryExercise() {
    if (!currentSession) {
      toast("请先开始一次训练");
      return;
    }
    const id = qs("tempExerciseSelect")?.value;
    const base = fromLibrary(id);
    if (!base) return;

    const item = makeExerciseState({ ...base, temporary: true, instanceId: uid("temp") });
    item.temporary = true;
    currentSession.exercises.push(item);
    renderExercises();
    qs("tempExercisePicker")?.classList.add("hidden");
    toast(`已临时加入：${base.name}`);

    requestAnimationFrame(() => {
      const cards = document.querySelectorAll("#exerciseList .exercise-card");
      cards[cards.length - 1]?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function decorateTemporaryCards() {
    if (!currentSession) return;
    currentSession.exercises.forEach((exercise, index) => {
      if (!exercise.temporary) return;
      const card = document.querySelector(`#exerciseList .exercise-card[data-ex="${index}"]`);
      if (!card) return;
      const head = card.querySelector(".exercise-title-row");
      if (head && !head.querySelector(".temporary-tag")) {
        const tag = document.createElement("span");
        tag.className = "temporary-tag";
        tag.textContent = "临时";
        const status = head.querySelector(".exercise-status");
        if (status) status.insertAdjacentElement("beforebegin", tag);
        else head.appendChild(tag);
      }
      const actions = card.querySelector(".exercise-actions");
      if (actions && !actions.querySelector(".remove-temp-exercise")) {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "ghost remove-temp-exercise";
        remove.textContent = "移除";
        remove.onclick = () => {
          currentSession.exercises.splice(index, 1);
          renderExercises();
          toast("已从本次训练移除");
        };
        actions.insertBefore(remove, actions.firstChild);
      }
    });
  }

  const originalRenderExercises = renderExercises;
  renderExercises = function () {
    originalRenderExercises();
    decorateTemporaryCards();
  };

  const originalStartSession = startSession;
  startSession = function (planId) {
    originalStartSession(planId);
    installTempExerciseUI();
    qs("tempExercisePicker")?.classList.add("hidden");
    refreshTempPicker();
  };

  ensureFavoriteState();
  installTemplateFavoriteUI();
  installTempExerciseUI();

  const originalRenderHome = renderHome;
  renderHome = function () {
    originalRenderHome();
    document.querySelectorAll(".start-plan").forEach(b => b.onclick = () => startSession(b.dataset.plan));
  };

  const originalRenderTemplates = renderTemplates;
  renderTemplates = function () {
    originalRenderTemplates();
    document.querySelectorAll(".template-start").forEach(b => b.onclick = () => startSession(b.dataset.id));
  };

  if (qs("startSuggestedBtn")) qs("startSuggestedBtn").onclick = () => startSession(getSuggestedPlan().id);
  if (qs("newTemplateBtn")) qs("newTemplateBtn").onclick = () => openTemplateEditor();
  if (qs("exerciseCategory")) qs("exerciseCategory").onchange = () => populateExerciseSelect();

  renderHome();
  renderTemplates();
})();
