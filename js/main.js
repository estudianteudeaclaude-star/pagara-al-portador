/* Pagará al portador — interacciones del sitio */
"use strict";
(function(){
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const MOBILE = () => matchMedia("(max-width: 900px)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = n => n.toLocaleString("es-CO", {maximumFractionDigits: 0});
const HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);
if (REDUCED) document.documentElement.classList.add("reduced");

const CHAPTERS = [
  {id:"caja", no:"I", t:"La caja", img:"b02_front", tint:"#15111b"},
  {id:"valor", no:"II", t:"Cuánto valía", img:"b05_front", tint:"#16130f"},
  {id:"desgaste", no:"III", t:"El desgaste", img:"b04_front", tint:"#17110e"},
  {id:"bogota", no:"IV", t:"Puro Bogotá", img:"b05_back", tint:"#0f121a"},
  {id:"granada", no:"V", t:"Granada", img:"b04_back", tint:"#0f1512"},
  {id:"preguntas", no:"VI", t:"Preguntas a la fuente", img:"b08_front", tint:"#141017"},
  {id:"memoria", no:"VII", t:"Memoria e historia", img:"b10_front", tint:"#121017"}
];
function hoursTxt(h){
  if (h >= 8) return `${(h/8).toLocaleString("es-CO",{maximumFractionDigits:1})} días de trabajo (${h.toLocaleString("es-CO",{maximumFractionDigits:1})} horas)`;
  if (h >= 1) return `${h.toLocaleString("es-CO",{maximumFractionDigits:1})} horas de trabajo`;
  return `${Math.round(h*60)} minutos de trabajo`;
}
const byId = id => BILLS.find(b => b.id === id);

/* ================= GRANO ================= */
(function(){
  const c = document.createElement("canvas"); c.width = c.height = 220;
  const x = c.getContext("2d"), d = x.createImageData(220, 220);
  for (let i = 0; i < d.data.length; i += 4){ const v = Math.random() * 255; d.data[i] = d.data[i+1] = d.data[i+2] = v; d.data[i+3] = 255; }
  x.putImageData(d, 0, 0); $("#grain").style.backgroundImage = `url(${c.toDataURL()})`;
})();

/* ================= GUILLOCHÉ (función común) ================= */
function rosette(ctx, cx, cy, R, t, alpha, frac = 1){
  const sets = [[R, .17, 13, 7, `rgba(214,180,107,${.32*alpha})`], [R*.78, .21, 17, 5, `rgba(169,143,212,${.3*alpha})`], [R*.55, .26, 11, 9, `rgba(224,90,66,${.26*alpha})`]];
  sets.forEach(([r, a, n, m, col], si) => {
    ctx.strokeStyle = col; ctx.lineWidth = .8;
    for (let k = 0; k < 18; k++){
      ctx.beginPath();
      const ph = k / 18 * Math.PI * 2 + t * (si % 2 ? -1 : 1) * .15, steps = Math.floor(720 * frac);
      for (let i = 0; i <= steps; i++){
        const th = i / 720 * Math.PI * 2, rr = r * (1 - a + a * Math.cos(n * th + ph)) * (1 + .03 * Math.sin(m * th - ph));
        const px = cx + rr * Math.cos(th), py = cy + rr * Math.sin(th); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
  });
}

/* ================= CARGADOR ================= */
const loaderDone = new Promise(resolve => {
  const L = $("#loader"); if (!L){ resolve(); return; }
  const cv = $("#loaderG"), ctx = cv.getContext("2d"), serial = $("#loaderSerial"), target = "211809180";
  const t0 = performance.now(), MIN = REDUCED ? 200 : 1500;
  let fontsOk = false; (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => fontsOk = true);
  setTimeout(() => fontsOk = true, 2500);
  function frame(now){
    const p = Math.min(1, (now - t0) / MIN);
    ctx.clearRect(0, 0, 320, 320); rosette(ctx, 160, 160, 150, p * 2, 1, .15 + .85 * p);
    serial.textContent = target.split("").map((ch, i) => p > (i + 1) / 10 ? ch : String(Math.floor(Math.random() * 10))).join("");
    if (p < 1 || !fontsOk) requestAnimationFrame(frame);
    else { serial.textContent = target; setTimeout(() => { L.classList.add("out"); setTimeout(() => { L.hidden = true; }, 1000); resolve(); }, 250); }
  }
  requestAnimationFrame(frame);
});

/* ================= TÍTULO GRABADO ================= */
(function(){
  if (!CSS.supports("-webkit-background-clip", "text") && !CSS.supports("background-clip", "text")) return;
  function tex(base, line){
    const c = document.createElement("canvas"); c.width = 840; c.height = 320; const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, 0, 320); g.addColorStop(0, base[0]); g.addColorStop(1, base[1]); x.fillStyle = g; x.fillRect(0, 0, 840, 320);
    x.strokeStyle = line; x.lineWidth = .9;
    for (let y = -10; y < 330; y += 3.2){ x.beginPath(); for (let px = 0; px <= 840; px += 6){ const yy = y + Math.sin(px / 38 + y / 24) * 1.6; px ? x.lineTo(px, yy) : x.moveTo(px, yy); } x.stroke(); }
    x.globalAlpha = .5; for (let px = -320; px < 840; px += 7){ x.beginPath(); x.moveTo(px, 0); x.lineTo(px + 320, 320); x.stroke(); }
    return `url(${c.toDataURL("image/png")})`;
  }
  const r = document.documentElement;
  r.style.setProperty("--tex", tex(["#f6ecd6", "#d9c7a4"], "rgba(110,80,50,.34)"));
  r.style.setProperty("--tex2", tex(["#d9cbb2", "#b9a687"], "rgba(90,65,40,.3)"));
  r.classList.add("textured");
})();

/* ================= HÉROE: BILLETES SOBRE LA MESA ================= */
const heroBills = [];
(function(){
  const table = $("#table"), hero = $("#inicio");
  const DESK = [["b05",4,10,-11,25,.7],["b01",72,5,8,21,.45],["b06",76,60,-6,24,.8],["b02",1,64,13,20,.5],["b03",33,79,-4,20,.65],["b04",57,84,10,17,.35],["b08",86,30,17,18,.9],["b07",-6,37,-19,18,.4],["b09",22,-7,6,17,.55],["b10",49,-9,-8,19,.6]];
  const MOB = [["b05",-12,7,-11,62,.6],["b10",52,2,9,56,.5],["b04",-16,80,12,54,.4],["b08",56,84,-8,54,.7],["b02",-34,44,-16,50,.3],["b07",80,46,14,46,.45]];
  const set = MOBILE() ? MOB : DESK;
  set.forEach(([id, x, y, r, w, d]) => {
    const el = document.createElement("div"); el.className = "tb";
    el.style.cssText = `--x:${x}%;--y:${y}%;--r:${r}deg;--w:${w}vw`;
    el.innerHTML = `<div class="tbi"><img src="img/${id}_front_sm.webp" alt="" width="520" height="245"></div>`;
    table.appendChild(el); heroBills.push({el, inner: el.firstChild, x, y, r, w, d});
  });
  if (!HAS_GSAP || REDUCED) return;
  heroBills.forEach(b => gsap.set(b.el, {rotation: b.r}));
  const qx = heroBills.map(b => gsap.quickTo(b.inner, "x", {duration: .9, ease: "power3"}));
  const qy = heroBills.map(b => gsap.quickTo(b.inner, "y", {duration: .9, ease: "power3"}));
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
    hero.style.setProperty("--mx", (mx * 100) + "%"); hero.style.setProperty("--my", (my * 100) + "%");
    heroBills.forEach((b, i) => { qx[i]((mx - .5) * b.d * 60); qy[i]((my - .5) * b.d * 44); });
  });
  heroBills.forEach(b => {
    const vx = (b.x + b.w / 2 - 50), vy = (b.y + 8 - 45);
    gsap.to(b.el, {x: vx * 9, y: vy * 7, rotation: b.r + (vx > 0 ? 22 : -22) * b.d, ease: "none", scrollTrigger: {trigger: hero, start: "top top", end: "bottom top", scrub: .6}});
  });
  gsap.to(".hero-copy", {yPercent: -18, opacity: 0, scale: .95, ease: "none", scrollTrigger: {trigger: hero, start: "top top", end: "80% top", scrub: .5}});
})();
loaderDone.then(() => {
  if (!HAS_GSAP || REDUCED) return;
  gsap.from(heroBills.map(b => b.el), {y: () => -innerHeight * 1.1, rotation: () => gsap.utils.random(-60, 60), opacity: 0, duration: 1.3, stagger: .07, ease: "power3.out"});
  gsap.from("#heroTitle .w", {yPercent: 60, opacity: 0, duration: 1.1, stagger: .12, ease: "power4.out", delay: .25});
  gsap.from([".hero-copy .eyebrow", ".hero-copy .lede", ".hero-copy .byline", ".cue"], {y: 20, opacity: 0, duration: .9, stagger: .1, delay: .7, ease: "power3.out"});
});

/* ================= DESPLAZAMIENTO SUAVE ================= */
let lenis = null;
if (!REDUCED && window.Lenis && HAS_GSAP){
  lenis = new Lenis({lerp: .1, wheelMultiplier: 1, smoothWheel: true});
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
}
function goTo(target){
  if (lenis) lenis.scrollTo(target, {offset: -8, duration: 1.4});
  else target.scrollIntoView({behavior: REDUCED ? "auto" : "smooth"});
}
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const t = document.querySelector(a.getAttribute("href")); if (!t) return;
  e.preventDefault(); closeIndex(); goTo(t);
});

/* ================= BARRA, ÍNDICE, RIEL ================= */
const top = $("#top"), prog = $("#progress"), now = $("#now");
function onScroll(){
  const h = document.documentElement, y = h.scrollTop || document.body.scrollTop;
  prog.style.transform = `scaleX(${y / Math.max(1, h.scrollHeight - h.clientHeight)})`;
  top.classList.toggle("solid", y > 60);
  $("#rail").classList.toggle("on", y > innerHeight * .8);
}
addEventListener("scroll", onScroll, {passive: true}); onScroll();
$("#indexList").innerHTML = CHAPTERS.map(c => `<li><a href="#${c.id}"><span class="ino">FOLIO ${c.no}</span><span class="it">${c.t}</span><span class="ith" style="background-image:url(img/${c.img}_sm.webp)"></span></a></li>`).join("") + `<li><a href="#fuentes"><span class="ino">§</span><span class="it">Fuentes</span><span class="ith" style="background-image:url(img/b09_back_sm.webp)"></span></a></li>`;
$("#rail").innerHTML = CHAPTERS.map(c => `<a href="#${c.id}" data-id="${c.id}"><span>${c.t}</span><i>${c.no}</i></a>`).join("");
const indexNav = $("#indexNav"), menuBtn = $("#menuBtn");
function openIndex(){ indexNav.hidden = false; menuBtn.setAttribute("aria-expanded", "true"); if (lenis) lenis.stop(); document.body.style.overflow = "hidden"; $("a", indexNav).focus();
  if (HAS_GSAP && !REDUCED) gsap.from("#indexList li", {y: 30, opacity: 0, duration: .6, stagger: .05, ease: "power3.out"}); }
function closeIndex(){ if (indexNav.hidden) return; indexNav.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); if (lenis) lenis.start(); document.body.style.overflow = ""; menuBtn.focus(); }
menuBtn.addEventListener("click", () => indexNav.hidden ? openIndex() : closeIndex());
$("#indexClose").addEventListener("click", closeIndex);
indexNav.addEventListener("keydown", e => { if (e.key === "Escape") closeIndex(); });
function setChapter(c){
  $$("#rail a").forEach(a => a.classList.toggle("on", c && a.dataset.id === c.id));
  if (c){ $("#nowNo").textContent = "FOLIO " + c.no; $("#nowT").textContent = c.t; now.classList.add("on"); document.documentElement.style.setProperty("--chapter", c.tint); }
  else { now.classList.remove("on"); document.documentElement.style.setProperty("--chapter", "#121017"); }
}
(function(){
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ setChapter(CHAPTERS.find(c => c.id === e.target.id) || null); } }), {rootMargin: "-50% 0px -50% 0px"});
  CHAPTERS.forEach(c => io.observe($("#" + c.id))); io.observe($("#inicio")); io.observe($("#tesis")); io.observe($("#fuentes"));
})();

/* ================= MESA DE LUZ ================= */
const track = $("#track");
BILLS.forEach((b, i) => {
  const btn = document.createElement("button");
  btn.className = "card"; btn.type = "button";
  btn.setAttribute("aria-label", `Abrir billete de ${b.den} ${b.unit}, ${b.dt}`);
  btn.innerHTML = `<div class="flipper"><div class="side f"><img src="img/${b.id}_front.webp" alt="" loading="lazy" width="1400" height="660"></div><div class="side b"><img src="img/${b.id}_back.webp" alt="" loading="lazy" width="1400" height="660"></div></div>
    <div class="meta"><span class="den">${b.den}<small>${b.unit}</small></span><span class="date">${b.dt}</span></div>
    <div class="chips"><span class="chip g-${b.grade}">${b.grade} · desgaste ${b.wear}</span><span class="chip">${b.who}</span></div>`;
  btn.addEventListener("click", () => openViewer(i));
  track.appendChild(btn);
});
$("#yearsTicks").innerHTML = BILLS.map((b, i) => `<span style="left:${(i / (BILLS.length - 1)) * 100}%">${b.year}</span>`).join("");
const yearsDot = $("#yearsDot");
track.addEventListener("scroll", () => { yearsDot.style.left = (track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth) * 100) + "%"; }, {passive: true});

/* ================= VISOR ================= */
const V = {i: 0, back: false, lens: false, last: null};
const viewer = $("#viewer");
function renderViewer(){
  const b = BILLS[V.i], rf = DIMS[b.id + "_front"], rb = DIMS[b.id + "_back"];
  $("#vInner").style.setProperty("--ar", Math.min(rf, rb));
  $("#vFront").style.setProperty("--r", rf); $("#vBack").style.setProperty("--r", rb);
  $("#vImgF").src = `img/${b.id}_front.webp`; $("#vImgF").alt = `Anverso del billete de ${b.den} de ${b.year}`;
  $("#vImgB").src = `img/${b.id}_back.webp`; $("#vImgB").alt = `Reverso del billete de ${b.den} de ${b.year}`;
  $("#vCount").textContent = `${V.i + 1} / 10`;
  $("#vEyebrow").textContent = `Billete ${V.i + 1} de 10 · ${b.city}`;
  $("#vTitle").textContent = `${b.den} ${b.unit}`;
  const rows = [["Fecha", b.dt],["Personaje", b.who],["Serial", `<span class="serialtxt">${b.serial}</span>${b.serie ? " · " + b.serie : ""}`],["Reverso", b.rev],["Impresor", b.printer],["Valía", `${hoursTxt(b.hours)}, con un salario mínimo de $${fmt(b.wage)} al mes`],["Hoy serían", `≈ $${fmt(Math.round(b.eq/100)*100)} (en salarios mínimos de 2026)`]];
  $("#vDl").innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
  $("#vWear").innerHTML = b.crit.map((c, k) => `<span class="${c >= 2 ? "f" : ""}" title="${CRIT[k]}: ${c}/4"></span>`).join("");
  $("#vWearTxt").textContent = `${b.wear}/100 · ${b.grade}: ${GRADE_TXT[b.grade]}. ` + b.crit.map((c, k) => `${CRIT[k]} ${c}`).join(" · ");
  $("#vCallout").innerHTML = `<p style="margin:0 0 .4rem"><b>Lo que dice:</b> ${b.say}</p><p style="margin:0"><b>Lo que calla:</b> ${b.silence}</p>`;
  $("#vPinNote").innerHTML = `<b>Toque un punto rojo</b> sobre el billete para leer la nota.`;
  ["front","back"].forEach(side => {
    const face = side === "front" ? $("#vFront") : $("#vBack");
    $$(".pin", face).forEach(p => p.remove());
    b.hs[side].forEach(([x, y, t, d], k) => {
      const p = document.createElement("button");
      p.className = "pin"; p.type = "button"; p.textContent = k + 1;
      p.style.left = (x*100) + "%"; p.style.top = (y*100) + "%";
      p.setAttribute("aria-label", `Nota ${k+1}: ${t}`);
      p.addEventListener("click", ev => { ev.stopPropagation(); $$(".pin").forEach(q => q.classList.remove("on")); p.classList.add("on"); $("#vPinNote").innerHTML = `<b>${k+1}. ${t}.</b> ${d}`; });
      face.appendChild(p);
    });
  });
  setFlip(false);
}
function setFlip(back){
  V.back = back; $("#vFlipBox").classList.toggle("back", back); $("#vFlip").setAttribute("aria-pressed", back);
  $("#vSide").textContent = (back ? "Reverso" : "Anverso") + " · toque los puntos rojos";
  $$("#vFront .pin").forEach(p => p.tabIndex = back ? -1 : 0); $$("#vBack .pin").forEach(p => p.tabIndex = back ? 0 : -1);
}
function openViewer(i){
  V.i = i; V.last = document.activeElement; renderViewer(); viewer.hidden = false;
  document.body.style.overflow = "hidden"; if (lenis) lenis.stop(); $("#vClose").focus();
  if (HAS_GSAP && !REDUCED) gsap.from(".vgrid > *", {y: 30, opacity: 0, duration: .6, stagger: .08, ease: "power3.out"});
}
function closeViewer(){ viewer.hidden = true; document.body.style.overflow = ""; if (lenis) lenis.start(); $("#lens").hidden = true; if (V.last) V.last.focus(); }
$("#vClose").addEventListener("click", closeViewer);
$("#vFlip").addEventListener("click", () => setFlip(!V.back));
$("#vPrev").addEventListener("click", () => { V.i = (V.i + 9) % 10; renderViewer(); });
$("#vNext").addEventListener("click", () => { V.i = (V.i + 1) % 10; renderViewer(); });
$("#vLens").addEventListener("click", () => { V.lens = !V.lens; $("#vLens").setAttribute("aria-pressed", V.lens); if (!V.lens) $("#lens").hidden = true; });
viewer.addEventListener("keydown", e => {
  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowRight") $("#vNext").click();
  if (e.key === "ArrowLeft") $("#vPrev").click();
  if (e.key === "Tab"){ const f = $$("button:not([tabindex='-1'])", viewer).filter(x => x.offsetParent !== null); const a = f[0], z = f[f.length-1];
    if (e.shiftKey && document.activeElement === a){ e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z){ e.preventDefault(); a.focus(); } }
});
viewer.addEventListener("click", e => { if (e.target === viewer) closeViewer(); });
(function(){
  const box = $("#vFlipBox"), L = $("#lens"), Z = 2.6; let sx = null;
  box.addEventListener("pointerdown", e => { sx = e.clientX; });
  box.addEventListener("pointerup", e => { if (sx === null || V.lens) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 60 && e.pointerType !== "mouse") (dx < 0 ? $("#vNext") : $("#vPrev")).click(); });
  box.addEventListener("pointermove", e => {
    if (!V.lens) return;
    const b = BILLS[V.i], br = box.getBoundingClientRect(), r = (V.back ? $("#vBack") : $("#vFront")).getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height){ L.hidden = true; return; }
    L.hidden = false; L.style.left = (e.clientX - br.left - 90) + "px"; L.style.top = (e.clientY - br.top - 90) + "px";
    L.style.backgroundImage = `url(img/${b.id}_${V.back ? "back" : "front"}.webp)`;
    L.style.backgroundSize = `${r.width * Z}px ${r.height * Z}px`;
    L.style.backgroundPosition = `${-(x * Z - 90)}px ${-(y * Z - 90)}px`;
  });
  box.addEventListener("pointerleave", () => L.hidden = true);
})();

/* ================= TOOLTIP ================= */
function tipFor(container){
  let t = $(".tip", container);
  if (!t){ t = document.createElement("div"); t.className = "tip"; t.hidden = true; container.appendChild(t); }
  return {show(html, x, y){ t.innerHTML = html; t.hidden = false; const cw = container.clientWidth; t.style.left = Math.max(80, Math.min(cw - 80, x)) + "px"; t.style.top = y + "px"; }, hide(){ t.hidden = true; }};
}

/* ================= EL MISMO $100 (scrolly) ================= */
(function(){
  const imgs = $$("#shrinkStage img"), ghost = $("#ghost"), H74 = byId("b05").hours;
  const S = [{k:0, h:byId("b05").hours, year:"1974", val:"26,7 horas", cap:"de trabajo con salario mínimo pagaba un billete de $100"},
             {k:1, h:byId("b06").hours, year:"1977", val:"13,6 horas", cap:"de trabajo pagaba el mismo valor nominal"},
             {k:2, h:byId("b07").hours, year:"1989", val:"44 minutos", cap:"de trabajo: ya no alcanzaba para una hora"},
             {k:2, h:byId("b07").hours, year:"1974 → 1989", val:"−97 %", cap:"de poder de compra, medido en tiempo de trabajo"}];
  imgs.forEach((im, k) => { const h = [S[0].h, S[1].h, S[2].h][k]; im.style.setProperty("--sw", (92 * Math.sqrt(h / H74)) + "%"); });
  let cur = -1;
  function set(i){
    if (i === cur) return; cur = i; const s = S[i];
    imgs.forEach((im, k) => im.classList.toggle("on", k === s.k));
    ghost.classList.toggle("on", i >= 1);
    $("#shrinkYear").textContent = s.year; $(".shrink-cap").textContent = s.cap;
    const v = $("#shrinkVal"); v.textContent = s.val;
    if (HAS_GSAP && !REDUCED) gsap.fromTo(v, {y: 14, opacity: 0}, {y: 0, opacity: 1, duration: .5, ease: "power3.out"});
    $$("#shrink .step").forEach((st, k) => st.classList.toggle("on", k === i));
  }
  set(0);
  $$("#shrink .step").forEach((st, i) => {
    if (HAS_GSAP) ScrollTrigger.create({trigger: st, start: () => MOBILE() ? "bottom bottom" : "top 62%", end: () => MOBILE() ? "bottom 25%" : "bottom 62%", invalidateOnRefresh: true, onToggle: self => { if (self.isActive) set(i); }});
  });
  if (!HAS_GSAP){ const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(+e.target.dataset.i); }), {rootMargin: "-45% 0px -45% 0px"}); $$("#shrink .step").forEach(s => io.observe(s)); }
})();

/* ================= JORNAL ================= */
(function(){
  const pick = $("#jornalPick");
  BILLS.forEach((b, i) => { const btn = document.createElement("button"); btn.className = "btn"; btn.type = "button"; btn.textContent = b.short; btn.setAttribute("aria-pressed", "false"); btn.addEventListener("click", () => sel(i)); pick.appendChild(btn); });
  function sel(i){
    const b = BILLS[i];
    $$("button", pick).forEach((x, k) => { x.classList.toggle("on", k === i); x.setAttribute("aria-pressed", k === i); });
    $("#jornalLine").innerHTML = `El billete de ${b.den} del ${b.dt} pagaba <span class="gold">${hoursTxt(b.hours)}</span>. Hoy, ese mismo trabajo vale unos <span class="gold">$${fmt(Math.round(b.eq/100)*100)}</span>.`;
    const days = Math.max(1, Math.ceil(b.hours / 8)), wrap = $("#days"); wrap.innerHTML = "";
    for (let d = 0; d < days; d++){
      const part = Math.min(1, Math.max(0, b.hours / 8 - d)), el = document.createElement("div"); el.className = "day";
      el.innerHTML = `<div class="bar"><div class="fill"></div></div><div class="cap">Jornada ${d + 1} · 8 horas</div>`; wrap.appendChild(el);
      requestAnimationFrame(() => requestAnimationFrame(() => $(".fill", el).style.width = (part * 100) + "%"));
    }
    $("#jornalNote").textContent = `Salario mínimo urbano vigente el ${b.dt}: $${fmt(b.wage)} al mes. Salario mínimo de 2026: $${fmt(W2026)}. Es una equivalencia en tiempo de trabajo, no un precio de colección.`;
  }
  sel(0);
})();

/* ================= GRÁFICO: HORAS ================= */
(function(){
  const el = $("#hoursChart"), Wd = 560, rowH = 30, m = {t:10, r:24, b:34, l:110}, H = m.t + m.b + rowH * BILLS.length;
  const x = d3.scaleLog().domain([.2, 32]).range([m.l, Wd - m.r]);
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${Wd} ${H}`).attr("role","img").attr("aria-label","Horas de salario mínimo que pagaba cada billete, de 16 minutos a 27 horas");
  const g = svg.append("g").attr("class","grid");
  [[.25,"15 min"],[1,"1 h"],[4,"4 h"],[8,"1 día"],[24,"3 días"]].forEach(([v, l]) => { g.append("line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", m.t).attr("y2", H - m.b); svg.append("text").attr("x", x(v)).attr("y", H - m.b + 18).attr("text-anchor","middle").text(l); });
  const tip = tipFor(el), stems = [], dots = [];
  BILLS.forEach((b, i) => {
    const y = m.t + rowH * i + rowH/2;
    svg.append("text").attr("x", m.l - 12).attr("y", y + 4).attr("text-anchor","end").attr("class","lbl").text(b.short);
    stems.push(svg.append("line").attr("x1", x(.2)).attr("x2", x(b.hours)).attr("y1", y).attr("y2", y).attr("stroke","var(--line-2)").attr("stroke-width", 2));
    const c = svg.append("circle").attr("cx", x(b.hours)).attr("cy", y).attr("r", 6).attr("fill","var(--gold)").attr("stroke","var(--ink-2)").attr("stroke-width", 2); dots.push(c);
    svg.append("rect").attr("x", m.l).attr("y", y - rowH/2).attr("width", Wd - m.l - m.r).attr("height", rowH).attr("fill","transparent")
      .on("pointerenter pointermove", () => { c.attr("r", 8); const s = el.getBoundingClientRect().width / Wd; tip.show(`<b>${b.den} · ${b.dt}</b><br>${hoursTxt(b.hours)}<br>Salario mínimo: $${fmt(b.wage)}`, x(b.hours) * s, y * s); })
      .on("pointerleave", () => { c.attr("r", 6); tip.hide(); });
  });
  if (HAS_GSAP && !REDUCED) ScrollTrigger.create({trigger: el, start: "top 85%", once: true, onEnter: () => BILLS.forEach((b, i) => {
    stems[i].attr("x2", x(.2)).transition().delay(i * 60).duration(800).attr("x2", x(b.hours));
    dots[i].attr("cx", x(.2)).transition().delay(i * 60).duration(800).attr("cx", x(b.hours)); })});
  $("#hoursTable").innerHTML = `<table><thead><tr><th>Billete</th><th>Fecha</th><th class="n">Salario mínimo</th><th class="n">Horas</th><th class="n">Equivalente 2026</th></tr></thead><tbody>${BILLS.map(b => `<tr><td>${b.den}</td><td>${b.dt}</td><td class="n">$${fmt(b.wage)}</td><td class="n">${b.hours.toLocaleString("es-CO",{maximumFractionDigits:2})}</td><td class="n">$${fmt(b.eq)}</td></tr>`).join("")}</tbody></table>`;
})();

/* ================= GRÁFICO: INFLACIÓN ================= */
(function(){
  const el = $("#inflChart"), Wd = 560, H = 300, m = {t:26, r:18, b:30, l:40};
  const x = d3.scaleLinear().domain([1970, 2000]).range([m.l, Wd - m.r]), y = d3.scaleLinear().domain([0, 35]).range([H - m.b, m.t]);
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${Wd} ${H}`).attr("role","img").attr("aria-label","Inflación anual en Colombia entre 1970 y 2000; máximo de 32,4 por ciento en 1990");
  const g = svg.append("g").attr("class","grid");
  [0,10,20,30].forEach(v => { g.append("line").attr("x1", m.l).attr("x2", Wd - m.r).attr("y1", y(v)).attr("y2", y(v)); svg.append("text").attr("x", m.l - 8).attr("y", y(v) + 4).attr("text-anchor","end").text(v + " %"); });
  [1970,1975,1980,1985,1990,1995,2000].forEach(v => svg.append("text").attr("x", x(v)).attr("y", H - m.b + 18).attr("text-anchor","middle").text(v));
  BILLS.forEach(b => { const fx = b.year + (new Date(b.date) - new Date(b.year,0,1)) / 3.156e10; svg.append("line").attr("x1", x(fx)).attr("x2", x(fx)).attr("y1", m.t - 10).attr("y2", m.t - 2).attr("stroke","var(--gold)").attr("stroke-width", 2); });
  svg.append("text").attr("x", x(1970)).attr("y", m.t - 14).text("billetes de la caja ↓").attr("class","lbl");
  const path = svg.append("path").datum(INFL).attr("d", d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveMonotoneX)).attr("fill","none").attr("stroke","var(--serial)").attr("stroke-width", 2);
  svg.append("circle").attr("cx", x(1990)).attr("cy", y(32.4)).attr("r", 4).attr("fill","var(--serial)");
  svg.append("text").attr("x", x(1990) - 8).attr("y", y(32.4) - 8).attr("text-anchor","end").attr("class","strong").text("1990: 32,4 %");
  const cross = svg.append("line").attr("y1", m.t).attr("y2", H - m.b).attr("stroke","var(--paper-2)").attr("stroke-dasharray","3 3").style("display","none");
  const dot = svg.append("circle").attr("r", 5).attr("fill","var(--paper)").attr("stroke","var(--ink-2)").attr("stroke-width",2).style("display","none");
  const tip = tipFor(el);
  svg.append("rect").attr("x", m.l).attr("y", m.t).attr("width", Wd - m.l - m.r).attr("height", H - m.t - m.b).attr("fill","transparent")
    .on("pointermove", ev => { const [px] = d3.pointer(ev), yr = Math.round(x.invert(px)), d = INFL.find(q => q[0] === yr); if (!d) return;
      cross.style("display", null).attr("x1", x(yr)).attr("x2", x(yr)); dot.style("display", null).attr("cx", x(yr)).attr("cy", y(d[1]));
      const s = el.getBoundingClientRect().width / Wd; tip.show(`<b>${yr}</b> · inflación ${d[1].toLocaleString("es-CO")} %<br>Salario mínimo a inicios del año: $${fmt(WAGE[yr])}`, x(yr) * s, y(d[1]) * s); })
    .on("pointerleave", () => { cross.style("display","none"); dot.style("display","none"); tip.hide(); });
  if (HAS_GSAP && !REDUCED){ const L = path.node().getTotalLength(); path.attr("stroke-dasharray", L).attr("stroke-dashoffset", 0);
    ScrollTrigger.create({trigger: el, start: "top 85%", once: true, onEnter: () => gsap.fromTo(path.node(), {strokeDashoffset: L}, {strokeDashoffset: 0, duration: 2, ease: "power2.out"})}); }
  $("#inflTable").innerHTML = `<table><thead><tr><th>Año</th><th class="n">Inflación</th><th class="n">Salario mínimo (enero)</th></tr></thead><tbody>${INFL.map(d => `<tr><td>${d[0]}</td><td class="n">${d[1].toLocaleString("es-CO")} %</td><td class="n">$${fmt(WAGE[d[0]])}</td></tr>`).join("")}</tbody></table><p class="note">Fuente: Ministerio de la Protección Social (2008), cuadro resumen del salario mínimo 1950-2008.</p>`;
})();

/* ================= FIBRAS ================= */
(function(){
  const c = $("#fibers"), x = c.getContext("2d"), W = c.width, H = c.height;
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  x.fillStyle = "#1a1620"; x.fillRect(0, 0, W, H);
  x.fillStyle = "#e9dcc0"; x.fillRect(10, 10, W/2 - 15, H - 20); x.fillRect(W/2 + 5, 10, W/2 - 15, H - 20);
  x.save(); x.beginPath(); x.rect(10, 10, W/2 - 15, H - 20); x.clip();
  for (let i = 0; i < 70; i++){ x.beginPath(); let px = 10 + rnd() * (W/2), py = 10 + rnd() * H, a = rnd() * 6.28; x.moveTo(px, py);
    for (let k = 0; k < 40; k++){ a += (rnd() - .5) * .5; px += Math.cos(a) * 6; py += Math.sin(a) * 6; x.lineTo(px, py); }
    x.strokeStyle = `rgba(110,90,70,${.35 + rnd() * .35})`; x.lineWidth = 1 + rnd() * 1.6; x.stroke(); }
  x.restore(); x.save(); x.beginPath(); x.rect(W/2 + 5, 10, W/2 - 15, H - 20); x.clip();
  for (let i = 0; i < 520; i++){ const px = W/2 + rnd() * W/2, py = rnd() * H, a = rnd() * 6.28, l = 4 + rnd() * 10;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.strokeStyle = `rgba(110,90,70,${.3 + rnd() * .4})`; x.lineWidth = .8 + rnd(); x.stroke(); }
  x.restore();
  const draw = () => { x.font = "700 15px 'Courier Prime', monospace"; x.fillStyle = "#2a2018"; x.fillText("ALGODÓN · fibra larga", 22, H - 22); x.fillText("MADERA · fibra corta", W/2 + 17, H - 22); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw);
})();

/* ================= ANATOMÍA DEL $20 (scrolly) ================= */
(function(){
  const inner = $("#anatIn"), F = $("#anatF"), B = $("#anatB"), tag = $("#anatTag");
  const S = [[.5,.5,1,"f"],[.9,.9,2.6,"f"],[.94,.1,2.8,"f"],[.55,.4,2.4,"f"],[.35,.5,1.5,"f"],[.45,.38,2,"b"],[.2,.9,2.4,"b"]];
  let cur = -1;
  function set(i){
    if (i === cur) return; cur = i; const [fx0, fy0, s, side] = S[i];
    const fx = .04 + .92 * fx0, fy = .04 + .92 * fy0;
    const xp = Math.min(0, Math.max((1 - s) * 100, (.5 - s * fx) * 100)), yp = Math.min(0, Math.max((1 - s) * 100, (.5 - s * fy) * 100));
    if (HAS_GSAP && !REDUCED) gsap.to(inner, {xPercent: xp, yPercent: yp, scale: s, transformOrigin: "0 0", duration: 1.2, ease: "power3.inOut"});
    else inner.style.transform = `translate(${xp}%, ${yp}%) scale(${s})`;
    F.style.opacity = side === "f" ? 1 : 0; B.style.opacity = side === "b" ? 1 : 0; tag.textContent = side === "f" ? "Anverso" : "Reverso";
    $$("#anat .step").forEach((st, k) => st.classList.toggle("on", k === i));
  }
  set(0);
  $$("#anat .step").forEach((st, i) => { if (HAS_GSAP) ScrollTrigger.create({trigger: st, start: () => MOBILE() ? "bottom bottom" : "top 62%", end: () => MOBILE() ? "bottom 25%" : "bottom 62%", invalidateOnRefresh: true, onToggle: self => { if (self.isActive) set(i); }}); });
  if (!HAS_GSAP){ const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) set(+e.target.dataset.i); }), {rootMargin: "-45% 0px -45% 0px"}); $$("#anat .step").forEach(s => io.observe(s)); }
})();

/* ================= MECANISMOS ================= */
$("#mech").innerHTML = MECH.map(m => `<article><div class="thumb" style="background-image:url(img/${m.img}.webp);background-position:${m.pos}" role="img" aria-label="Detalle: ${m.t.toLowerCase()}"></div><h3>${m.t}</h3><p>${m.d}</p></article>`).join("");

/* ================= COMPARADOR ================= */
(function(){
  const PAIRS = [
    {a:"b02", b:"b01", la:"← 20 de julio de 1977", lb:"20 de julio de 1976 →", note:"Medición sobre las fotos: el billete de 1976 es un 12 % más oscuro en el anverso y bastante más amarillo, y tiene un agujero en el centro. Solo un año lo separa del otro.", altA:"Billete de 2 pesos de 1977, mejor conservado", altB:"Billete de 2 pesos de 1976, muy gastado"},
    {a:"b08", b:"b09", la:"← 12 de octubre de 1987", lb:"4 de enero de 1993 →", note:"El de 1993 es más reciente y, sin embargo, está más gastado: un 4 % más oscuro y más amarillo según la medición sobre las fotos. El de 1987 casi no circuló.", altA:"Billete de 500 pesos de 1987, casi nuevo", altB:"Billete de 500 pesos de 1993, gastado"}];
  const box = $("#compare"), rng = $("#cmpRange"), setCut = v => box.style.setProperty("--cut", v + "%");
  rng.addEventListener("input", () => setCut(rng.value));
  function sel(k){ const p = PAIRS[k];
    $("#cmpA").src = `img/${p.a}_front.webp`; $("#cmpA").alt = p.altA; $("#cmpB").src = `img/${p.b}_front.webp`; $("#cmpB").alt = p.altB;
    $("#cmpLA").textContent = p.la; $("#cmpLB").textContent = p.lb; $("#cmpNote").textContent = p.note;
    $$("[data-pair]").forEach(b => { const on = +b.dataset.pair === k; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }); }
  $$("[data-pair]").forEach(b => b.addEventListener("click", () => sel(+b.dataset.pair)));
  sel(0); setCut(50);
  if (HAS_GSAP && !REDUCED) ScrollTrigger.create({trigger: box, start: "top 70%", once: true, onEnter: () => { const o = {v: 50}; gsap.to(o, {v: 18, duration: 1.1, ease: "power2.inOut", yoyo: true, repeat: 1, onUpdate: () => { setCut(o.v); rng.value = o.v; }}); }});
})();

/* ================= GRÁFICO: DESGASTE ================= */
(function(){
  const el = $("#wearChart"), Wd = 560, H = 330, m = {t:16, r:24, b:40, l:44};
  const x = d3.scaleLog().domain([.2, 40]).range([m.l, Wd - m.r]), y = d3.scaleLinear().domain([0, 100]).range([H - m.b, m.t]);
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${Wd} ${H}`).attr("role","img").attr("aria-label","Diagrama de dispersión: los billetes de más valor en horas de trabajo tienden a estar menos gastados");
  const g = svg.append("g").attr("class","grid");
  [0,25,50,75,100].forEach(v => { g.append("line").attr("x1", m.l).attr("x2", Wd - m.r).attr("y1", y(v)).attr("y2", y(v)); svg.append("text").attr("x", m.l - 8).attr("y", y(v) + 4).attr("text-anchor","end").text(v); });
  [[.25,"15 min"],[1,"1 h"],[8,"1 día"],[24,"3 días"]].forEach(([v,l]) => svg.append("text").attr("x", x(v)).attr("y", H - m.b + 18).attr("text-anchor","middle").text(l));
  svg.append("text").attr("x", Wd - m.r).attr("y", H - 4).attr("text-anchor","end").text("valor al emitirse, en horas de salario mínimo →");
  svg.append("text").attr("x", m.l).attr("y", m.t - 4).text("↑ desgaste").attr("class","lbl");
  const pts = BILLS.map(b => [Math.log(b.hours), b.wear]), mx = d3.mean(pts, p => p[0]), my = d3.mean(pts, p => p[1]);
  const sl = d3.sum(pts, p => (p[0]-mx)*(p[1]-my)) / d3.sum(pts, p => (p[0]-mx)**2), ic = my - sl*mx;
  svg.append("line").attr("x1", x(.25)).attr("x2", x(30)).attr("y1", y(ic + sl*Math.log(.25))).attr("y2", y(ic + sl*Math.log(30))).attr("stroke","var(--line-2)").attr("stroke-width", 2).attr("stroke-dasharray","6 5");
  const off = {b01:[-10,16,"end"], b02:[-10,14,"end"], b03:[10,-8], b04:[10,4], b05:[-10,-8,"end"], b06:[10,4], b07:[10,14], b08:[10,4], b09:[10,-6], b10:[10,4]};
  const tip = tipFor(el);
  BILLS.forEach(b => {
    const cx = x(b.hours), cy = y(b.wear), o = off[b.id] || [10,4];
    const c = svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 6).attr("fill","var(--gold)").attr("stroke","var(--ink-2)").attr("stroke-width", 2);
    svg.append("text").attr("x", cx + o[0]).attr("y", cy + o[1]).attr("text-anchor", o[2] || "start").attr("class","lbl").text(b.short);
    svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 16).attr("fill","transparent").style("cursor","pointer")
      .on("pointerenter", () => { c.attr("r", 8); const s = el.getBoundingClientRect().width / Wd; tip.show(`<b>${b.den} · ${b.dt}</b><br>${hoursTxt(b.hours)}<br>Desgaste ${b.wear}/100 (${b.grade})`, cx * s, cy * s); })
      .on("pointerleave", () => { c.attr("r", 6); tip.hide(); })
      .on("click", () => openViewer(BILLS.indexOf(b)));
  });
  $("#wearTable").innerHTML = `<table><thead><tr><th>Billete</th>${CRIT.map(c => `<th class="n">${c}</th>`).join("")}<th class="n">Puntaje</th><th>Escala</th></tr></thead><tbody>${BILLS.map(b => `<tr><td>${b.short}</td>${b.crit.map(c => `<td class="n">${c}</td>`).join("")}<td class="n">${b.wear}</td><td>${b.grade}</td></tr>`).join("")}</tbody></table>`;
})();

/* ================= SIMULADOR ================= */
(function(){
  const cv = $("#simCanvas"), ctx = cv.getContext("2d"), W = cv.width, H = cv.height, img = new Image(); img.src = "img/b10_front.webp";
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const noise = document.createElement("canvas"); noise.width = W; noise.height = H;
  (() => { const n = noise.getContext("2d"), d = n.createImageData(W, H); for (let i = 0; i < d.data.length; i += 4){ const v = rnd(); d.data[i] = 70; d.data[i+1] = 52; d.data[i+2] = 30; d.data[i+3] = v > .55 ? (v - .55) * 360 : 0; } n.putImageData(d, 0, 0); })();
  const bites = Array.from({length: 40}, () => [Math.floor(rnd()*4), rnd(), 6 + rnd()*22]);
  let pad = 30, bw = W - 60, bh = H - 60, oy = 30, creases = [];
  function layout(){ const ar = img.naturalWidth / img.naturalHeight || 2.06; bw = W - pad*2; bh = bw / ar; if (bh > H - pad*2){ bh = H - pad*2; bw = bh * ar; } oy = (H - bh) / 2;
    creases = Array.from({length: 26}, (_, i) => i === 0 ? [pad + bw/2, oy, pad + bw/2 + 6, oy + bh] : i === 1 ? [pad, oy + bh/2, pad + bw, oy + bh/2 - 4] : [pad + rnd()*bw, oy + rnd()*bh, pad + rnd()*bw, oy + rnd()*bh]); }
  function draw(mo){
    const u = Math.min(1, mo / 18); ctx.clearRect(0, 0, W, H); if (!img.complete || !creases.length) return;
    const layer = document.createElement("canvas"); layer.width = W; layer.height = H; const L = layer.getContext("2d");
    L.drawImage(img, pad, oy, bw, bh); L.globalCompositeOperation = "source-atop";
    L.fillStyle = `rgba(120,95,55,${u * .42})`; L.fillRect(0, 0, W, H); L.globalAlpha = u; L.drawImage(noise, 0, 0); L.globalAlpha = 1;
    creases.forEach((c, i) => { const a = Math.max(0, u * 1.4 - (i / creases.length) * .9); if (a <= 0) return;
      L.strokeStyle = `rgba(40,30,20,${a * .45})`; L.lineWidth = i < 2 ? 2.2 : 1.1; L.beginPath(); L.moveTo(c[0], c[1]); L.lineTo(c[2], c[3]); L.stroke();
      L.strokeStyle = `rgba(255,250,235,${a * .25})`; L.lineWidth = 1; L.beginPath(); L.moveTo(c[0] + 1.5, c[1] + 1.5); L.lineTo(c[2] + 1.5, c[3] + 1.5); L.stroke(); });
    if (u > .55){ L.font = "700 64px Caveat, cursive"; L.fillStyle = `rgba(60,110,200,${Math.min(1,(u-.55)*3) * .8})`; L.save(); L.translate(W*.62, oy + bh*.78); L.rotate(-.12); L.fillText("2000", 0, 0); L.restore(); }
    L.globalCompositeOperation = "destination-out";
    bites.forEach(([side, t, r], i) => { const a = u * 1.6 - i / bites.length; if (a <= 0) return; const rr = r * Math.min(1, a);
      const p = side === 0 ? [pad + t*bw, oy] : side === 1 ? [pad + bw, oy + t*bh] : side === 2 ? [pad + t*bw, oy + bh] : [pad, oy + t*bh];
      L.beginPath(); L.arc(p[0], p[1], rr * .6, 0, 6.28); L.fill(); });
    if (u > .8){ const a = (u - .8) * 5; L.beginPath(); L.arc(pad + bw/2 + 3, oy + bh/2 - 2, 9 * a, 0, 6.28); L.fill(); }
    ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12; ctx.drawImage(layer, 0, 0); ctx.shadowColor = "transparent";
  }
  const r = $("#simRange");
  function upd(){ const mo = +r.value; draw(mo);
    $("#simMonths").textContent = mo === 0 ? "0 meses" : `${mo.toLocaleString("es-CO")} ${mo === 1 ? "mes" : "meses"}`;
    $("#simText").textContent = mo === 0 ? "Recién salido de la imprenta." : mo < 6 ? "Primeros dobleces: el billete vive en billeteras y bolsillos." : mo < 9 ? "Se acerca a la vida media de un billete de $1.000 sin barniz (8,7 meses en 2010)." : mo < 14 ? "Más allá de la vida media: el Banco lo retiraría por sucio." : "Rasgaduras, anotaciones y un agujero en el centro: como el $20 de 1981."; }
  r.addEventListener("input", upd);
  img.onload = () => { layout(); upd(); }; if (img.complete){ layout(); upd(); }
  if (HAS_GSAP && !REDUCED) ScrollTrigger.create({trigger: cv, start: "top 75%", once: true, onEnter: () => { const o = {v: 0};
    gsap.to(o, {v: 9, duration: 3, ease: "power1.inOut", onUpdate: () => { r.value = Math.round(o.v * 2) / 2; upd(); }, onComplete: () => gsap.to(o, {v: 0, duration: 1.4, delay: .6, ease: "power1.inOut", onUpdate: () => { r.value = Math.round(o.v * 2) / 2; upd(); }})}); }});
})();

/* ================= MAPA ================= */
(function(){
  const el = $("#map"), Wd = 520, H = 620;
  const proj = d3.geoMercator().fitExtent([[10, 10], [Wd - 10, H - 10]], {type:"FeatureCollection", features: GEO.features.concat([{type:"Feature", geometry:{type:"Point", coordinates:[-66.9, 10.5]}}])});
  const path = d3.geoPath(proj);
  const svg = d3.select(el).append("svg").attr("viewBox", `0 0 ${Wd} ${H}`).attr("role","img").attr("aria-label","Mapa de Colombia con los lugares representados en los billetes");
  const deps = svg.append("g").selectAll("path").data(GEO.features).join("path").attr("class","dep").attr("d", path);
  svg.append("g").attr("transform", `translate(${Wd - 112},16)`).call(g => { g.append("rect").attr("width", 96).attr("height", 40).attr("fill","none").attr("stroke","var(--line-2)"); g.append("circle").attr("cx", 14).attr("cy", 20).attr("r", 3).attr("fill","var(--paper-2)"); g.append("text").attr("x", 24).attr("y", 18).text("San Andrés y").style("font-size","9px"); g.append("text").attr("x", 24).attr("y", 30).text("Providencia").style("font-size","9px"); });
  const P = {Bogota:[-74.072,4.711], Guaduas:[-74.598,5.069], Popayan:[-76.614,2.444], VillaRosario:[-72.474,7.834], VillaLeyva:[-73.524,5.633], Vargas:[-73.115,5.739], SanAgustin:[-76.270,1.881], Granada:[-75.185,6.143], Caracas:[-66.9,10.5]};
  const MODES = {
    lugares:{label:"Qué lugares muestran", hl:["Bogota","Cundinamarca","Boyacá","Huila"], pts:[["Bogota","Bogotá (7)",7],["VillaLeyva","Villa de Leyva",1],["Vargas","Pantano de Vargas",1],["SanAgustin","San Agustín",1]], arcs:true,
      legend:[[7,"reversos con lugares o piezas de Bogotá"],[2,"de Boyacá"],[1,"del Huila"],[0,"de Antioquia"]], note:"Los reversos: Capitolio (2), Casa de Moneda (2), balsa muisca y orfebrería del Museo del Oro (3), Villa de Leyva, Pantano de Vargas y San Agustín."},
    personajes:{label:"Dónde nacieron sus personajes", hl:["Bogota","Cundinamarca","Norte de Santander","Cauca"], pts:[["VillaRosario","Santander (4)",4],["Guaduas","Policarpa (2)",2],["Bogota","Nariño (2)",2],["Popayan","Caldas (1)",1],["Caracas","Bolívar (1)",1]], arcs:true,
      legend:[[4,"billetes con Santander"],[2,"con Policarpa Salavarrieta"],[2,"con Antonio Nariño"],[2,"con Caldas o Bolívar"]], note:"Ningún personaje es antioqueño. Todos pertenecen al relato de la Independencia."},
    imprenta:{label:"Dónde se imprimieron", hl:["Bogota"], pts:[["Bogota","Bogotá (4)",4]], london:true,
      legend:[[4,"impresos en Bogotá (1987-1995)"],[2,"impresos en Londres (1974 y 1977)"],[4,"sin pie de imprenta visible"]], note:"Los dos billetes de $100 de los años setenta llevan el pie de Thomas De La Rue (Londres). Los de 1987 en adelante, el de la Imprenta de Billetes de Bogotá."},
    leyenda:{label:"Qué ciudad dicen", hl:["Bogota"], pts:[["Bogota","Bogotá (10)",10]],
      legend:[[8,"lo dicen junto a la fecha (6 «Bogotá», 2 «Santa Fe de Bogotá»)"],[2,"lo dicen en el reverso («Capitolio Nacional · Bogotá»)"],[9,"reversos con el sello de Bogotá"]], note:"El nombre «Santa Fe de Bogotá» rigió entre la Constitución de 1991 y el Acto Legislativo 01 de 2000."}
  };
  const gArcs = svg.append("g"), gLinks = svg.append("g"), gPts = svg.append("g");
  const home = svg.append("g").attr("class","pt home").attr("transform", `translate(${proj(P.Granada)})`);
  home.append("circle").attr("r", 6); home.append("text").attr("x", -10).attr("y", -10).attr("text-anchor","end").text("Granada: aquí se guardaron");
  const btns = $("#mapModes");
  Object.entries(MODES).forEach(([k, m]) => { const b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.textContent = m.label; b.dataset.k = k; b.setAttribute("aria-pressed","false"); b.addEventListener("click", () => setMode(k)); btns.appendChild(b); });
  const arcD = (a, b, bend = .25) => { const [x1, y1] = a, [x2, y2] = b, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1; return `M${x1},${y1} Q${mx - dy * bend},${my + dx * bend} ${x2},${y2}`; };
  function drawPath(sel){ if (!HAS_GSAP || REDUCED) return; sel.each(function(){ const L = this.getTotalLength(); gsap.fromTo(this, {strokeDasharray: L, strokeDashoffset: L}, {strokeDashoffset: 0, duration: 1.2, ease: "power2.out", delay: .1}); }); }
  function setMode(k){
    const m = MODES[k];
    $$("button", btns).forEach(b => { const on = b.dataset.k === k; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    deps.attr("class", d => "dep" + (m.hl.includes(d.properties.name) ? " hl" : "") + (d.properties.name === "Antioquia" ? " anti" : ""));
    const r = d3.scaleSqrt().domain([0, 10]).range([0, 20]);
    const sel = gPts.selectAll("g").data(m.pts, d => d[0] + d[1]); sel.exit().remove();
    const en = sel.enter().append("g").attr("class","pt"); en.append("circle"); en.append("text");
    const all = en.merge(sel).attr("transform", d => `translate(${proj(P[d[0]])})`);
    const left = d => ["Caracas","VillaRosario","Guaduas"].includes(d[0]);
    all.select("circle").attr("r", 0).transition().duration(REDUCED ? 0 : 600).attr("r", d => Math.max(5, r(d[2])));
    all.select("text").attr("x", d => left(d) ? -12 : 14).attr("y", d => d[0] === "VillaLeyva" ? -8 : d[0] === "Vargas" ? 12 : 4).attr("text-anchor", d => left(d) ? "end" : "start").text(d => d[1]);
    gArcs.selectAll("*").remove(); gLinks.selectAll("*").remove();
    const bog = proj(P.Bogota);
    if (m.arcs) drawPath(gArcs.selectAll("path").data(m.pts.filter(p => p[0] !== "Bogota")).join("path").attr("class","arc").attr("d", d => arcD(proj(P[d[0]]), bog)));
    drawPath(gLinks.append("path").attr("class","link").attr("d", arcD(bog, proj(P.Granada), -.3)));
    if (m.london){ drawPath(gLinks.append("path").attr("class","arc").attr("d", arcD([Wd - 30, 40], bog, .2))); gLinks.append("text").attr("x", Wd - 30).attr("y", 72).attr("text-anchor","end").attr("class","strong").text("Londres (2) →").style("font-size","12px"); }
    $("#mapLegend").innerHTML = m.legend.map(([n, t]) => `<div><b>${n}</b><span>${t}</span></div>`).join("");
    $("#mapNote").textContent = m.note;
  }
  setMode("lugares");
})();

/* ================= SELLOS ================= */
(function(){
  const S = [["b05",.49,.17,"1974"],["b01",.505,.22,"1976"],["b06",0,0,"1977 · $100"],["b02",.52,.21,"1977"],["b03",.505,.20,"1980"],["b04",.53,.20,"1981"],["b08",.42,.17,"1987"],["b07",.45,.17,"1989"],["b09",.43,.19,"1993"],["b10",.52,.17,"1995"]];
  const w = .17;
  $("#seals").innerHTML = S.map(([id, cx, cy, lab]) => {
    if (!cx) return `<div class="seal missing"><div title="Sin sello: dice «Capitolio Nacional · Bogotá»"></div><span>${lab}: sin sello</span></div>`;
    const R = DIMS[id + "_back"], h = w * R, px = (cx - w/2) / (1 - w) * 100, py = (cy - h/2) / (1 - h) * 100;
    return `<div class="seal"><div style="background-image:url(img/${id}_back.webp);background-size:${100 / w}% auto;background-position:${px.toFixed(2)}% ${py.toFixed(2)}%" role="img" aria-label="Sello del reverso, ${lab}"></div><span>${lab}</span></div>`;
  }).join("");
  if (HAS_GSAP && !REDUCED) gsap.from("#seals .seal", {scale: .6, opacity: 0, rotation: -40, duration: .8, stagger: .07, ease: "back.out(1.6)", scrollTrigger: {trigger: "#seals", start: "top 80%", once: true}});
})();

/* ================= PUNTOS DE POBLACIÓN ================= */
(function(){
  const svg = $("#dots"), V = [[19444, "habitantes en 2000"], [6000, "habitantes a comienzos de 2002 (aprox.)"], [9859, "habitantes en 2015"]];
  let s = 5; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const order = Array.from({length: 200}, (_, i) => i).sort(() => rnd() - .5), rank = []; order.forEach((d, k) => rank[d] = k);
  let html = ""; for (let i = 0; i < 200; i++){ const c = i % 20, r = Math.floor(i / 20); html += `<circle cx="${10 + c * 20}" cy="${10 + r * 20}" r="6.2" data-k="${rank[i]}" style="transition-delay:${(rnd() * .7).toFixed(2)}s"></circle>`; }
  svg.innerHTML = html; const circles = $$("circle", svg); let cur = -1, touched = false;
  function set(i){
    if (i === cur) return; cur = i; const n = Math.round(V[i][0] / 100);
    circles.forEach(c => { const on = +c.dataset.k < n; c.setAttribute("fill", on ? "var(--violet)" : "transparent"); c.setAttribute("stroke", on ? "none" : "var(--line-2)"); });
    $$("#dotsFig [data-y]").forEach(b => { const on = +b.dataset.y === i; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    $("#dotsYear").textContent = V[i][1];
    const numEl = $("#dotsNum"), from = +numEl.dataset.v || V[i][0]; numEl.dataset.v = V[i][0];
    if (HAS_GSAP && !REDUCED){ const o = {v: from}; gsap.to(o, {v: V[i][0], duration: 1.1, ease: "power2.out", onUpdate: () => numEl.textContent = (i === 1 ? "≈ " : "") + fmt(o.v)}); }
    else numEl.textContent = (i === 1 ? "≈ " : "") + fmt(V[i][0]);
  }
  $$("#dotsFig [data-y]").forEach(b => b.addEventListener("click", () => { touched = true; set(+b.dataset.y); }));
  set(0);
  if (HAS_GSAP && !REDUCED) ScrollTrigger.create({trigger: svg, start: "top 70%", once: true, onEnter: () => setTimeout(() => { if (!touched) set(1); }, 1300)});
})();

/* ================= LÍNEA DE TIEMPO ================= */
(function(){
  const el = $("#timeline"), TAG = {billete:"Billete", familia:"Familia", contexto:"Colombia", guerra:"Guerra en Granada"};
  el.innerHTML = TL.map(([y, k, t]) => `<div class="ev ${k}" data-k="${k}"><span class="y">${y}</span><span class="k">${TAG[k]}</span><p>${t}</p></div>`).join("");
  $$("#tlFilter button").forEach(b => b.addEventListener("click", () => { const k = b.dataset.k;
    $$("#tlFilter button").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
    $$(".ev", el).forEach(ev => ev.hidden = !(k === "all" || ev.dataset.k === k)); if (HAS_GSAP) ScrollTrigger.refresh(); }));
  if (HAS_GSAP && !REDUCED) $$(".ev", el).forEach(ev => gsap.from(ev, {x: -24, opacity: 0, duration: .6, ease: "power3.out", scrollTrigger: {trigger: ev, start: "top 92%", once: true}}));
})();

/* ================= CORRIENTES ================= */
(function(){
  const tabs = $("#tabs"), panel = $("#tabpanel");
  CURRENTS.forEach((c, i) => { const b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.setAttribute("role","tab"); b.id = "tab" + i; b.textContent = c.k;
    b.setAttribute("aria-selected", "false"); b.setAttribute("aria-controls", "tabpanel"); b.addEventListener("click", () => sel(i));
    b.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft"){ const n = (i + (e.key === "ArrowRight" ? 1 : CURRENTS.length - 1)) % CURRENTS.length; sel(n); $("#tab" + n).focus(); } });
    tabs.appendChild(b); });
  function sel(i){ const c = CURRENTS[i];
    $$("button", tabs).forEach((b, k) => { const on = k === i; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
    panel.setAttribute("aria-labelledby", "tab" + i);
    panel.innerHTML = `<div><h3>${c.k}</h3><p class="who">${c.who}</p><p class="look">${c.look}</p></div><div><ol class="qs">${c.q.map(q => `<li><span>${q}</span></li>`).join("")}</ol><div class="ans"><div><h4>Lo que responden los billetes</h4><p>${c.yes}</p></div><div><h4>Lo que callan</h4><p>${c.no}</p></div></div></div>`;
    if (HAS_GSAP && !REDUCED) gsap.fromTo(panel, {rotation: -1.2, y: 16, opacity: .4}, {rotation: 0, y: 0, opacity: 1, duration: .6, ease: "power3.out"}); }
  sel(0);
})();

/* ================= CONCLUSIÓN PALABRA POR PALABRA ================= */
(function(){
  const p = $("#closingText"); if (!p || REDUCED || !HAS_GSAP) return;
  p.innerHTML = p.textContent.split(/(\s+)/).map(w => /\s+/.test(w) ? w : `<span class="wd">${w}</span>`).join("");
  const words = $$(".wd", p);
  ScrollTrigger.create({trigger: p, start: "top 80%", end: "bottom 45%", scrub: true, onUpdate: self => { const n = Math.round(self.progress * words.length); words.forEach((w, i) => w.classList.toggle("lit", i < n)); }});
})();

/* ================= MOVIMIENTO GENERAL ================= */
(function(){
  const vio = new IntersectionObserver(es => es.forEach(e => { if (REDUCED) return; if (e.isIntersecting) e.target.play().catch(() => {}); else e.target.pause(); }), {threshold: .35});
  $$("video").forEach(v => vio.observe(v));
  if (!HAS_GSAP || REDUCED) return;
  $$(".opener").forEach(op => {
    gsap.fromTo($(".opener-bg", op), {scale: 1.2, yPercent: -5}, {scale: 1, yPercent: 5, ease: "none", scrollTrigger: {trigger: op, start: "top bottom", end: "bottom top", scrub: true}});
    gsap.fromTo($(".numeral", op), {y: 80}, {y: -80, ease: "none", scrollTrigger: {trigger: op, start: "top bottom", end: "bottom top", scrub: true}});
    gsap.from($$(".opener-in > :not(.numeral)", op), {y: 40, opacity: 0, duration: 1, stagger: .1, ease: "power3.out", scrollTrigger: {trigger: op, start: "top 60%", once: true}});
  });
  $$(".thesis-text mark").forEach((mk, i) => gsap.fromTo(mk, {"--hl": "0%"}, {"--hl": "100%", duration: 1.1, delay: i * .5, ease: "power2.inOut", scrollTrigger: {trigger: ".thesis-text", start: "top 75%", once: true}}));
  $$("[data-count]").forEach(el => { const end = +el.dataset.count, o = {v: 0}; ScrollTrigger.create({trigger: el, start: "top 90%", once: true, onEnter: () => gsap.fromTo(o, {v: 0}, {v: end, duration: 1.2, ease: "power2.out", onUpdate: () => el.textContent = Math.round(o.v)})}); });
  $$(".mech article, .six article, .discard article, .dates div").forEach(el => gsap.from(el, {y: 40, opacity: 0, duration: .8, ease: "power3.out", scrollTrigger: {trigger: el, start: "top 90%", once: true}}));
  $$(".figure, .screen-fig, .versus, .seals-copy, .film-copy").forEach(el => gsap.from(el, {y: 50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: {trigger: el, start: "top 88%", once: true}}));
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const tr = $("#track"); tr.classList.add("pinned");
    const cards = $$(".card", tr);
    const dist = () => Math.max(0, tr.scrollWidth - innerWidth + parseFloat(getComputedStyle(tr).paddingLeft));
    const tw = gsap.to(tr, {x: () => -dist(), ease: "none", scrollTrigger: {trigger: "#parade", start: "top top", end: () => "+=" + dist(), pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 1,
      onUpdate: self => { yearsDot.style.left = (self.progress * 100) + "%"; }}});
    cards.forEach(c => gsap.fromTo(c, {rotation: 4, y: 30}, {rotation: -2, y: -10, ease: "none", scrollTrigger: {trigger: c, containerAnimation: tw, start: "left right", end: "right left", scrub: true}}));
    return () => { tr.classList.remove("pinned"); gsap.set(tr, {x: 0}); };
  });
  ScrollTrigger.sort(); ScrollTrigger.refresh();
  addEventListener("load", () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
})();
