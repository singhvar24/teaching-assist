(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const KEY = { all: "tpb.state.v2", custom: "tpb.custom.v1", presets: "tpb.presets.v2" };
  const ROMAN = { 6: "VI", 7: "VII", 8: "VIII" };
  const FONTS = {
    serif: '"IBM Plex Serif", Georgia, serif', times: '"Times New Roman", Times, serif',
    sans: '"IBM Plex Sans", Arial, sans-serif', arial: "Arial, Helvetica, sans-serif", georgia: "Georgia, serif"
  };
  const GAPS = { compact: 3, normal: 9, roomy: 18 };
  const PAGES = { A4: [210, 297], Letter: [215.9, 279.4], A5: [148, 210] };

  // ---------- storage ----------
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  // ---------- defaults ----------
  const defaults = () => ({
    school: "[SCHOOL NAME]", address: "", logo: "", logoPos: "left", logoH: 18,
    session: "2026-27", examTitle: "", classLabel: "", subjectLabel: "", time: "", maxMarks: "", date: "", teacher: "",
    fields: { name: true, roll: true, section: false, date: false },
    showInstructions: true, instrTitle: "General Instructions", instrNumbered: true,
    instructions: "[General instructions from the school template]",
    paper: "A4", margin: 15, font: "serif", fontSize: 12, lineHeight: 1.45, gap: "normal",
    numbering: "1.", continuous: "yes", marksPos: "right", optLayout: "2col", secStyle: "line", answerLines: 0,
    secTotals: true, secBreak: false, showEnd: true, watermark: "", footer: "", shuffleOptions: false,
    key: { title: "Answer Key", layout: "list", mcq: "full", showHeader: true, showQ: true, showMarks: true,
      showChapter: false, showSecTotals: true, showTeacher: false, note: "" }
  });
  const merge = (base, over) => {
    if (!over || typeof over !== "object") return base;
    Object.keys(base).forEach((k) => {
      if (base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) base[k] = merge(base[k], over[k]);
      else if (over[k] !== undefined) base[k] = over[k];
    });
    return base;
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const state = {
    S: defaults(), pattern: null, patternId: "half-yearly", ticked: new Set(),
    paper: [], generated: false, custom: [], hideSample: false, ed: null, tab: "paper"
  };

  // ---------- helpers ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function rng(seed) {
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
  const cls = () => Number($("cls").value);
  const subject = () => $("subject").value;
  const chapterInfo = () => window.CHAPTERS[cls() + "-" + subject()];
  const chapterName = (n) => {
    const info = chapterInfo(); const hit = info && info.list.find((c) => c[0] === n);
    return hit ? hit[1] : n ? "Ch " + n : "";
  };
  const secTitle = (s) => s.heading || "Section " + s.name + " · " + (s.kind === "mcq" ? "Multiple choice" : s.kind === "long" ? "Long answer" : "Short answer");
  const partMarks = (p) => p.slots.reduce((t, q) => t + (q ? Number(q.marks) || 0 : 0), 0);
  const totalMarks = () => state.paper.reduce((t, p) => t + partMarks(p), 0);
  const patternMarks = () => state.pattern.sections.reduce((t, s) => t + s.count * s.marks, 0);

  let statusTimer;
  function toast(msg) {
    const el = $("status"); el.textContent = msg; el.hidden = false;
    clearTimeout(statusTimer); statusTimer = setTimeout(() => (el.hidden = true), 6000);
  }

  // ---------- persistence ----------
  function persist() {
    const ok = lsSet(KEY.all, {
      S: state.S, pattern: state.pattern, patternId: state.patternId, ticked: [...state.ticked],
      sel: { cls: $("cls").value, subject: $("subject").value, exam: $("exam").value },
      paper: state.generated ? state.paper.map((p) => p.slots) : null
    });
    if (!ok && !persist.warned) { persist.warned = true; toast("Could not save on this device (storage blocked or full). Your work stays until you close the page."); }
  }

  // ---------- question bank ----------
  const bank = () => (state.hideSample ? [] : window.SAMPLE_BANK).concat(state.custom);
  const saveCustom = () => lsSet(KEY.custom, state.custom);

  function candidates(sec) {
    return bank().filter((q) =>
      q.cls === cls() && q.subject === subject() && state.ticked.has(q.chapter) &&
      Number(q.marks) === Number(sec.marks) && (sec.kind === "mcq" ? q.type === "mcq" : q.type !== "mcq"));
  }

  function shuffledOptions(q, rand) {
    const c = clone(q);
    const m = q.type === "mcq" && /^\(([a-d])\)\s*/i.exec(q.answer || "");
    if (!state.S.shuffleOptions || !m) return c;
    const right = q.opts["abcd".indexOf(m[1].toLowerCase())];
    c.opts = shuffle(q.opts, rand);
    c.answer = "(" + "abcd"[c.opts.indexOf(right)] + ") " + right;
    return c;
  }

  // Round-robin across ticked chapters so each taught chapter appears.
  function pick(sec, need, used, rand, offset) {
    const byCh = {};
    shuffle(candidates(sec).filter((q) => !used.has(q.id)), rand).forEach((q) => (byCh[q.chapter] = byCh[q.chapter] || []).push(q));
    const chs = Object.keys(byCh).map(Number).sort((a, b) => a - b);
    const out = []; let turn = chs.length ? offset % chs.length : 0;
    while (out.length < need && chs.some((c) => byCh[c].length)) {
      const c = chs[turn % chs.length]; turn++;
      if (byCh[c].length) { const q = byCh[c].shift(); used.add(q.id); out.push(shuffledOptions(q, rand)); }
    }
    return out;
  }

  function syncPaper() {
    state.paper = state.pattern.sections.map((sec) => {
      const p = state.paper.find((x) => x.sec === sec) || { sec, slots: [] };
      while (p.slots.length < sec.count) p.slots.push(null);
      p.slots.length = Math.max(0, sec.count);
      return p;
    });
  }

  function generate() {
    const rand = rng(Math.floor(Math.random() * 1e9)); const used = new Set();
    state.paper = state.pattern.sections.map((sec, i) => {
      const got = pick(sec, sec.count, used, rand, i);
      while (got.length < sec.count) got.push(null);
      return { sec, slots: got };
    });
    state.generated = true; state.ed = null; renderAll();
  }
  function fillGaps() {
    if (!state.generated) return generate();
    const rand = rng(Math.floor(Math.random() * 1e9));
    const used = new Set(state.paper.flatMap((p) => p.slots.filter(Boolean).map((q) => q.id)));
    state.paper.forEach((p, i) => {
      const empty = p.slots.filter((q) => !q).length;
      const got = pick(p.sec, empty, used, rand, i);
      p.slots = p.slots.map((q) => q || got.shift() || null);
    });
    renderAll();
  }
  function swap(si, qi) {
    const part = state.paper[si];
    const inUse = new Set(state.paper.flatMap((p) => p.slots.filter(Boolean).map((q) => q.id)));
    const cur = part.slots[qi];
    let pool = candidates(part.sec).filter((q) => !inUse.has(q.id));
    const same = cur ? pool.filter((q) => q.chapter === cur.chapter) : [];
    pool = same.length ? same : pool;
    if (!pool.length) { toast("No other unused question fits this slot. Add more questions to the bank, or use Edit to type one."); return; }
    part.slots[qi] = shuffledOptions(pool[Math.floor(Math.random() * pool.length)], Math.random);
    renderAll();
  }

  // ---------- sheet CSS (shared by screen, print and exported files) ----------
  const SHEET_CSS = `
.sheet{position:relative;background:#fff;color:#000;box-sizing:border-box;margin:0 auto;width:var(--pw);max-width:100%;padding:var(--pm);font-family:var(--pf);font-size:var(--pfs);line-height:var(--plh);overflow-wrap:anywhere}
.sheet *{box-sizing:border-box}
.sheet .hd{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px}
.sheet .hd img{height:var(--logoh);max-width:32mm;object-fit:contain}
.sheet .hd .ph{display:block;visibility:hidden}
.sheet .hd .txt{text-align:center}
.sheet .hd.top{display:block;text-align:center}
.sheet .hd.top img{display:block;margin:0 auto 4px}
.sheet h2.school{font-size:1.35em;margin:0;line-height:1.2}
.sheet .addr,.sheet .sub{text-align:center;margin:1px 0}
.sheet .ttl{text-align:center;font-weight:600;margin:3px 0}
.sheet .meta{display:flex;justify-content:space-between;gap:12px;border-bottom:1.5px solid #000;padding:4px 0 6px;margin:6px 0 8px}
.sheet .stu{display:flex;gap:14px;margin:8px 0 4px}
.sheet .stu span{flex:1;display:flex;gap:4px;align-items:flex-end;white-space:nowrap}
.sheet .stu i{flex:1;border-bottom:1px solid #000;min-width:24px;height:1.2em}
.sheet .instr{margin:8px 0 6px;font-size:.92em}
.sheet .instr b{display:block;margin-bottom:2px}
.sheet .instr ol,.sheet .instr ul{margin:0;padding-left:1.4em}
.sheet .instr p{margin:0}
.sheet .sec h3{font-size:1em;margin:14px 0 4px;display:flex;justify-content:space-between;gap:10px}
.sheet .sec h3.line{border-bottom:1px solid #000;padding-bottom:2px}
.sheet .sec h3.box{border:1px solid #000;background:#eee;padding:3px 8px}
.sheet .sec h3.plain{justify-content:center}
.sheet .secnote{font-style:italic;margin:0 0 4px;font-size:.92em}
.sheet .sec.brk{break-before:page;page-break-before:always}
.sheet .q{display:grid;grid-template-columns:2.6em 1fr auto;gap:2px 4px;margin:var(--qgap) 0;break-inside:avoid}
.sheet .q.nm{grid-template-columns:2.6em 1fr}
.sheet .q .mk{font-size:.9em;white-space:nowrap}
.sheet .q .in{font-size:.88em;white-space:nowrap}
.sheet .q.missing .qt{font-style:italic;color:#9a3412}
.sheet .opts{display:grid;gap:1px 18px;margin-top:2px}
.sheet .opts.c2{grid-template-columns:1fr 1fr}
.sheet .opts.c1{grid-template-columns:1fr}
.sheet .opts.ci{display:flex;flex-wrap:wrap;gap:2px 22px}
.sheet .ln{height:1.9em;border-bottom:1px dotted #555}
.sheet .tools{grid-column:2 / -1;display:flex;gap:4px;flex-wrap:wrap;align-items:center;font-family:system-ui,sans-serif}
.sheet .tools button,.sheet .addq{font:12px system-ui,sans-serif;min-height:26px;padding:0 8px;border:1px solid #bbb;background:#fafafa;color:#000;border-radius:6px;cursor:pointer}
.sheet .tools .tag{font-size:11px;color:#666}
.sheet .addq{margin-top:4px}
.sheet .end{text-align:center;margin-top:18px;font-weight:600}
.sheet .ans{color:#0b3d66}
.sheet .nt{margin-top:14px;font-size:.92em;white-space:pre-wrap}
.sheet table.kt{width:100%;border-collapse:collapse;font-size:.95em;margin-top:4px}
.sheet table.kt th,.sheet table.kt td{border:1px solid #000;padding:3px 6px;text-align:left;vertical-align:top}
.sheet table.kt th{background:#eee;white-space:nowrap}
.sheet .wm{position:absolute;left:0;right:0;top:38%;text-align:center;font-size:90pt;font-weight:700;color:#000;opacity:.06;transform:rotate(-30deg);pointer-events:none;z-index:0;letter-spacing:4px}
.sheet .ft{margin-top:20px;text-align:center;font-size:.85em;color:#444;border-top:1px solid #999;padding-top:4px}
.sheet .sec,.sheet .q,.sheet .hd,.sheet .meta{position:relative;z-index:1}
@media print{
  .sheet{width:auto;padding:0;margin:0;box-shadow:none;border:0}
  .sheet .wm{position:fixed;top:40%}
  .sheet .ft{position:fixed;bottom:0;left:0;right:0;background:#fff}
  .sheet .tools,.sheet .addq{display:none!important}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
@media screen{.sheet{border:1px solid #c8c8c8;box-shadow:0 1px 6px rgba(0,0,0,.12);margin-bottom:24px}}
`;

  function dynCss() {
    const S = state.S, pg = PAGES[S.paper] || PAGES.A4;
    return ".sheet{--pw:" + pg[0] + "mm;--pm:" + S.margin + "mm;--pf:" + (FONTS[S.font] || FONTS.serif) + ";--pfs:" + S.fontSize + "pt;--plh:" + S.lineHeight +
      ";--qgap:" + (GAPS[S.gap] || 9) + "px;--logoh:" + S.logoH + "mm}\n@page{size:" + pg[0] + "mm " + pg[1] + "mm;margin:" + S.margin + "mm}";
  }

  // ---------- sheet HTML ----------
  function headerHtml(suffix) {
    const S = state.S, p = state.pattern;
    const marks = S.maxMarks || totalMarks() || patternMarks();
    const time = S.time || p.time;
    const logo = S.logo ? '<img src="' + esc(S.logo) + '" alt="School logo">' : "";
    const ph = S.logo ? '<img class="ph" src="' + esc(S.logo) + '" alt="">' : "<span></span>";
    const txt = '<div class="txt"><h2 class="school">' + esc(S.school) + "</h2>" + (S.address ? '<div class="addr">' + esc(S.address) + "</div>" : "") + "</div>";
    let head;
    if (S.logoPos === "center" && S.logo) head = '<div class="hd top">' + logo + txt + "</div>";
    else if (S.logoPos === "right") head = '<div class="hd">' + ph + txt + logo + "</div>";
    else head = '<div class="hd">' + (S.logo ? logo : "<span></span>") + txt + ph + "</div>";
    const title = (S.examTitle || p.name + " Examination") + (suffix ? " · " + suffix : "");
    const clsL = S.classLabel || "Class " + ROMAN[cls()];
    const stu = [["name", "Name"], ["roll", "Roll No."], ["section", "Class / Section"], ["date", "Date"]]
      .filter((f) => S.fields[f[0]]).map((f) => "<span>" + f[1] + ": <i></i></span>").join("");
    return head + (S.session ? '<div class="sub">Session ' + esc(S.session) + "</div>" : "") +
      '<div class="ttl">' + esc(title) + "</div>" +
      '<div class="sub"><strong>' + esc(clsL) + " · " + esc(S.subjectLabel || subject()) + "</strong></div>" +
      '<div class="meta"><span>' + (time ? "Time: " + esc(time) : "") + "</span><span>" + (S.date ? esc(S.date) : "") + "</span><span>Max. Marks: " + esc(marks) + "</span></div>" +
      (suffix ? "" : stu ? '<div class="stu">' + stu + "</div>" : "");
  }

  function numLabel(n) {
    const f = state.S.numbering;
    return f === "Q1." ? "Q" + n + "." : f === "(1)" ? "(" + n + ")" : f === "Q.1" ? "Q." + n : n + ".";
  }
  const optLetter = (i) => "abcd"[i];

  function qHtml(q, num, si, qi, tools) {
    const S = state.S, sec = state.paper[si].sec;
    if (!q) {
      return '<div class="q missing nm"><span>' + numLabel(num) + '</span><span class="qt">[Empty slot: ' + sec.marks + "-mark " + (sec.kind === "mcq" ? "MCQ" : "question") + ". Fill it, edit it, or add questions to the bank.]</span>" +
        (tools ? '<div class="tools"><button type="button" data-act="edit" data-si="' + si + '" data-qi="' + qi + '">Type a question</button><button type="button" data-act="swap" data-si="' + si + '" data-qi="' + qi + '">Pick from bank</button><button type="button" data-act="rm" data-si="' + si + '" data-qi="' + qi + '">Remove slot</button></div>' : "") + "</div>";
    }
    const cls2 = S.optLayout === "1col" ? "c1" : S.optLayout === "inline" ? "ci" : "c2";
    const opts = q.type === "mcq" ? '<div class="opts ' + cls2 + '">' + q.opts.map((o, i) => "<span>(" + optLetter(i) + ") " + esc(o) + "</span>").join("") + "</div>" : "";
    const lines = q.type !== "mcq" && S.answerLines > 0 ? Array(Math.round(S.answerLines * q.marks)).fill('<div class="ln"></div>').join("") : "";
    const inl = S.marksPos === "inline" ? ' <span class="in">[' + esc(q.marks) + "]</span>" : "";
    const right = S.marksPos === "right" ? '<span class="mk">[' + esc(q.marks) + "]</span>" : "";
    const t = tools ? '<div class="tools"><button type="button" data-act="edit" data-si="' + si + '" data-qi="' + qi + '">Edit</button>' +
      '<button type="button" data-act="swap" data-si="' + si + '" data-qi="' + qi + '">Replace</button>' +
      '<button type="button" data-act="up" data-si="' + si + '" data-qi="' + qi + '" aria-label="Move up">↑</button>' +
      '<button type="button" data-act="down" data-si="' + si + '" data-qi="' + qi + '" aria-label="Move down">↓</button>' +
      '<button type="button" data-act="rm" data-si="' + si + '" data-qi="' + qi + '">Remove</button><span class="tag">' + esc(chapterName(q.chapter)) + "</span></div>" : "";
    return '<div class="q' + (right ? "" : " nm") + '"><span>' + esc(numLabel(num)) + '</span><div><div class="qt">' + esc(q.text) + inl + "</div>" + opts + lines + "</div>" + right + t + "</div>";
  }

  function paperHtml(tools) {
    const S = state.S;
    if (!state.generated) return '<p style="font-family:system-ui,sans-serif;color:#555">Tick chapters, set the sections, then press “Generate paper + answer key”.</p>';
    let n = 0, html = '<div class="wmwrap">' + (S.watermark ? '<div class="wm">' + esc(S.watermark) + "</div>" : "") + "</div>" + headerHtml("");
    if (S.showInstructions && S.instructions.trim()) {
      const lines = S.instructions.split("\n").map((l) => l.trim()).filter(Boolean);
      html += '<div class="instr"><b>' + esc(S.instrTitle) + "</b>" + (S.instrNumbered ? "<ol>" : "<ul style='list-style:none;padding-left:0'>") +
        lines.map((l) => "<li>" + esc(l) + "</li>").join("") + (S.instrNumbered ? "</ol>" : "</ul>") + "</div>";
    }
    state.paper.forEach((part, si) => {
      const s = part.sec; if (!part.slots.length && !tools) return;
      if (S.continuous !== "yes") n = 0;
      const same = part.slots.every((q) => q && Number(q.marks) === Number(part.slots[0].marks));
      const tot = partMarks(part);
      const right = S.secTotals ? (same && part.slots.length ? part.slots.length + " × " + part.slots[0].marks + " = " + tot : tot ? "Total: " + tot : "") : "";
      html += '<div class="sec' + (S.secBreak && si > 0 ? " brk" : "") + '"><h3 class="' + S.secStyle + '"><span>' + esc(secTitle(s)) + "</span><span>" + esc(right) + "</span></h3>" +
        (s.instruction ? '<p class="secnote">' + esc(s.instruction) + "</p>" : "");
      part.slots.forEach((q, qi) => { n++; html += qHtml(q, n, si, qi, tools); });
      if (tools) html += '<button type="button" class="addq" data-act="add" data-si="' + si + '">+ Add a question to Section ' + esc(s.name) + "</button>";
      html += "</div>";
    });
    if (S.showEnd) html += '<div class="end">— End of paper —</div>';
    if (S.footer) html += '<div class="ft">' + esc(S.footer) + "</div>";
    return html;
  }

  function mcqAns(q) {
    const a = q.answer || "";
    if (q.type === "mcq" && state.S.key.mcq === "letter") { const m = /^\(?([a-d])\)?/i.exec(a); if (m) return "(" + m[1].toLowerCase() + ")"; }
    return a;
  }

  function keyHtml() {
    const S = state.S, K = S.key;
    if (!state.generated) return '<p style="font-family:system-ui,sans-serif;color:#555">The answer key appears here after you generate the paper.</p>';
    let html = (S.watermark ? '<div class="wm">' + esc(S.watermark) + "</div>" : "");
    html += K.showHeader ? headerHtml(K.title) : '<div class="ttl">' + esc(K.title) + "</div>";
    let n = 0;
    state.paper.forEach((part) => {
      const s = part.sec; if (!part.slots.length) return;
      if (S.continuous !== "yes") n = 0;
      const right = K.showSecTotals ? "Total: " + partMarks(part) : "";
      html += '<div class="sec"><h3 class="' + S.secStyle + '"><span>' + esc(secTitle(s)) + "</span><span>" + esc(right) + "</span></h3>";
      if (K.layout === "table") {
        html += '<table class="kt"><tr><th>No.</th>' + (K.showQ ? "<th>Question</th>" : "") + "<th>Answer</th>" + (K.showMarks ? "<th>Marks</th>" : "") + (K.showChapter ? "<th>Chapter</th>" : "") + "</tr>";
        part.slots.forEach((q) => { n++; html += "<tr><td>" + esc(numLabel(n)) + "</td>" + (K.showQ ? "<td>" + esc(q ? q.text : "") + "</td>" : "") + "<td>" + (q ? esc(mcqAns(q)) : "—") + "</td>" + (K.showMarks ? "<td>" + (q ? esc(q.marks) : "") + "</td>" : "") + (K.showChapter ? "<td>" + (q ? esc(chapterName(q.chapter)) : "") + "</td>" : "") + "</tr>"; });
        html += "</table>";
      } else {
        part.slots.forEach((q) => {
          n++;
          html += '<div class="q' + (K.showMarks ? "" : " nm") + '"><span>' + esc(numLabel(n)) + "</span><div>" +
            (q ? (K.showQ ? '<div class="qt">' + esc(q.text) + "</div>" : "") + '<div class="ans"><strong>Ans:</strong> ' + esc(mcqAns(q)) + "</div>" +
              (K.showChapter ? '<div style="font-size:.8em;color:#555">' + esc(chapterName(q.chapter)) + "</div>" : "") : '<div class="qt">—</div>') +
            "</div>" + (K.showMarks ? '<span class="mk">[' + (q ? esc(q.marks) : "") + "]</span>" : "") + "</div>";
        });
      }
      html += "</div>";
    });
    if (K.note.trim()) html += '<div class="nt">' + esc(K.note) + "</div>";
    if (K.showTeacher && S.teacher) html += '<div class="nt">Prepared by: ' + esc(S.teacher) + "</div>";
    if (S.footer) html += '<div class="ft">' + esc(S.footer) + "</div>";
    return html;
  }

  // ---------- editor for a single question ----------
  function renderEditor() {
    const box = $("editor"); const ed = state.ed;
    if (!ed) { box.innerHTML = ""; return; }
    const q = state.paper[ed.si].slots[ed.qi] || { text: "", opts: ["", "", "", ""], answer: "", marks: state.paper[ed.si].sec.marks, type: "written", chapter: null };
    const o = q.opts.length ? q.opts : ["", "", "", ""];
    box.innerHTML = '<form class="editor" id="edForm"><h2>' + (ed.isNew ? "New question" : "Edit question") + " · Section " + esc(state.paper[ed.si].sec.name) + "</h2>" +
      '<label>Question text<textarea id="ed-text" rows="3" required>' + esc(q.text) + "</textarea></label>" +
      '<div class="row4">' + o.map((v, i) => "<label>Option (" + optLetter(i) + ')<input id="ed-o' + i + '" value="' + esc(v) + '"></label>').join("") + "</div>" +
      '<p class="note">Fill all four options for an MCQ; leave them empty for a written question.</p>' +
      '<div class="row2"><label>Answer<input id="ed-ans" value="' + esc(q.answer) + '"></label><label>Marks<input id="ed-marks" type="number" min="0" step="0.5" value="' + esc(q.marks) + '"></label></div>' +
      '<div class="actions"><button class="primary" type="submit">Apply to this paper</button><button type="button" id="edBank">Apply and save to my bank</button><button type="button" id="edCancel">Cancel</button></div>' +
      '<p class="note">Edits change only this paper. Save to the bank to reuse the question.</p></form>';
    const read = () => {
      const opts = [0, 1, 2, 3].map((i) => $("ed-o" + i).value.trim()); const mcq = opts.every(Boolean);
      return { id: q.id || "N" + Date.now().toString(36), cls: cls(), subject: subject(), chapter: q.chapter, marks: Number($("ed-marks").value) || 0, text: $("ed-text").value.trim(),
        answer: $("ed-ans").value.trim(), type: mcq ? "mcq" : "written", opts: mcq ? opts : [], source: "mine" };
    };
    $("edForm").addEventListener("submit", (e) => { e.preventDefault(); state.paper[ed.si].slots[ed.qi] = read(); state.ed = null; renderAll(); });
    $("edBank").addEventListener("click", () => {
      if (!$("ed-text").value.trim()) return; const nq = read();
      if (!nq.chapter) { toast("Give this question a chapter number in the Question bank tab to save it there. Applied to the paper only."); state.paper[ed.si].slots[ed.qi] = nq; state.ed = null; renderAll(); return; }
      state.custom.push(Object.assign({}, nq, { id: "C" + Date.now().toString(36) })); saveCustom();
      state.paper[ed.si].slots[ed.qi] = nq; state.ed = null; toast("Saved to your question bank."); renderAll();
    });
    $("edCancel").addEventListener("click", () => {
      if (ed.isNew) { const p = state.paper[ed.si]; p.slots.splice(ed.qi, 1); p.sec.count = p.slots.length; }
      state.ed = null; renderAll();
    });
    $("ed-text").focus(); box.scrollIntoView({ block: "nearest" });
  }

  function onSheetClick(e) {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const si = Number(b.dataset.si), qi = Number(b.dataset.qi), part = state.paper[si], act = b.dataset.act;
    if (act === "swap") swap(si, qi);
    else if (act === "edit") { state.ed = { si, qi, isNew: false }; renderAll(); }
    else if (act === "add") { part.slots.push(null); part.sec.count = part.slots.length; state.ed = { si, qi: part.slots.length - 1, isNew: true }; renderAll(); }
    else if (act === "rm") { part.slots.splice(qi, 1); part.sec.count = part.slots.length; renderAll(); }
    else if (act === "up" && qi > 0) { [part.slots[qi - 1], part.slots[qi]] = [part.slots[qi], part.slots[qi - 1]]; renderAll(); }
    else if (act === "down" && qi < part.slots.length - 1) { [part.slots[qi + 1], part.slots[qi]] = [part.slots[qi], part.slots[qi + 1]]; renderAll(); }
  }

  // ---------- panel rendering ----------
  function renderChapters() {
    const info = chapterInfo(), box = $("chapters"); box.innerHTML = "";
    if (!info) { $("chapterNote").textContent = "Chapter list for Class " + cls() + " " + subject() + " is not available yet. Needed from the teacher (see CLAUDE.md, 'Still needed from her')."; return; }
    $("chapterNote").textContent = info.book + (info.confirmed ? "" : " · class assumed from the second contents page (to confirm)") + ". Ticking will come from the diary later.";
    info.list.forEach(([n, name]) => {
      const l = document.createElement("label"); l.className = "inline";
      l.innerHTML = '<input type="checkbox" value="' + n + '"' + (state.ticked.has(n) ? " checked" : "") + "> " + n + " · " + esc(name);
      l.firstChild.addEventListener("change", (e) => { e.target.checked ? state.ticked.add(n) : state.ticked.delete(n); persist(); });
      box.appendChild(l);
    });
  }

  function renderPattern() {
    const p = state.pattern;
    $("patternNote").textContent = (p.confirmed ? "" : "Placeholder · ") + p.note;
    $("pattern").innerHTML = p.sections.map((s, i) =>
      '<div class="secard" data-i="' + i + '"><div class="r1">' +
      '<label>Name<input data-f="name" value="' + esc(s.name) + '" maxlength="6"></label>' +
      '<label>Type<select data-f="kind"><option value="mcq"' + (s.kind === "mcq" ? " selected" : "") + '>MCQ</option><option value="short"' + (s.kind === "short" ? " selected" : "") + '>Short answer</option><option value="long"' + (s.kind === "long" ? " selected" : "") + ">Long answer</option></select></label>" +
      '<label>Qs<input type="number" data-f="count" min="0" max="60" value="' + s.count + '"></label>' +
      '<label>Marks<input type="number" data-f="marks" min="0.5" step="0.5" value="' + s.marks + '"></label>' +
      '<button type="button" class="x" data-rm="' + i + '" aria-label="Remove section ' + esc(s.name) + '">✕</button></div>' +
      '<label>Heading on the paper (blank = automatic)<input data-f="heading" value="' + esc(s.heading || "") + '" placeholder="' + esc(secTitle(Object.assign({}, s, { heading: "" }))) + '"></label>' +
      '<label>Instruction under heading<input data-f="instruction" value="' + esc(s.instruction || "") + '" placeholder="e.g. Answer any 5 questions."></label></div>').join("");
    $("patternTotal").textContent = p.sections.reduce((t, s) => t + s.count, 0) + " questions · " + patternMarks() + " marks in the pattern";
  }

  function onPatternInput(e) {
    const card = e.target.closest("[data-i]"); if (!card || !e.target.dataset.f) return;
    const s = state.pattern.sections[Number(card.dataset.i)], f = e.target.dataset.f; let v = e.target.value;
    if (f === "count") v = Math.max(0, Math.min(60, parseInt(v, 10) || 0));
    else if (f === "marks") v = Math.max(0.5, Number(v) || 1);
    s[f] = v;
    const structural = f === "count" || f === "marks" || f === "kind";
    if (structural) { syncPaper(); }
    if (e.type === "change") { renderPattern(); renderAll(); } else { $("patternTotal").textContent = state.pattern.sections.reduce((t, x) => t + x.count, 0) + " questions · " + patternMarks() + " marks in the pattern"; if (!structural) { renderSheets(); persist(); } }
  }

  function renderSheets() {
    $("paper").innerHTML = paperHtml(true);
    $("key").innerHTML = keyHtml();
    $("dyn").textContent = dynCss();
    renderEditor();
  }

  function renderAll() {
    syncPaper();
    if (!$("pattern").contains(document.activeElement)) renderPattern();
    renderSheets();
    const missing = state.generated ? state.paper.reduce((s, p) => s + p.slots.filter((q) => !q).length, 0) : 0;
    const box = $("shortfall"); box.hidden = !missing;
    if (missing) {
      const parts = state.paper.filter((p) => p.slots.some((q) => !q)).map((p) => "Section " + p.sec.name + ": " + p.slots.filter((q) => !q).length + " × " + p.sec.marks + "-mark");
      box.textContent = "Empty slots: " + parts.join("; ") + ". Type them in, add to the bank, or tick more chapters.";
    }
    renderBank(); persist();
  }

  // ---------- bank tab ----------
  function renderBank() {
    const all = bank();
    $("bankCount").textContent = all.length + " questions in bank (" + state.custom.length + " added by you).";
    $("bankTable").innerHTML = "<tr><th>ID</th><th>Class</th><th>Subject</th><th>Ch</th><th>Marks</th><th>Question</th><th>Answer</th><th></th></tr>" +
      all.map((q) => "<tr><td>" + esc(q.id) + "</td><td>" + q.cls + "</td><td>" + esc(q.subject) + "</td><td>" + q.chapter + "</td><td>" + q.marks +
        "</td><td>" + esc(q.text) + (q.type === "mcq" ? "<br><small>" + q.opts.map((o, i) => "(" + optLetter(i) + ") " + esc(o)).join("  ") + "</small>" : "") +
        "</td><td>" + esc(q.answer) + "</td><td>" + (q.source === "sample" ? "" : '<button type="button" data-del="' + esc(q.id) + '">Delete</button>') + "</td></tr>").join("");
  }
  const COLS = ["id", "class", "subject", "chapter", "marks", "text", "optA", "optB", "optC", "optD", "answer"];
  const csvCell = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  function parseCsv(text) {
    const rows = []; let row = [], cell = "", q = false; text = text.replace(/^﻿/, "");
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
  function addQuestion(f) {
    const opts = (f.opts || []).map((s) => (s || "").trim()); const isMcq = opts.length === 4 && opts.every(Boolean);
    state.custom.push({ id: "C" + Date.now().toString(36) + state.custom.length, cls: f.cls, subject: f.subject, chapter: f.chapter, marks: f.marks,
      text: f.text.trim(), answer: f.answer.trim(), type: isMcq ? "mcq" : "written", opts: isMcq ? opts : [], source: "mine" });
    saveCustom();
  }

  // ---------- files (works locally and inside the published page) ----------
  let downloadsCap = null;
  async function saveFile(filename, mime, text) {
    if (downloadsCap) {
      try { await downloadsCap.save({ filename, data: text }); toast("Saved " + filename); } catch (e) { if (!e || e.code !== "declined") toast("Could not save the file here."); }
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: mime + ";charset=utf-8" }));
    a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  }
  function exportSheet() {
    const key = state.tab === "key", html = key ? keyHtml() : paperHtml(false);
    const name = (state.S.subjectLabel || subject()) + "-class" + cls() + "-" + (key ? "answer-key" : "question-paper") + ".html";
    const doc = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(name) + "</title>" +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Serif:wght@400;600&display=swap"><style>body{margin:0;background:#e9e9e6}' +
      ".bar{font:14px system-ui,sans-serif;padding:10px 16px;background:#1F5F8B;color:#fff;display:flex;gap:12px;align-items:center}.bar button{font:inherit;padding:6px 14px;border-radius:6px;border:0;cursor:pointer}" +
      "@media print{.bar{display:none}body{background:#fff}}" + SHEET_CSS + dynCss() + '</style></head><body><div class="bar"><button onclick="window.print()">Print</button><span>Use Print, then choose “Save as PDF” if you want a PDF.</span></div><div class="sheet" style="margin-top:16px">' + html + "</div></body></html>";
    saveFile(name, "text/html", doc);
  }
  function doPrint() {
    if (downloadsCap || window.claude) { toast("Printing is blocked inside this page. Use “Save as file (.html)”, open it, then press Print."); return; }
    window.print();
  }

  // ---------- settings binding ----------
  function getPath(o, path) { return path.split(".").reduce((a, k) => (a ? a[k] : undefined), o); }
  function setPath(o, path, v) { const ks = path.split("."); const last = ks.pop(); ks.reduce((a, k) => a[k], o)[last] = v; }
  function syncInputs() {
    document.querySelectorAll("[data-s]").forEach((el) => {
      const v = getPath(state.S, el.dataset.s);
      if (el.type === "checkbox") el.checked = !!v; else el.value = v ?? "";
    });
  }
  function bindSettings() {
    document.querySelectorAll("[data-s]").forEach((el) => el.addEventListener("input", () => {
      let v = el.type === "checkbox" ? el.checked : el.type === "number" ? Number(el.value) : el.value;
      if (el.type === "number" && (el.value === "" || isNaN(v))) return;
      setPath(state.S, el.dataset.s, v);
      if (el.dataset.s === "answerLines" || el.dataset.s === "shuffleOptions") { /* affects render only / next fill */ }
      renderSheets(); persist();
    }));
  }

  // ---------- presets ----------
  const presets = () => lsGet(KEY.presets, {});
  function renderPresets() {
    const p = presets(), names = Object.keys(p);
    $("presetList").innerHTML = names.length ? names.map((n) => "<option>" + esc(n) + "</option>").join("") : "<option value=''>(none saved)</option>";
  }
  function applySnapshot(snap) {
    state.S = merge(defaults(), snap.S); state.pattern = clone(snap.pattern); state.patternId = snap.patternId || "custom";
    if (![...$("exam").options].some((o) => o.value === state.patternId)) state.patternId = "custom";
    $("exam").value = state.patternId; state.paper = []; state.generated = false; state.ed = null;
    syncInputs(); renderPattern(); renderAll();
  }

  // ---------- init ----------
  function selectExam() {
    const base = window.PATTERNS.find((p) => p.id === $("exam").value);
    state.patternId = base.id; state.pattern = clone(base);
    state.paper = []; state.generated = false; state.ed = null;
    renderPattern(); renderAll();
  }
  function resetChapters() {
    const info = chapterInfo();
    state.ticked = new Set(info ? info.list.map((c) => c[0]) : []);
    state.paper = []; state.generated = false; state.ed = null;
    renderChapters(); renderAll();
  }

  function init() {
    state.custom = lsGet(KEY.custom, []);
    window.PATTERNS.forEach((p) => $("exam").add(new Option(p.name, p.id)));
    const saved = lsGet(KEY.all, null);
    if (saved && saved.sel) { $("cls").value = saved.sel.cls; $("subject").value = saved.sel.subject; $("exam").value = saved.sel.exam; }
    const base = window.PATTERNS.find((p) => p.id === $("exam").value) || window.PATTERNS[0];
    state.patternId = base.id; state.pattern = clone(saved && saved.pattern ? saved.pattern : base);
    state.S = merge(defaults(), saved && saved.S);
    const info = chapterInfo();
    state.ticked = new Set(saved && saved.ticked ? saved.ticked : info ? info.list.map((c) => c[0]) : []);
    if (saved && saved.paper) { state.paper = saved.paper.map((slots, i) => ({ sec: state.pattern.sections[i], slots })).filter((p) => p.sec); state.generated = state.paper.length > 0; }

    const st = document.createElement("style"); st.id = "dyn"; document.head.appendChild(st);
    const sc = document.createElement("style"); sc.textContent = SHEET_CSS; document.head.appendChild(sc);

    syncInputs(); bindSettings(); renderChapters(); renderPattern(); renderPresets(); renderAll();

    $("cls").addEventListener("change", resetChapters);
    $("subject").addEventListener("change", resetChapters);
    $("exam").addEventListener("change", selectExam);
    $("pattern").addEventListener("input", onPatternInput);
    $("pattern").addEventListener("change", onPatternInput);
    $("pattern").addEventListener("click", (e) => {
      const b = e.target.closest("[data-rm]"); if (!b) return;
      state.pattern.sections.splice(Number(b.dataset.rm), 1); renderPattern(); renderAll();
    });
    $("addSection").addEventListener("click", () => {
      const used = new Set(state.pattern.sections.map((s) => s.name));
      const name = "ABCDEFGHIJKLMNOP".split("").find((c) => !used.has(c)) || "X";
      state.pattern.sections.push({ name, kind: "short", count: 3, marks: 2, heading: "", instruction: "" });
      renderPattern(); renderAll();
    });
    $("generate").addEventListener("click", generate);
    $("fillGaps").addEventListener("click", fillGaps);
    $("paper").addEventListener("click", onSheetClick);

    $("logoFile").addEventListener("change", (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 1.5e6) { toast("Logo is over 1.5 MB. Use a smaller image."); return; }
      const r = new FileReader();
      r.onload = () => { state.S.logo = r.result; renderSheets(); persist(); toast("Logo added."); };
      r.readAsDataURL(f); e.target.value = "";
    });
    $("logoClear").addEventListener("click", () => { state.S.logo = ""; renderSheets(); persist(); });

    $("presetSave").addEventListener("click", () => {
      const n = $("presetName").value.trim(); if (!n) { toast("Type a name first."); return; }
      const p = presets(); p[n] = { S: state.S, pattern: state.pattern, patternId: state.patternId }; lsSet(KEY.presets, p);
      renderPresets(); $("presetList").value = n; toast("Saved settings as “" + n + "”.");
    });
    $("presetLoad").addEventListener("click", () => { const p = presets()[$("presetList").value]; if (p) { applySnapshot(p); toast("Loaded."); } });
    $("presetDelete").addEventListener("click", () => { const p = presets(); const n = $("presetList").value; if (n in p) { delete p[n]; lsSet(KEY.presets, p); renderPresets(); toast("Deleted “" + n + "”."); } });
    $("settingsExport").addEventListener("click", () => saveFile("paper-settings.json", "application/json", JSON.stringify({ S: state.S, pattern: state.pattern, patternId: state.patternId }, null, 2)));
    $("settingsImport").addEventListener("change", (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => { try { const s = JSON.parse(t); if (!s.pattern || !s.S) throw 0; applySnapshot(s); toast("Settings imported."); } catch (x) { toast("That file is not a settings file from this tool."); } e.target.value = ""; });
    });
    $("resetAll").addEventListener("click", () => { state.S = defaults(); syncInputs(); renderAll(); toast("Layout reset to defaults."); });

    $("hideSample").addEventListener("change", (e) => { state.hideSample = e.target.checked; renderBank(); });
    $("bankTable").addEventListener("click", (e) => { const b = e.target.closest("[data-del]"); if (!b) return; state.custom = state.custom.filter((q) => q.id !== b.dataset.del); saveCustom(); renderBank(); });
    $("exportCsv").addEventListener("click", () => {
      const rows = bank().map((q) => [q.id, q.cls, q.subject, q.chapter, q.marks, q.text, q.opts[0], q.opts[1], q.opts[2], q.opts[3], q.answer]);
      saveFile("question-bank.csv", "text/csv", [COLS].concat(rows).map((r) => r.map(csvCell).join(",")).join("\r\n"));
    });
    $("importCsv").addEventListener("change", (e) => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then((t) => {
        const rows = parseCsv(t); const head = rows.shift().map((h) => h.trim()); let added = 0;
        rows.forEach((r) => {
          const o = {}; head.forEach((h, i) => (o[h] = (r[i] || "").trim()));
          if (!o.text || !o.answer || !Number(o.marks) || !Number(o.chapter)) return;
          addQuestion({ cls: Number(o.class), subject: o.subject || "Maths", chapter: Number(o.chapter), marks: Number(o.marks), text: o.text, answer: o.answer, opts: [o.optA, o.optB, o.optC, o.optD] }); added++;
        });
        toast("Imported " + added + " of " + rows.length + " rows. Rows missing text, answer, marks or chapter were skipped."); e.target.value = ""; renderBank();
      });
    });
    $("addForm").addEventListener("submit", (e) => {
      e.preventDefault(); const d = new FormData(e.target);
      addQuestion({ cls: Number(d.get("cls")), subject: d.get("subject"), chapter: Number(d.get("chapter")), marks: Number(d.get("marks")), text: d.get("text"), answer: d.get("answer"), opts: [d.get("optA"), d.get("optB"), d.get("optC"), d.get("optD")] });
      e.target.reset(); renderBank(); toast("Question added to your bank.");
    });

    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
      state.tab = b.dataset.tab;
      document.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("active", x === b));
      ["paper", "key", "bank"].forEach((t) => ($("tab-" + t).hidden = t !== state.tab));
      document.body.classList.toggle("print-key", state.tab === "key");
      $("saveHtml").hidden = $("print").hidden = state.tab === "bank";
    }));
    $("print").addEventListener("click", doPrint);
    $("saveHtml").addEventListener("click", exportSheet);

    // Published page: the downloads capability replaces the blocked print dialog.
    if (window.claude && typeof window.claude.use === "function") {
      window.claude.use("downloads").then((d) => { downloadsCap = d; if (d) $("print").hidden = true; }).catch(() => {});
    }
  }
  init();
})();
