(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const LS_KEY = "tpb.bank.custom.v1";
  const ROMAN = { 6: "VI", 7: "VII", 8: "VIII" };

  const state = {
    pattern: null,        // working copy of the chosen pattern (counts editable)
    ticked: new Set(),    // chapter numbers included
    seed: 1,
    paper: [],            // [{ sec, slots: [question|null] }]
    custom: [],           // teacher-added / imported questions
    hideSample: false
  };

  // ---------- helpers ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function rng(seed) { // mulberry32: repeatable shuffles
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  let msgTimer;
  function say(text) {
    const m = $("msg"); m.textContent = text; m.hidden = false;
    clearTimeout(msgTimer); msgTimer = setTimeout(() => (m.hidden = true), 8000);
  }
  const cls = () => Number($("cls").value);
  const subject = () => $("subject").value;
  const chapterInfo = () => window.CHAPTERS[cls() + "-" + subject()];
  const chapterName = (n) => {
    const info = chapterInfo();
    const hit = info && info.list.find((c) => c[0] === n);
    return hit ? hit[1] : "Ch " + n;
  };

  // ---------- question bank ----------
  function loadCustom() {
    try { state.custom = JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch (e) { state.custom = []; }
  }
  function saveCustom() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state.custom)); } catch (e) { /* storage blocked: keep in memory */ }
  }
  const bank = () => (state.hideSample ? [] : window.SAMPLE_BANK).concat(state.custom);

  function candidates(sec) {
    return bank().filter((q) =>
      q.cls === cls() && q.subject === subject() && state.ticked.has(q.chapter) &&
      q.marks === sec.marks && (sec.kind === "mcq" ? q.type === "mcq" : q.type !== "mcq"));
  }

  // ---------- generation ----------
  // Round-robin across ticked chapters so every taught chapter is represented.
  function fillSection(sec, secIndex, used, rand) {
    const byCh = {};
    shuffle(candidates(sec).filter((q) => !used.has(q.id)), rand).forEach((q) => (byCh[q.chapter] = byCh[q.chapter] || []).push(q));
    const chs = Object.keys(byCh).map(Number).sort((a, b) => a - b);
    const slots = [];
    let turn = chs.length ? secIndex % chs.length : 0;
    while (slots.length < sec.count && chs.some((c) => byCh[c].length)) {
      const c = chs[turn % chs.length]; turn++;
      if (byCh[c].length) { const q = byCh[c].shift(); used.add(q.id); slots.push(q); }
    }
    while (slots.length < sec.count) slots.push(null);
    return slots;
  }

  function generate() {
    const rand = rng(state.seed);
    const used = new Set();
    state.paper = state.pattern.sections.map((sec, i) => ({ sec, slots: fillSection(sec, i, used, rand) }));
    renderAll();
  }

  function swap(si, qi) {
    const part = state.paper[si];
    const inUse = new Set(state.paper.flatMap((p) => p.slots.filter(Boolean).map((q) => q.id)));
    const cur = part.slots[qi];
    let pool = candidates(part.sec).filter((q) => !inUse.has(q.id));
    const sameCh = cur ? pool.filter((q) => q.chapter === cur.chapter) : [];
    pool = sameCh.length ? sameCh : pool;
    if (!pool.length) { say("No other unused question matches this slot. Add more questions to the bank."); return; }
    part.slots[qi] = pool[Math.floor(Math.random() * pool.length)];
    renderAll();
  }

  // ---------- rendering ----------
  function renderControls() {
    const key = cls() + "-" + subject();
    const info = window.CHAPTERS[key];
    const box = $("chapters");
    box.innerHTML = "";
    if (!info) {
      state.ticked.clear();
      $("chapterNote").textContent = "Chapter list for Class " + cls() + " " + subject() + " is not available yet. Needed from the teacher (see CLAUDE.md, 'Still needed from her').";
    } else {
      $("chapterNote").textContent = info.book + (info.confirmed ? "" : " · class assumed from the second contents page (to confirm)") + ". Ticking will come from the diary later.";
      info.list.forEach(([n, name]) => {
        const l = document.createElement("label");
        l.className = "chk";
        l.innerHTML = '<input type="checkbox" value="' + n + '"' + (state.ticked.has(n) ? " checked" : "") + "> " + n + " · " + esc(name);
        l.firstChild.addEventListener("change", (e) => { e.target.checked ? state.ticked.add(n) : state.ticked.delete(n); });
        box.appendChild(l);
      });
    }
    renderPattern();
  }

  function renderPattern() {
    const p = state.pattern;
    $("patternNote").textContent = (p.confirmed ? "" : "Placeholder · ") + p.note;
    const total = p.sections.reduce((s, x) => s + x.count * x.marks, 0);
    const qs = p.sections.reduce((s, x) => s + x.count, 0);
    $("pattern").innerHTML = "<tr><th>Section</th><th>Type</th><th>Qs</th><th>Marks each</th><th>Total</th></tr>" +
      p.sections.map((s, i) => "<tr><td>" + s.name + "</td><td>" + (s.kind === "mcq" ? "MCQ" : "Written") +
        '</td><td><input type="number" min="0" max="40" data-i="' + i + '" value="' + s.count + '" aria-label="Questions in section ' + s.name + '"></td><td>' +
        s.marks + "</td><td>" + s.count * s.marks + "</td></tr>").join("") +
      "<tr><th colspan='2'>Total</th><th>" + qs + "</th><th></th><th>" + total + "</th></tr>";
    $("pattern").querySelectorAll("input").forEach((inp) => inp.addEventListener("change", (e) => {
      p.sections[Number(e.target.dataset.i)].count = Math.max(0, Number(e.target.value) || 0);
      renderPattern();
    }));
  }

  function qHtml(q, n, withKey, si, qi) {
    if (!q) {
      const sec = state.paper[si].sec;
      return '<div class="q missing"><span>' + n + '.</span><span class="qt">[No ' + sec.marks + "-mark " + (sec.kind === "mcq" ? "MCQ" : "question") +
        " in the bank for the ticked chapters. Add one in the Question bank tab.]</span><span class=\"marks\">[" + sec.marks + "]</span></div>";
    }
    const opts = q.type === "mcq"
      ? '<div class="opts">' + q.opts.map((o, i) => "<span>(" + "abcd"[i] + ") " + esc(o) + "</span>").join("") + "</div>" : "";
    const ans = withKey ? '<div class="ans"><strong>Ans:</strong> ' + esc(q.answer) + "</div>" : "";
    const tools = withKey ? "" : '<div class="tools"><button type="button" data-swap="' + si + "," + qi + '">Replace this question</button> <span class="ch-tag">' + esc(chapterName(q.chapter)) + "</span></div>";
    return '<div class="q"><span>' + n + '.</span><div><div class="qt">' + esc(q.text) + "</div>" + opts + ans + "</div><span class=\"marks\">[" + q.marks + "]</span>" + tools + "</div>";
  }

  function header(titleSuffix) {
    const p = state.pattern;
    const total = p.sections.reduce((s, x) => s + x.count * x.marks, 0);
    return '<h2 class="school">' + esc($("school").value) + "</h2>" +
      '<div class="sub">Session ' + esc($("session").value) + "</div>" +
      '<div class="sub"><strong>' + esc(p.name) + " Examination" + esc(titleSuffix) + " · Class " + ROMAN[cls()] + " · " + esc(subject()) + "</strong></div>" +
      '<div class="meta"><span>Time: ' + esc(p.time) + "</span><span>Max. Marks: " + total + "</span></div>";
  }

  function renderPaper(withKey) {
    if (!state.paper.length) return '<p class="muted no-print">Tick chapters and press “Generate paper + answer key”.</p>';
    let n = 0;
    let html = header(withKey ? " · Answer Key" : "");
    if (!withKey) html += '<div class="instr">' + esc($("instructions").value) + "</div>";
    state.paper.forEach((part, si) => {
      const s = part.sec;
      if (!s.count) return;
      html += "<h3><span>Section " + s.name + " · " + (s.kind === "mcq" ? "Multiple choice" : "Questions") + "</span><span>" + s.count + " × " + s.marks + " = " + s.count * s.marks + "</span></h3>";
      part.slots.forEach((q, qi) => { n++; html += qHtml(q, n, withKey, si, qi); });
    });
    return html;
  }

  function renderAll() {
    $("paper").innerHTML = renderPaper(false);
    $("key").innerHTML = renderPaper(true);
    $("paper").querySelectorAll("[data-swap]").forEach((b) => b.addEventListener("click", () => {
      const [si, qi] = b.dataset.swap.split(",").map(Number); swap(si, qi);
    }));
    const missing = state.paper.reduce((s, p) => s + p.slots.filter((q) => !q).length, 0);
    const box = $("shortfall");
    box.hidden = !state.paper.length || !missing;
    if (!box.hidden) {
      const parts = state.paper.filter((p) => p.slots.some((q) => !q)).map((p) => "Section " + p.sec.name + ": " + p.slots.filter((q) => !q).length + " more " + p.sec.marks + "-mark");
      box.textContent = "Bank is short by " + missing + " question(s) — " + parts.join("; ") + ". Add questions or tick more chapters.";
    }
    renderBank();
  }

  function renderBank() {
    const all = bank();
    $("bankCount").textContent = all.length + " questions in bank (" + state.custom.length + " added by you).";
    $("bankTable").innerHTML = "<tr><th>ID</th><th>Class</th><th>Subject</th><th>Ch</th><th>Marks</th><th>Question</th><th>Answer</th><th></th></tr>" +
      all.map((q) => "<tr><td>" + esc(q.id) + "</td><td>" + q.cls + "</td><td>" + esc(q.subject) + "</td><td>" + q.chapter + "</td><td>" + q.marks +
        "</td><td>" + esc(q.text) + (q.type === "mcq" ? "<br><small>" + q.opts.map((o, i) => "(" + "abcd"[i] + ") " + esc(o)).join("  ") + "</small>" : "") +
        "</td><td>" + esc(q.answer) + "</td><td>" + (q.source === "sample" ? "" : '<button type="button" data-del="' + esc(q.id) + '">Delete</button>') + "</td></tr>").join("");
    $("bankTable").querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      state.custom = state.custom.filter((q) => q.id !== b.dataset.del); saveCustom(); renderBank();
    }));
  }

  // ---------- CSV (same columns as the planned QuestionBank Sheet tab) ----------
  const COLS = ["id", "class", "subject", "chapter", "marks", "text", "optA", "optB", "optC", "optD", "answer"];
  const csvCell = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  function exportCsv() {
    const rows = bank().map((q) => [q.id, q.cls, q.subject, q.chapter, q.marks, q.text, q.opts[0], q.opts[1], q.opts[2], q.opts[3], q.answer]);
    const csv = [COLS].concat(rows).map((r) => r.map(csvCell).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "question-bank.csv"; a.click();
  }
  function parseCsv(text) {
    const rows = []; let row = [], cell = "", q = false;
    text = text.replace(/^﻿/, "");
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim()));
  }
  function importCsv(text) {
    const rows = parseCsv(text); const head = rows.shift().map((h) => h.trim());
    let added = 0;
    rows.forEach((r) => {
      const o = {}; head.forEach((h, i) => (o[h] = (r[i] || "").trim()));
      if (!o.text || !o.answer || !Number(o.marks) || !Number(o.chapter)) return;
      addQuestion({ cls: Number(o.class), subject: o.subject || "Maths", chapter: Number(o.chapter), marks: Number(o.marks), text: o.text, answer: o.answer, opts: [o.optA, o.optB, o.optC, o.optD] });
      added++;
    });
    say("Imported " + added + " of " + rows.length + " rows. Rows missing text, answer, marks or chapter were skipped.");
  }
  function addQuestion(f) {
    const opts = (f.opts || []).map((s) => (s || "").trim());
    const isMcq = opts.length === 4 && opts.every(Boolean);
    state.custom.push({
      id: "C" + String(Date.now()).slice(-6) + state.custom.length, cls: f.cls, subject: f.subject, chapter: f.chapter, marks: f.marks,
      text: f.text.trim(), answer: f.answer.trim(), type: isMcq ? "mcq" : "written", opts: isMcq ? opts : [], source: "mine"
    });
    saveCustom();
  }

  // ---------- wiring ----------
  function selectExam() {
    const base = window.PATTERNS.find((p) => p.id === $("exam").value);
    state.pattern = JSON.parse(JSON.stringify(base));
    renderPattern();
  }
  function resetChapters() {
    const info = chapterInfo();
    state.ticked = new Set(info ? info.list.map((c) => c[0]) : []);
    state.paper = [];
    renderControls(); renderAll();
  }

  function init() {
    loadCustom();
    window.PATTERNS.forEach((p) => $("exam").add(new Option(p.name, p.id)));
    selectExam();
    $("cls").addEventListener("change", resetChapters);
    $("subject").addEventListener("change", resetChapters);
    $("exam").addEventListener("change", selectExam);
    $("generate").addEventListener("click", () => { state.seed = Math.floor(Math.random() * 1e9); generate(); });
    ["school", "session", "instructions"].forEach((id) => $(id).addEventListener("input", renderAll));
    $("hideSample").addEventListener("change", (e) => { state.hideSample = e.target.checked; renderAll(); });
    if ($("exportCsv")) $("exportCsv").addEventListener("click", exportCsv);
    $("importCsv").addEventListener("change", (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => { importCsv(t); renderAll(); e.target.value = ""; });
    });
    $("addForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(e.target);
      addQuestion({ cls: Number(d.get("cls")), subject: d.get("subject"), chapter: Number(d.get("chapter")), marks: Number(d.get("marks")),
        text: d.get("text"), answer: d.get("answer"), opts: [d.get("optA"), d.get("optB"), d.get("optC"), d.get("optD")] });
      e.target.reset(); renderAll();
    });
    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("active", x === b));
      ["paper", "key", "bank"].forEach((t) => ($("tab-" + t).hidden = t !== b.dataset.tab));
      document.body.classList.toggle("print-key", b.dataset.tab === "key");
    }));
    if ($("print")) $("print").addEventListener("click", () => window.print());
    resetChapters();
  }
  init();
})();
