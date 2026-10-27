(() => {
  const PARTS = { why: "Why Alpha", alpha: "Alpha in action", company: "For your company" };
  const all = [...document.querySelectorAll(".slide")];
  const $ = (id) => document.getElementById(id);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let current = null;
  const pad = (n) => String(n).padStart(2, "0");

  // ---- progress line: a small gap marks where each part starts ----
  function buildTicks() {
    const ticks = $("ticks");
    ticks.innerHTML = "";
    all.forEach((s, i) => {
      if (i === 0 || all[i - 1].dataset.part === s.dataset.part) return;
      const t = document.createElement("span");
      t.style.left = `calc(${(i / all.length) * 100}% - 1.5px)`;
      ticks.appendChild(t);
    });
  }

  // ---- menu: outline ----
  function buildOutline() {
    const list = $("outlineList");
    list.innerHTML = "";
    for (const [part, label] of Object.entries(PARTS)) {
      const group = document.createElement("div");
      group.className = "group";
      const n = Object.keys(PARTS).indexOf(part) + 1;
      group.innerHTML = `<span class="mono">${pad(n)} · ${label}</span>`;
      for (const s of all.filter((x) => x.dataset.part === part)) {
        const b = document.createElement("button");
        b.dataset.id = s.id;
        b.innerHTML = `<span class="mono">${pad(all.indexOf(s) + 1)}</span><span>${s.dataset.title}</span>`;
        b.addEventListener("click", () => { go(s.id); closeDrawers(); });
        group.appendChild(b);
      }
      list.appendChild(group);
    }
    $("outlineMeta").textContent = `${all.length} slides`;
  }

  // ---- count-up numbers ----
  function countUp(slide) {
    for (const el of slide.querySelectorAll("[data-count]")) {
      const to = Number(el.dataset.count);
      if (reduced) { el.textContent = to; continue; }
      const start = performance.now();
      el.textContent = "0";
      const tick = (t) => {
        const p = Math.min(1, (t - start - 350) / 1100);
        if (p < 0) return requestAnimationFrame(tick);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // ---- the cover's build card: type the request, then tick each step ----
  const REQUEST = "Build an expense approval app for the finance team, with sign-in and a manager view.";
  let coverRun = 0;
  function playCover() {
    const run = ++coverRun;
    const typed = $("bcType");
    const steps = [...document.querySelectorAll(".bc-steps li")];
    const live = document.querySelector(".bc-live");
    steps.forEach((li) => li.classList.remove("done"));
    live.classList.remove("on");
    if (reduced) {
      typed.textContent = REQUEST;
      steps.forEach((li) => li.classList.add("done"));
      live.classList.add("on");
      return;
    }
    typed.textContent = "";
    let i = 0;
    const later = (fn, ms) => setTimeout(() => run === coverRun && fn(), ms);
    const type = () => {
      typed.textContent = REQUEST.slice(0, ++i);
      if (i < REQUEST.length) later(type, 32);
      else steps.forEach((li, k) => later(() => {
        li.classList.add("done");
        if (k === steps.length - 1) later(() => live.classList.add("on"), 450);
      }, 500 + k * 520));
    };
    later(type, 700);
  }

  // ---- go to a slide ----
  function go(target) {
    let slide = typeof target === "number" ? all[target] : document.getElementById(target);
    if (!slide || !all.includes(slide)) slide = all[0];
    if (slide === current) return;

    for (const s of all) {
      const on = s === slide;
      s.classList.toggle("active", on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
      if (on) s.scrollTop = 0;
    }
    current = slide;
    if (location.hash !== `#${slide.id}`) history.replaceState(null, "", `#${slide.id}`);

    const i = all.indexOf(slide);
    $("count").textContent = `${pad(i + 1)} / ${pad(all.length)}`;
    $("where").textContent = PARTS[slide.dataset.part];
    $("progressFill").style.width = `${((i + 1) / all.length) * 100}%`;
    $("prevBtn").disabled = i === 0;
    $("nextBtn").disabled = i === all.length - 1;
    const body = document.body.classList;
    body.toggle("on-cover", slide.id === "cover");
    body.toggle("on-dark", slide.classList.contains("dark"));
    body.toggle("on-navy", slide.classList.contains("navy"));
    body.toggle("on-orange", slide.classList.contains("orange"));
    for (const b of document.querySelectorAll("#outlineList button")) b.classList.toggle("now", b.dataset.id === slide.id);
    countUp(slide);
    if (slide.id === "cover") playCover();
  }

  const step = (d) => {
    const i = all.indexOf(current);
    const j = Math.max(0, Math.min(all.length - 1, i + d));
    if (j !== i) go(all[j].id);
  };

  // ---- drawer ----
  function openDrawer(id) {
    closeDrawers();
    $(id).classList.add("open");
    $("scrim").classList.add("open");
  }
  function closeDrawers() {
    for (const d of document.querySelectorAll(".drawer")) d.classList.remove("open");
    $("scrim").classList.remove("open");
  }
  const toggleDrawer = (id) => ($(id).classList.contains("open") ? closeDrawers() : openDrawer(id));
  const toggleFull = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.());

  // ---- wiring ----
  $("prevBtn").addEventListener("click", () => step(-1));
  $("nextBtn").addEventListener("click", () => step(1));
  $("menuBtn").addEventListener("click", () => toggleDrawer("outline"));
  $("fullBtn").addEventListener("click", toggleFull);
  $("scrim").addEventListener("click", closeDrawers);
  for (const b of document.querySelectorAll("[data-close]")) b.addEventListener("click", closeDrawers);
  for (const b of document.querySelectorAll("[data-go]")) {
    b.addEventListener("click", () => (b.dataset.go === "next" ? step(1) : go(b.dataset.go)));
  }

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) { e.preventDefault(); step(-1); }
    else if (e.key === "Home") go(all[0].id);
    else if (e.key === "End") go(all.at(-1).id);
    else if (e.key === "Escape") closeDrawers();
    else if (k === "m") toggleDrawer("outline");
    else if (k === "f") toggleFull();
  });

  let touchX = null;
  document.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
    touchX = null;
  });

  window.addEventListener("hashchange", () => go(location.hash.slice(1)));

  buildTicks();
  buildOutline();
  go(location.hash.slice(1) || all[0].id);
})();
