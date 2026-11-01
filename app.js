/* Setly — logique de l'application (programme, séances, historique, minuteur). */
(function(){
"use strict";

/* ---------- Programme ---------- */
var WARM = [
  "3 min de rameur ou de vélo léger",
  "Cercles d'épaules et rotations externes à l'élastique ou à la poulie basse : 2 × 15",
  "Pull-apart à l'élastique : 2 × 15",
  "Mobilité thoracique : « open book » au sol (8 par côté) ou chat-vache (× 10)",
  "1 à 2 séries de montée en charge sur le premier exercice"
];
var RULE = "Côté gauche toujours en premier. Mêmes répétitions des deux côtés, avec la charge que le côté le moins musclé tient proprement. RPE 8 = 2 répétitions en réserve, RPE 9 = 1.";

var CIRCUIT = {
  rounds: 3, restSec: 75,
  intro: "Enchaîne les 4 exercices sans repos, puis 60 à 90 s de repos entre les tours. RPE 9.",
  items: [
    ["Crunch à la poulie haute (à genoux)", "12–15", "Arrondis la colonne, ne tire pas avec les bras.", "https://fitwill.app/fr/exercise/0175/cable-kneeling-crunch/"],
    ["Relevé de jambes suspendu aux barres (Captain's Chair)", "10–15", "Bassin enroulé, sans élan.", "https://boxlifemagazine.com/chaise-romaine-exercice/"],
    ["Gainage latéral (planche côté)", "30–40 s par côté", "Gauche d'abord, même durée à droite.", "https://conseilsport.decathlon.fr/gainage-lateral-sculpter-votre-corps-en-douceur"],
    ["Dead bug", "10 par côté", "Gauche d'abord. Bas du dos plaqué au sol.", "https://www.health.harvard.edu/exercise-and-fitness/the-many-benefits-of-the-dead-bug", "en"]
  ]
};

var DEFAULT_DAYS = [
  { id: "lundi", short: "Lun", dow: 1, tag: "Push A", title: "Push A · pecs, épaules, abdos", ex: [
    ["Développé couché haltères sur banc incliné (30°)", 4, "8–10", "2 min", "8", "Haut des pecs. Haltères indépendants, mêmes reps des deux côtés.", "https://www.fitadium.com/conseils/developpe-incline/"],
    ["Développé couché machine (Chest Press)", 3, "10–12", "90 s", "8–9", "Option : à un bras en commençant par la gauche.", "https://www.hingehealth.com/ca/fr/resources/articles/seated-chest-press/"],
    ["Élévations latérales à la poulie basse, une main", 4, "12–15", "60 s", "9", "Gauche d'abord. Accent sur le deltoïde latéral.", "https://fitwill.app/fr/exercise/2231/cable-one-arm-lateral-raise/"],
    ["Développé épaules haltères assis (banc à dossier)", 3, "8–10", "2 min", "8", "Haltères pour respecter chaque côté.", "https://fitwill.app/fr/exercise/2237/dumbbell-seated-shoulder-press/"],
    ["Écartés à la poulie vis-à-vis (haute vers basse)", 3, "12–15", "60 s", "9", "Pecs bas et partie interne. Un bras à la fois, gauche d'abord.", "https://www.fitadium.com/conseils/poulie-vis-a-vis/"],
    ["Extensions triceps à la poulie, une main", 2, "12–15", "60 s", "9", "Gauche d'abord.", "https://www.fitadium.com/conseils/triceps-extension-poulie-haute/"]
  ]},
  { id: "mardi", short: "Mar", dow: 2, tag: "Pull", title: "Pull + abdos · dos, stabilisateurs", ex: [
    ["Rowing unilatéral à la poulie basse (ou rowing haltère)", 4, "10–12", "90 s", "8", "Gauche d'abord. Dos neutre, pas de rotation du tronc.", "https://conseilsport.decathlon.fr/maitriser-le-rowing-haltere-ou-tirage-bucheron"],
    ["Tirage vertical à la poulie haute, prise neutre ou large", 3, "10–12", "90 s", "8", "Une main à la fois en variante si un côté domine.", "https://www.fitadium.com/conseils/tirage-vertical/"],
    ["Rotation externe à la poulie, une main (coude collé)", 3, "12–15", "60 s", "8–9", "Gauche d'abord. Charge légère, coude à 90° collé au corps. Protège l'épaule.", "https://www.fitnesspark.fr/?p=13509"],
    ["Rowing assis à la machine (Seated Row)", 3, "10–12", "90 s", "8", "Pause d'une seconde en contraction.", "https://www.strengthlog.com/seated-machine-row", "en"],
    ["Oiseau (Reverse Fly) à la machine ou aux haltères", 4, "12–15", "60 s", "9", "Deltoïde postérieur.", "https://boxlifemagazine.com/exercice-arriere-epaule/"],
    ["Curl haltères alternés", 2, "10–12", "60 s", "8–9", "Gauche d'abord.", "https://nutriandco.com/fr/pages/curl-haltere"]
  ]},
  { id: "jeudi", short: "Jeu", dow: 4, tag: "Jambes", title: "Jambes + épaules · abdos", ex: [
    ["Presse à cuisses (Leg Press)", 4, "10–12", "2 min", "8", "Pas de squat lourd. Pieds à hauteur moyenne, bas du dos bien appuyé.", "https://boxlifemagazine.com/presse-a-cuisse/"],
    ["Leg Extension à une jambe (machine)", 3, "10–12 par jambe", "90 s", "8–9", "Jambe gauche d'abord, même nombre de reps à droite. Sans claquer le genou en haut.", "https://www.topendsports.com/fitness/technique/leg-extension.htm", "en"],
    ["Leg Curl assis (machine)", 3, "10–12", "90 s", "8–9", "Ischio-jambiers.", "https://boxlifemagazine.com/leg-curl-assis/"],
    ["Élévations latérales aux haltères (assis ou debout)", 4, "12–15", "60 s", "9", "Gauche d'abord si exécutées en alternance.", "https://nutriandco.com/fr/pages/elevations-laterales"],
    ["Élévations frontales à la poulie basse", 2, "12–15", "60 s", "9", "Faisceau antérieur, une main à la fois.", "https://fitwill.app/fr/exercise/2515/cable-front-raise/"]
  ]},
  { id: "samedi", short: "Sam", dow: 6, tag: "Push B", title: "Push B · pecs, épaules, haut du dos", ex: [
    ["Développé incliné à la Smith Machine ou machine inclinée", 4, "8–10", "2 min", "8", "Haut des pecs. Stable si fatigué.", "https://fitwill.app/fr/exercise/0757/smith-incline-bench-press/"],
    ["Développé couché haltères (banc plat)", 3, "8–10", "2 min", "8", "Haltères indépendants, mêmes reps des deux côtés.", "https://nutriandco.com/fr/pages/developpe-couche-haltere"],
    ["Pec Deck (butterfly) à la machine", 3, "12–15", "60 s", "9", "Contraction interne en fin de mouvement.", "https://www.fitadium.com/conseils/pec-deck-butterfly/"],
    ["Dips lestés ou assistés (barres parallèles)", 3, "8–12", "90 s", "8–9", "Pecs bas. Buste légèrement penché, arrêter si douleur d'épaule.", "https://www.fitadium.com/conseils/dips-barres-paralleles"],
    ["Élévations latérales à la poulie, une main (bras devant le corps)", 4, "12–15", "60 s", "9", "Gauche d'abord.", "https://fitwill.app/fr/exercise/2231/cable-one-arm-lateral-raise/"],
    ["Développé militaire machine (Shoulder Press)", 3, "10–12", "90 s", "8", "Charge sans compression de la colonne.", "https://bodybuilding.com/exercises/machine-shoulder-military-press", "en"],
    ["Rowing barre T ou rowing à la poulie, prise large", 3, "10–12", "90 s", "8", "Épaisseur du haut du dos.", "https://quentin-fitlife.fr/entrainement/exercices-musculation/rowing-t-bar-machine/"]
  ]}
];

var APP_VERSION = "2.6";
/* Nom historique de la clé de stockage : on le garde tel quel pour ne perdre aucune donnée existante. */
var STORE_KEY = "basicfit-v1";
var MAPS = ["sets", "load", "logs", "hist", "warm", "meta", "weight", "programs"];
var WEEK_MIN = -52, WEEK_MAX = 8;

function $(id) { return document.getElementById(id); }

/* ---------- Données ---------- */
var store = {};
try { store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; } catch (e) { store = {}; }
MAPS.forEach(function (k) { if (!store[k] || typeof store[k] !== "object") store[k] = {}; });

/* Date de première utilisation : les séances antérieures ne sont jamais proposées « en retard ». */
if (!store.meta.start) { store.meta.start = dateKey(new Date()); try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {} }

var DAYS = DEFAULT_DAYS; // programme actif (voir « Programmes » plus bas)

var rev = 0;          // compteur de modifications locales (utilisé par la synchro)
var afterSave = null; // crochet appelé après chaque sauvegarde (défini par sync.js)

function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {} }
function save() { rev++; persist(); if (afterSave) afterSave(); }
function getData() { var d = {}; MAPS.forEach(function (k) { d[k] = store[k]; }); return d; }
function applyData(d) {
  var before = JSON.stringify(getData());
  MAPS.forEach(function (k) { store[k] = (d && d[k] && typeof d[k] === "object") ? d[k] : {}; });
  if (JSON.stringify(getData()) === before) return false;
  persist();
  refreshProgram();
  refreshAll();
  return true;
}

/* ---------- Dates ---------- */
function pad2(n) { return String(n).padStart(2, "0"); }
function dateKey(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
function parseKey(k) { return new Date(k + "T00:00:00"); }
function mondayOf(offset) {
  var d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7);
  return d;
}
function dayDate(day, offset) { var d = mondayOf(offset); d.setDate(d.getDate() + day.dow - 1); return d; }
function weekOffsetOf(key) {
  var t = parseKey(key); t.setDate(t.getDate() - ((t.getDay() + 6) % 7));
  return Math.round((t - mondayOf(0)) / (7 * 864e5));
}
function fmtDate(k) { return parseKey(k).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }); }
function fmtLong(k) { return parseKey(k).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); }

/* ---------- Utilitaires ---------- */
function numLoad(v) { var n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? null : n; }
function fmtNum(n) { return String(Math.round(n * 100) / 100).replace(".", ","); }
function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
function pop(b) {
  b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
}
function svgEl(tag) { return document.createElementNS("http://www.w3.org/2000/svg", tag); }
function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } }
var reduceMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
function onMedia(mq, fn) { if (mq.addEventListener) mq.addEventListener("change", fn); else if (mq.addListener) mq.addListener(fn); }
function restSeconds(t) {
  var m = /(\d+)\s*min/.exec(t); if (m) return +m[1] * 60;
  var s = /(\d+)\s*s/.exec(t); return s ? +s[1] : 60;
}

/* ---------- Charges ---------- */
function loadDates(name) { var h = store.hist[name] || {}; return Object.keys(h).filter(function (k) { return h[k]; }).sort(); }
function getLoad(name, date) { return (store.hist[name] && store.hist[name][date]) || ""; }
function setLoad(name, date, v) {
  v = String(v).trim();
  var h = store.hist[name] || (store.hist[name] = {});
  if (v) h[date] = v; else delete h[date];
  if (!Object.keys(h).length) delete store.hist[name];
  var ds = loadDates(name);
  store.load[name] = ds.length ? store.hist[name][ds[ds.length - 1]] : "";
}
function lastBefore(name, date) {
  var ds = loadDates(name).filter(function (k) { return k < date; });
  if (ds.length) return { date: ds[ds.length - 1], value: store.hist[name][ds[ds.length - 1]] };
  if (!store.hist[name] && store.load[name]) return { date: null, value: store.load[name] };
  return null;
}
function diffLoad(a, b) {
  var x = numLoad(a), y = numLoad(b);
  if (x === null || y === null) return null;
  var d = x - y; if (d === 0) return "identique";
  return (d > 0 ? "+" : "") + fmtNum(d) + " kg";
}

/* ---------- Séries et séances ---------- */
function exKey(day, i) { var x = day.ex[i]; return (x && x[8]) || i; } // programme d'origine : index, comme avant
function setKey(date, day, i, n) { return date + ":" + day.id + ":" + exKey(day, i) + ":" + n; }
function roundKey(date, day, n) { return date + ":" + day.id + ":c:" + n; }
function warmKey(date, day) { return date + ":" + day.id; }

function countDone(day, date) {
  var done = 0, total = 0, i, n, r;
  for (i = 0; i < day.ex.length; i++) for (n = 0; n < day.ex[i][1]; n++) { total++; if (store.sets[setKey(date, day, i, n)]) done++; }
  for (r = 0; r < CIRCUIT.rounds; r++) { total++; if (store.sets[roundKey(date, day, r)]) done++; }
  return { done: done, total: total };
}
function exDone(day, date, i) {
  for (var n = 0; n < day.ex[i][1]; n++) if (!store.sets[setKey(date, day, i, n)]) return false;
  return true;
}
function isComplete(day, date) { var c = countDone(day, date); return c.done === c.total; }

/* Met l'historique en phase avec l'état réel : séance complète = ajoutée, sinon retirée. */
function updateLog(day, date) {
  var k = date + ":" + day.id;
  if (isComplete(day, date)) {
    var log = { date: date, id: day.id, title: day.tag, sets: countDone(day, date).total };
    if (day.p) { // programme personnalisé : on garde de quoi afficher la séance même si le programme est supprimé
      log.prog = store.programs[day.p] ? store.programs[day.p].name : "";
      log.ex = day.ex.map(function (x) { return x[0]; });
    }
    store.logs[k] = log;
  } else delete store.logs[k];
}

/* Les séances antérieures à la première utilisation (ou à l'activation du programme) ne sont jamais « en retard ». */
function lowerBound() {
  var a = store.meta.start || "", b = store.meta["pstart:" + activeId()] || "";
  return b > a ? b : a;
}

/* Prochaine séance : la première non terminée de la semaine en cours (jour prévu ou en retard),
   sinon le début de la semaine suivante. */
function nextSession() {
  for (var i = 0; i < DAYS.length; i++) {
    var dt = dateKey(dayDate(DAYS[i], 0));
    if (dt < lowerBound()) continue;
    if (!isComplete(DAYS[i], dt)) return { day: DAYS[i], week: 0, date: dt };
  }
  return { day: DAYS[0], week: 1, date: dateKey(dayDate(DAYS[0], 1)) };
}

/* ---------- État de l'interface ---------- */
var cur = DAYS[0], viewWeek = 0, activeTab = "home", armed = false, ui = null;
var tabScrollPositions = { home: 0, sessions: 0, progress: 0, programs: 0 };
var lastMainTab = "home"; // onglet d'où l'on est venu : sert au bouton « Retour » de la page Plans
function curDate() { return dateKey(dayDate(cur, viewWeek)); }

/* « programs » (Plans) n'est plus dans la barre : on y accède depuis l'avatar, comme à une page secondaire. */
function switchTab(tab) {
  if (activeTab) tabScrollPositions[activeTab] = window.scrollY;
  if (tab !== "programs") lastMainTab = tab;
  activeTab = tab;
  document.querySelectorAll(".view").forEach(function (v) { v.classList.toggle("active", v.id === tab); });
  document.querySelectorAll(".tabs button").forEach(function (b) {
    b.classList.toggle("active", b.dataset.tab === tab);
    if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  if (tab === "home") renderHome();
  if (tab === "progress") renderProgress(); // inclut l'historique
  if (tab === "programs") renderPrograms();
  if (tab === "sessions") requestWake(); else releaseWake();
  window.scrollTo({ top: tabScrollPositions[tab] || 0, behavior: "instant" }); // immédiat : pas d'animation pendant que la page change de hauteur
}

function refreshAll() {
  renderHome();
  refreshSession();
  if (activeTab === "progress") renderProgress();
  if (activeTab === "programs" && !editor) renderPrograms();
  paintProfile();
}

/* ---------- Semaine ---------- */
function makeWeek(target) {
  var box = $(target); box.innerHTML = "";
  var isHome = target === "homeWeek";
  box.style.gridTemplateColumns = "repeat(" + Math.max(1, Math.min(DAYS.length, 4)) + ", minmax(0, 1fr))";
  DAYS.forEach(function (d) {
    var date = dateKey(dayDate(d, isHome ? 0 : viewWeek));
    var active = d === cur && (isHome ? viewWeek === 0 : true);
    var b = el("button", (active ? "active " : "") + (isComplete(d, date) ? "is-done" : ""));
    b.type = "button";
    b.appendChild(el("b", null, d.short)); b.appendChild(el("small", null, d.tag));
    b.addEventListener("click", function () {
      cur = d;
      if (isHome) viewWeek = 0;
      buildSession();
      if (isHome) switchTab("sessions");
    });
    box.appendChild(b);
  });
}

function updateWeekNav() {
  var label = viewWeek === 0 ? "Cette semaine" : viewWeek === 1 ? "Semaine prochaine" : viewWeek === -1 ? "Semaine dernière"
    : viewWeek > 0 ? "Dans " + viewWeek + " semaines" : "Il y a " + (-viewWeek) + " semaines";
  var m = mondayOf(viewWeek), s = new Date(m); s.setDate(m.getDate() + 6);
  var f = { day: "numeric", month: "short" };
  $("weekLabel").textContent = label;
  $("weekRange").textContent = m.toLocaleDateString("fr-FR", f) + " – " + s.toLocaleDateString("fr-FR", f);
  $("weekToday").hidden = viewWeek === 0;
  $("weekPrev").disabled = viewWeek <= WEEK_MIN;
  $("weekNext").disabled = viewWeek >= WEEK_MAX;
}

/* ---------- Séance ---------- */
function howMenu(name, url, en) {
  var d = el("details", "how"); d.appendChild(el("summary", null, "Comment faire"));
  var links = el("div", "links");
  if (url) {
    var a = el("a", null, "Explication de l’exercice · " + host(url) + (en ? " · anglais" : ""));
    a.href = url; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a);
  }
  var y = el("a", null, "Vidéos de démonstration · YouTube");
  y.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(name.replace(/\s*\(.*?\)/g, "") + " exécution");
  y.target = "_blank"; y.rel = "noopener"; links.appendChild(y);
  d.appendChild(links); return d;
}

function scrollToCard(node) {
  if (!node) return;
  setTimeout(function () { try { node.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" }); } catch (e) { node.scrollIntoView(); } }, 250);
}

function buildSession() {
  armed = false;
  var day = cur, date = curDate();
  makeWeek("sessionWeek"); updateWeekNav();
  var root = $("sessionContent"); root.innerHTML = "";
  ui = { day: day, date: date, cards: [], circuitBtns: [] };

  var head = el("div", "session-head"), left = el("div");
  left.appendChild(el("div", "eyebrow", day.tag + " · " + fmtLong(date)));
  left.appendChild(el("h1", null, day.title));
  head.appendChild(left);
  ui.count = el("div", "count"); head.appendChild(ui.count); root.appendChild(head);
  var bar = el("div", "bar"); ui.fill = document.createElement("i"); bar.appendChild(ui.fill); root.appendChild(bar);
  ui.banner = el("div", "session-done", "Séance terminée ! Beau travail. Elle est ajoutée à ton historique.");
  ui.banner.hidden = true; root.appendChild(ui.banner);
  root.appendChild(el("div", "rule", RULE));

  /* Échauffement avec case à cocher */
  var warm = el("details", "warm"), ws = el("summary");
  ws.appendChild(el("span", null, "Échauffement · 8 à 10 min"));
  ui.warmBadge = el("span", "warm-badge", "Fait"); ws.appendChild(ui.warmBadge);
  warm.appendChild(ws);
  var ul = document.createElement("ul"); WARM.forEach(function (x) { ul.appendChild(el("li", null, x)); }); warm.appendChild(ul);
  var wl = el("label", "check"), wc = document.createElement("input");
  wc.type = "checkbox"; wl.appendChild(wc); wl.appendChild(document.createTextNode("Échauffement terminé"));
  wc.addEventListener("change", function () {
    var k = warmKey(date, day);
    if (wc.checked) store.warm[k] = true; else delete store.warm[k];
    save(); refreshSession();
    if (wc.checked) warm.open = false;
  });
  warm.appendChild(wl); root.appendChild(warm);
  ui.warm = warm; ui.warmCheck = wc;

  /* Exercices */
  day.ex.forEach(function (x, i) {
    var card = el("section", "exercise"); card.id = "ex" + i;
    card.appendChild(el("h3", "ex-title", x[0]));
    var meta = el("div", "meta");
    meta.appendChild(el("span", null, x[2] ? x[1] + " × " + x[2] : x[1] + (x[1] > 1 ? " séries" : " série")));
    if (x[3]) { var restSpan = el("span", null, x[3] + " "); restSpan.appendChild(el("small", null, "repos")); meta.appendChild(restSpan); }
    if (x[4]) meta.appendChild(el("span", null, "RPE " + x[4]));
    card.appendChild(meta);
    if (x[5]) card.appendChild(el("p", "note", x[5]));
    var controls = el("div", "ex-controls"), sets = el("div", "sets"), o = { card: card, btns: [], name: x[0] };

    for (var n = 0; n < x[1]; n++) (function (n) {
      var key = setKey(date, day, i, n), b = el("button", "set", String(n + 1));
      b.type = "button"; b.setAttribute("aria-label", x[0] + ", série " + (n + 1));
      b.addEventListener("animationend", function () { b.classList.remove("pop"); });
      b.addEventListener("click", function () {
        var on = !store.sets[key];
        if (on) store.sets[key] = 1; else delete store.sets[key];
        updateLog(day, date); save(); refreshSession();
        if (on) pop(b);
        unlockAudio(); requestWake();
        if (!on || isComplete(day, date)) { stopTimer(); return; }
        startTimer(restSeconds(x[3]));
        if (exDone(day, date, i)) scrollToCard(ui.cards[i + 1] ? ui.cards[i + 1].card : ui.circuitCard);
      });
      sets.appendChild(b); o.btns.push(b);
    })(n);
    controls.appendChild(sets);

    var lab = el("label", "load", "Charge"), inp = document.createElement("input"), hint = el("p", "hint");
    inp.type = "text"; inp.inputMode = "decimal"; inp.placeholder = "–"; inp.setAttribute("aria-label", "Charge en kg, " + x[0]);
    o.inp = inp;
    o.paintHint = function () {
      var prev = lastBefore(x[0], date);
      hint.hidden = !prev;
      if (!prev) return;
      hint.textContent = "";
      hint.appendChild(document.createTextNode(prev.date ? "Dernière fois (" + fmtDate(prev.date) + ") : " : "Dernière fois : "));
      hint.appendChild(el("b", null, prev.value + " kg"));
      var d = diffLoad(inp.value, prev.value);
      if (d !== null) {
        hint.appendChild(document.createTextNode(" · "));
        hint.appendChild(el("span", "delta " + (d.charAt(0) === "+" ? "up" : d === "identique" ? "same" : "down"), d));
      }
    };
    inp.addEventListener("input", function () { setLoad(x[0], date, inp.value); o.paintHint(); save(); });
    lab.appendChild(inp); controls.appendChild(lab);
    card.appendChild(controls); card.appendChild(hint);
    card.appendChild(howMenu(x[0], x[6], x[7] === "en"));
    root.appendChild(card); ui.cards.push(o);
  });

  /* Circuit abdos */
  var cc = el("section", "exercise circuit"); ui.circuitCard = cc;
  cc.appendChild(el("h3", "ex-title", "Circuit abdos · " + CIRCUIT.rounds + " tours"));
  cc.appendChild(el("p", "note", CIRCUIT.intro));
  var ol = document.createElement("ol");
  CIRCUIT.items.forEach(function (it) {
    var li = document.createElement("li"); li.style.margin = "9px 0";
    li.appendChild(el("b", null, it[0])); li.appendChild(el("p", "note", it[1] + " · " + it[2]));
    li.appendChild(howMenu(it[0], it[3], it[4] === "en")); ol.appendChild(li);
  });
  cc.appendChild(ol); cc.appendChild(el("p", "note", "Tours terminés"));
  var rs = el("div", "sets");
  for (var r = 0; r < CIRCUIT.rounds; r++) (function (r) {
    var key = roundKey(date, day, r), b = el("button", "set", String(r + 1));
    b.type = "button"; b.setAttribute("aria-label", "Circuit abdos, tour " + (r + 1));
    b.addEventListener("animationend", function () { b.classList.remove("pop"); });
    b.addEventListener("click", function () {
      var on = !store.sets[key];
      if (on) store.sets[key] = 1; else delete store.sets[key];
      updateLog(day, date); save(); refreshSession();
      if (on) pop(b);
      unlockAudio(); requestWake();
      if (on && r < CIRCUIT.rounds - 1 && !isComplete(day, date)) startTimer(CIRCUIT.restSec); else stopTimer();
    });
    rs.appendChild(b); ui.circuitBtns.push(b);
  })(r);
  cc.appendChild(rs); root.appendChild(cc);

  /* Réinitialisation (double confirmation) */
  var reset = el("button", "reset", "Réinitialiser les séries de cette séance"), disarm = null;
  reset.type = "button";
  reset.addEventListener("click", function () {
    if (!armed) {
      armed = true; reset.textContent = "Appuie encore pour confirmer";
      disarm = setTimeout(function () { armed = false; reset.textContent = "Réinitialiser les séries de cette séance"; }, 4000);
      return;
    }
    clearTimeout(disarm); armed = false; reset.textContent = "Réinitialiser les séries de cette séance";
    day.ex.forEach(function (x, i) { for (var n = 0; n < x[1]; n++) delete store.sets[setKey(date, day, i, n)]; });
    for (var r = 0; r < CIRCUIT.rounds; r++) delete store.sets[roundKey(date, day, r)];
    delete store.warm[warmKey(date, day)];
    delete store.logs[date + ":" + day.id];
    save(); stopTimer(); refreshSession();
  });
  root.appendChild(reset);

  refreshSession();
}

/* Met à jour uniquement ce qui change : pas de reconstruction, donc ni perte de focus ni repli des menus. */
function refreshSession() {
  if (!ui) return;
  var day = ui.day, date = ui.date, c = countDone(day, date), first = -1;
  ui.count.textContent = c.done + " / " + c.total + " séries";
  ui.fill.style.width = (100 * c.done / c.total) + "%";
  ui.cards.forEach(function (o, i) {
    var done = exDone(day, date, i);
    if (first < 0 && !done) first = i;
    o.btns.forEach(function (b, n) { b.setAttribute("aria-pressed", store.sets[setKey(date, day, i, n)] ? "true" : "false"); });
    o.card.classList.toggle("done", done);
    if (document.activeElement !== o.inp) o.inp.value = getLoad(o.name, date);
    o.paintHint();
  });
  ui.cards.forEach(function (o, i) { o.card.classList.toggle("current", i === first); });
  ui.circuitBtns.forEach(function (b, r) { b.setAttribute("aria-pressed", store.sets[roundKey(date, day, r)] ? "true" : "false"); });
  ui.banner.hidden = !isComplete(day, date);
  var w = !!store.warm[warmKey(date, day)];
  ui.warmCheck.checked = w; ui.warm.classList.toggle("is-done", w); ui.warmBadge.hidden = !w;
  makeWeek("sessionWeek");
}

/* ---------- Accueil ---------- */
function renderHome() {
  var h = new Date().getHours(), today = dateKey(new Date());
  var nm = profileName();
  $("greeting").textContent = (h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir") + (nm ? " " + nm : "") + ".";
  var doneToday = DAYS.some(function (d) { return dateKey(dayDate(d, 0)) === today && isComplete(d, today); });
  $("greetingSub").textContent = doneToday ? "Séance du jour terminée, bien joué." : "Prêt pour ta prochaine séance ?";

  makeWeek("homeWeek");
  var nx = nextSession(), d = nx.day;
  $("nextLabel").textContent = nx.date === today ? "TA SÉANCE DU JOUR" : nx.date < today ? "SÉANCE EN RETARD · " + fmtLong(nx.date).toUpperCase() : "TA PROCHAINE SÉANCE · " + fmtLong(nx.date).toUpperCase();
  $("nextTitle").textContent = d.tag;
  $("nextDesc").textContent = d.title;
  $("startNext").onclick = function () { cur = d; viewWeek = nx.week; buildSession(); switchTab("sessions"); };

  var logs = Object.keys(store.logs).map(function (k) { return store.logs[k]; });
  $("statSessions").textContent = logs.length;
  $("statSets").textContent = Object.keys(store.sets).filter(function (k) { return store.sets[k]; }).length;
  var mon = dateKey(mondayOf(0)), sun = dateKey(mondayOf(1));
  var ids = DAYS.map(function (d) { return d.id; });
  var count = logs.filter(function (x) { return x.date >= mon && x.date < sun && ids.indexOf(x.id) >= 0; }).length, goal = DAYS.length;
  $("weekGoalLabel").textContent = (activeId() === "default" ? "" : programName(activeId()) + " · ") + goal + (goal > 1 ? " séances" : " séance") + " / semaine";
  $("weekCount").textContent = count + " / " + goal;
  $("weekBar").style.width = Math.min(100, count * 100 / goal) + "%";
  $("weekRing").style.setProperty("--progress", Math.min(100, count * 100 / goal));
  $("statWeek").textContent = count + "/" + goal;
}

/* ---------- Historique ---------- */
/* Cartes à défilement horizontal, intégrées en bas de la page Progrès (appelée par renderProgress).
   Mêmes données qu'avant : date, séance, séries, programme, échauffement, charges, accès à la séance. */
function fmtCardDate(k) {
  var d = parseKey(k), o = { weekday: "short", day: "numeric", month: "short" };
  if (d.getFullYear() !== new Date().getFullYear()) o.year = "numeric";
  return d.toLocaleDateString("fr-FR", o);
}
function renderHistory() {
  var root = $("historyList"); root.innerHTML = "";
  var logs = Object.keys(store.logs).map(function (k) { return store.logs[k]; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  $("historyCount").textContent = logs.length ? logs.length + (logs.length > 1 ? " séances" : " séance") : "";
  if (!logs.length) { root.appendChild(el("div", "empty", "Tes séances terminées apparaîtront ici. Valide toutes les séries d’une séance pour l’enregistrer.")); return; }
  var scroller = el("div", "h-scroll");
  scroller.tabIndex = 0; scroller.setAttribute("role", "region"); scroller.setAttribute("aria-label", "Historique des séances, défilement horizontal");
  logs.forEach(function (log, idx) {
    var card = el("article", "h-card" + (idx === 0 ? " is-latest" : ""));
    var head = el("div", "h-head");
    head.appendChild(el("small", null, fmtCardDate(log.date))); head.appendChild(el("strong", null, log.title));
    card.appendChild(head);
    var meta = el("div", "h-meta");
    meta.appendChild(el("span", null, log.sets + (log.sets > 1 ? " séries" : " série")));
    if (log.prog) meta.appendChild(el("span", null, log.prog));
    if (store.warm[log.date + ":" + log.id]) meta.appendChild(el("span", "ok", "Échauffement fait"));
    card.appendChild(meta);
    var day = findDay(log.id);
    var names = day ? day.ex.map(function (x) { return x[0]; }) : (log.ex || []);
    var loads = names.filter(function (n) { return getLoad(n, log.date); });
    if (loads.length) {
      var ul = el("ul", "h-loads");
      loads.forEach(function (n) { var li = document.createElement("li"); li.appendChild(el("span", null, n)); li.appendChild(el("b", null, getLoad(n, log.date) + " kg")); ul.appendChild(li); });
      card.appendChild(ul);
    } else card.appendChild(el("p", "h-none", "Aucune charge enregistrée pour cette séance."));
    if (day && DAYS.some(function (d) { return d.id === day.id; })) {
      var open = el("button", "h-open", "Ouvrir cette séance"); open.type = "button";
      open.addEventListener("click", function () { cur = DAYS.filter(function (d) { return d.id === day.id; })[0]; viewWeek = weekOffsetOf(log.date); buildSession(); switchTab("sessions"); });
      card.appendChild(open);
    }
    scroller.appendChild(card);
  });
  root.appendChild(scroller);
}

/* ---------- Progression ---------- */
function loadItem(name) {
  var ds = loadDates(name), d = el("details", "lh"), s = el("summary"), right = el("b", null, "");
  s.appendChild(el("span", null, name));
  if (!ds.length) { right.textContent = store.load[name] + " kg"; s.appendChild(right); d.appendChild(s); return d; }
  var h = store.hist[name], last = h[ds[ds.length - 1]];
  right.textContent = last + " kg";
  if (ds.length > 1) { var df = diffLoad(last, h[ds[ds.length - 2]]); if (df && df !== "identique") right.appendChild(el("i", df.charAt(0) === "+" ? "up" : null, df)); }
  s.appendChild(right); d.appendChild(s);
  var best = null, bestDate = null;
  ds.forEach(function (k) { var v = numLoad(h[k]); if (v !== null && (best === null || v > best)) { best = v; bestDate = k; } });
  if (best !== null && ds.length > 1) {
    var rec = el("p", "hint rec"); rec.appendChild(document.createTextNode("Record : "));
    rec.appendChild(el("b", null, fmtNum(best) + " kg")); rec.appendChild(document.createTextNode(" (" + fmtDate(bestDate) + ")")); d.appendChild(rec);
  }
  var shown = ds.slice(-8), vals = shown.map(function (k) { return numLoad(h[k]); });
  var max = Math.max.apply(null, vals.filter(function (v) { return v !== null; }).concat([1]));
  var bars = el("div", "lbars");
  shown.forEach(function (k, i) {
    var col = document.createElement("div"), b = document.createElement("i"), dt = parseKey(k);
    col.appendChild(el("em", null, h[k]));
    b.style.height = (vals[i] === null ? 4 : Math.max(4, Math.round(vals[i] / max * 44))) + "px";
    col.appendChild(b); col.appendChild(el("small", null, dt.getDate() + "/" + (dt.getMonth() + 1))); bars.appendChild(col);
  });
  d.appendChild(bars); return d;
}

/* Charges regroupées par séance du programme. */
function renderLoads() {
  var list = $("loadsList"); list.innerHTML = "";
  function hasLoad(n) { return loadDates(n).length > 0 || !!store.load[n]; }
  var known = {}, any = false;
  DAYS.forEach(function (day) {
    var names = day.ex.map(function (x) { return x[0]; });
    names.forEach(function (n) { known[n] = 1; });
    names = names.filter(hasLoad);
    if (!names.length) return;
    any = true;
    list.appendChild(el("h2", "history-month", day.tag));
    names.forEach(function (n) { list.appendChild(loadItem(n)); });
  });
  var others = Object.keys(store.hist).concat(Object.keys(store.load)).filter(function (n, i, a) { return a.indexOf(n) === i && !known[n] && hasLoad(n); });
  if (others.length) {
    any = true; list.appendChild(el("h2", "history-month", "Autres exercices"));
    others.forEach(function (n) { list.appendChild(loadItem(n)); });
  }
  if (!any) list.appendChild(el("div", "empty", "Tes charges enregistrées apparaîtront ici."));
}

function weightDates() {
  return Object.keys(store.weight || {}).filter(function (k) {
    return /^\d{4}-\d{2}-\d{2}$/.test(k) && numLoad(store.weight[k]) !== null && numLoad(store.weight[k]) > 0;
  }).sort();
}
function weightDiff(a, b) {
  var x = numLoad(a), y = numLoad(b);
  if (x === null || y === null) return "";
  var d = Math.round((x - y) * 100) / 100;
  if (!d) return "0 kg";
  return (d < 0 ? "−" : "+") + fmtNum(Math.abs(d)) + " kg";
}
function renderWeight() {
  var summary = $("weightSummary"), chart = $("weightChart"), list = $("weightList");
  if (!summary || !chart || !list) return;
  summary.innerHTML = ""; chart.innerHTML = ""; list.innerHTML = "";
  var dates = weightDates(), shown = dates.slice(-12);
  if (!dates.length) {
    summary.appendChild(el("div", "empty", "Enregistre ta première pesée pour suivre ton évolution."));
    chart.appendChild(el("div", "empty", "La courbe apparaîtra ici."));
  } else {
    var latestDate = dates[dates.length - 1], latest = store.weight[latestDate], latestNum = numLoad(latest);
    var stats = el("div", "weight-stats");
    var main = el("div", "weight-main");
    main.appendChild(el("span", "muted", "Dernière pesée · " + fmtDate(latestDate)));
    main.appendChild(el("strong", null, fmtNum(latestNum) + " kg"));
    stats.appendChild(main);
    var previous = dates.length > 1 ? store.weight[dates[dates.length - 2]] : null;
    var first = dates.length > 1 ? store.weight[dates[0]] : null;
    var prevStat = el("div", "weight-change");
    prevStat.appendChild(el("span", "muted", "Depuis la précédente"));
    prevStat.appendChild(el("strong", null, previous === null ? "—" : weightDiff(latest, previous)));
    stats.appendChild(prevStat);
    var firstStat = el("div", "weight-change");
    firstStat.appendChild(el("span", "muted", "Depuis la première"));
    firstStat.appendChild(el("strong", null, first === null ? "—" : weightDiff(latest, first)));
    stats.appendChild(firstStat);
    summary.appendChild(stats);

    var vals = shown.map(function (k) { return numLoad(store.weight[k]); });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var w = 320, h = 176, left = 38, right = 12, top = 20, bottom = 30;
    var plotW = w - left - right, plotH = h - top - bottom;
    var range = max - min || Math.max(1, max * 0.02);
    var svg = svgEl("svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Évolution du poids sur les " + shown.length + " dernières pesées, de " + fmtNum(min) + " à " + fmtNum(max) + " kg");
    var minLabel = svgEl("text"); minLabel.setAttribute("x", "2"); minLabel.setAttribute("y", String(top + plotH)); minLabel.setAttribute("class", "weight-axis"); minLabel.textContent = fmtNum(min); svg.appendChild(minLabel);
    var maxLabel = svgEl("text"); maxLabel.setAttribute("x", "2"); maxLabel.setAttribute("y", String(top + 4)); maxLabel.setAttribute("class", "weight-axis"); maxLabel.textContent = fmtNum(max); svg.appendChild(maxLabel);
    var points = vals.map(function (v, i) {
      return { x: left + (shown.length < 2 ? plotW / 2 : i * plotW / (shown.length - 1)), y: top + (max - v) / range * plotH };
    });
    var line = svgEl("polyline");
    line.setAttribute("points", points.map(function (p) { return p.x + "," + p.y; }).join(" "));
    line.setAttribute("fill", "none"); line.setAttribute("stroke", "var(--accent)"); line.setAttribute("stroke-width", "2.5"); line.setAttribute("stroke-linecap", "round"); line.setAttribute("stroke-linejoin", "round"); svg.appendChild(line);
    points.forEach(function (p, i) {
      var c = svgEl("circle"); c.setAttribute("cx", p.x); c.setAttribute("cy", p.y); c.setAttribute("r", i === points.length - 1 ? "5.5" : "3"); c.setAttribute("fill", i === points.length - 1 ? "var(--accent)" : "var(--surface-1)");
      c.setAttribute("stroke", "var(--accent)"); c.setAttribute("stroke-width", i === points.length - 1 ? "2" : "1.5"); svg.appendChild(c);
      if (i === 0 || i === points.length - 1 || (shown.length > 6 && i % 3 === 0)) {
        var label = svgEl("text"); label.setAttribute("x", p.x); label.setAttribute("y", String(h - 8)); label.setAttribute("text-anchor", "middle"); label.setAttribute("class", "weight-date"); label.textContent = parseKey(shown[i]).getDate() + "/" + (parseKey(shown[i]).getMonth() + 1); svg.appendChild(label);
      }
    });
    chart.appendChild(svg);
  }
  if (!dates.length) return;
  list.appendChild(el("h3", null, "Pesées récentes"));
  dates.slice().reverse().slice(0, 12).forEach(function (date) {
    var row = el("div", "weight-row"), info = el("div", "weight-row-info");
    info.appendChild(el("strong", null, fmtNum(numLoad(store.weight[date])) + " kg"));
    info.appendChild(el("small", null, fmtLong(date)));
    var del = el("button", "weight-delete", "Supprimer");
    del.type = "button"; del.setAttribute("aria-label", "Supprimer la pesée du " + fmtLong(date));
    del.addEventListener("click", function () {
      if (!Object.prototype.hasOwnProperty.call(store.weight, date)) return;
      var previous = store.weight[date];
      delete store.weight[date]; save(); renderWeight();
      showToast("Pesée du " + fmtDate(date) + " supprimée", function () {
        if (store.weight[date]) return; // une nouvelle pesée a été saisie entre-temps : on ne l'écrase pas
        store.weight[date] = previous; save(); renderWeight();
      });
    });
    row.appendChild(info); row.appendChild(del); list.appendChild(row);
  });
}

function renderProgress() {
  var logs = Object.keys(store.logs);
  $("progressSessions").textContent = logs.length;
  $("progressSets").textContent = Object.keys(store.sets).filter(function (k) { return store.sets[k]; }).length;
  var chart = $("activityChart"); chart.innerHTML = "";
  var todayKey = dateKey(new Date()), monday = mondayOf(0), values = [];
  for (var i = 0; i < 7; i++) {
    var d = new Date(monday); d.setDate(monday.getDate() + i);
    var k = dateKey(d);
    var n = Object.keys(store.sets).filter(function (sk) { return sk.indexOf(k + ":") === 0 && store.sets[sk]; }).length;
    values.push({ key: k, count: n, isToday: k === todayKey });
  }
  var max = Math.max.apply(null, values.map(function (v) { return v.count; }).concat([1]));
  values.forEach(function (v, i) {
    var col = el("div", "col" + (v.isToday ? " today" : "")), bar = document.createElement("i");
    bar.style.height = (v.count ? Math.max(8, v.count / max * 100) : 4) + "%";
    bar.setAttribute("aria-label", v.count + " séries");
    col.appendChild(bar); col.appendChild(el("small", null, "LMMJVSD".charAt(i))); chart.appendChild(col);
  });
  renderLoads();
  renderWeight();
  renderHistory();
}

/* ---------- Minuteur de repos, son et écran allumé ---------- */
var tEl = $("timer"), tTime = $("timerTime"), tLab = $("timerLabel");
var tInt = null, tEnd = 0, tDuration = 0, tHide = null, audioCtx = null, wakeLock = null, wakePending = false;

function fmt(s) { return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function unlockAudio() {
  try {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch (e) {}
}
function beep() {
  try {
    if (!audioCtx) return;
    var t0 = audioCtx.currentTime;
    [0, 0.22, 0.44].forEach(function (t, k) {
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "sine"; o.frequency.value = k === 2 ? 1175 : 880;
      g.gain.setValueAtTime(0.0001, t0 + t);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + 0.18);
      o.connect(g); g.connect(audioCtx.destination); o.start(t0 + t); o.stop(t0 + t + 0.2);
    });
  } catch (e) {}
}
function requestWake() {
  try {
    if (!navigator.wakeLock || wakeLock || wakePending || document.visibilityState !== "visible") return;
    wakePending = true;
    navigator.wakeLock.request("screen").then(function (l) {
      wakePending = false; wakeLock = l;
      l.addEventListener("release", function () { wakeLock = null; });
    }).catch(function () { wakePending = false; });
  } catch (e) { wakePending = false; }
}
function releaseWake() { try { if (wakeLock) { wakeLock.release(); wakeLock = null; } } catch (e) {} }

function stopTimer() {
  if (tInt) clearInterval(tInt); tInt = null;
  clearTimeout(tHide); tEl.classList.remove("finished"); tEl.hidden = true;
}
function tick() {
  var left = Math.round((tEnd - Date.now()) / 1000);
  tEl.style.setProperty("--timer-progress", Math.max(0, Math.min(100, left / Math.max(1, tDuration) * 100)) + "%");
  if (left <= 0) {
    clearInterval(tInt); tInt = null;
    tTime.textContent = "0:00"; tLab.textContent = "Repos terminé"; tEl.classList.add("finished");
    beep(); try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
    tHide = setTimeout(function () { if (!tInt) stopTimer(); }, 8000);
    return;
  }
  tTime.textContent = fmt(left);
}
function startTimer(sec) {
  stopTimer();
  tDuration = sec; tEnd = Date.now() + sec * 1000;
  tEl.style.setProperty("--timer-progress", "100%"); tEl.hidden = false; tLab.textContent = "Repos";
  tick(); tInt = setInterval(tick, 500);
}

/* ---------- Sauvegarde / restauration ---------- */
function setDataStatus(t) { $("dataStatus").textContent = t; }
function downloadText(text, name) {
  var url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  var a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  setDataStatus("Sauvegarde exportée.");
}
function exportData() {
  var text = JSON.stringify({ app: "setly", format: 1, exportedAt: new Date().toISOString(), data: getData() }, null, 2);
  var name = "setly-sauvegarde-" + dateKey(new Date()) + ".json", file = null;
  try { file = new File([text], name, { type: "application/json" }); } catch (e) {}
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: "Sauvegarde Setly" })
      .then(function () { setDataStatus("Sauvegarde exportée."); })
      .catch(function (e) { if (!e || e.name !== "AbortError") downloadText(text, name); });
    return;
  }
  downloadText(text, name);
}
function importData(file) {
  var r = new FileReader();
  r.onload = function () {
    try {
      var p = JSON.parse(r.result), d = p && p.data ? p.data : p;
      if (!d || typeof d !== "object" || !(d.sets || d.hist || d.logs)) throw new Error("format");
      if (!confirm("Remplacer les données de cet appareil par cette sauvegarde ?")) return;
      applyData(d); save(); setDataStatus("Sauvegarde restaurée.");
    } catch (e) { setDataStatus("Fichier non reconnu : import annulé."); }
    finally { $("importFile").value = ""; }
  };
  r.readAsText(file);
}

/* ---------- Mise à jour de l'app (service worker) ---------- */
var userAskedUpdate = false;
function showUpdate(worker) {
  $("updateBanner").hidden = false;
  $("updateBtn").onclick = function () { userAskedUpdate = true; worker.postMessage("SKIP_WAITING"); };
}
function setupServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("controllerchange", function () { if (userAskedUpdate) location.reload(); });
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
      reg.addEventListener("updatefound", function () {
        var w = reg.installing; if (!w) return;
        w.addEventListener("statechange", function () { if (w.state === "installed" && navigator.serviceWorker.controller) showUpdate(w); });
      });
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") reg.update().catch(function () {}); });
      reg.update().catch(function () {});
    }).catch(function () {});
  });
}

/* ---------- Programmes ---------- */
var DOW_LABELS = [null, "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
var DOW_SHORT = [null, "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
var editor = null;   // éditeur ouvert : { id, isNew, draft, dirty, errors }
var progNotice = ""; // message affiché en haut de la liste
var daysSig = "";

function rid() { return Math.random().toString(36).slice(2, 7); }
function newProgramId() { return "p" + Date.now().toString(36) + rid(); }
function activeId() { var id = store.meta.activeProgram; return id && store.programs[id] ? id : "default"; }
function programName(id) { return id === "default" ? "Mon programme" : (store.programs[id] ? store.programs[id].name : ""); }
function programDays(id) { return id === "default" ? DEFAULT_DAYS : ((store.programs[id] && store.programs[id].days) || DEFAULT_DAYS); }
function allProgramIds() {
  var ids = Object.keys(store.programs).sort(function (a, b) { return (store.programs[a].created || 0) - (store.programs[b].created || 0); });
  return ["default"].concat(ids);
}
function findDay(id) {
  var lists = [DEFAULT_DAYS].concat(Object.keys(store.programs).map(function (k) { return store.programs[k].days || []; }));
  for (var i = 0; i < lists.length; i++) for (var j = 0; j < lists[i].length; j++) if (lists[i][j].id === id) return lists[i][j];
  return null;
}

/* Aligne l'interface sur le programme actif (après activation, modification ou synchro). */
function refreshProgram() {
  var id = activeId(), days = programDays(id), sig = id + "|" + JSON.stringify(days), changed = sig !== daysSig;
  var curId = cur && cur.id;
  DAYS = days; daysSig = sig;
  var found = DAYS.filter(function (d) { return d.id === curId; })[0];
  if (found) cur = found;
  else { var f = nextSession(); cur = f.day; viewWeek = f.week; changed = true; }
  if (changed && ui) buildSession();
}

function activateProgram(id) {
  if (id === activeId()) return;
  store.meta.activeProgram = id;
  store.meta["pstart:" + id] = dateKey(new Date());
  save();
  refreshProgram();
  renderHome(); renderPrograms();
}

function cloneDays(src, pid) {
  return src.map(function (d) {
    return {
      id: pid + "." + rid(), short: DOW_SHORT[d.dow], dow: d.dow, tag: d.tag, title: d.title, p: pid,
      ex: d.ex.map(function (x) { return [x[0], x[1], x[2], x[3], x[4], x[5], x[6] || "", x[7] || "", "e" + rid() + rid()]; })
    };
  });
}

function duplicateProgram(fromId) {
  var pid = newProgramId();
  store.programs[pid] = { name: programName(fromId) + " (copie)", created: Date.now(), days: cloneDays(programDays(fromId), pid) };
  save();
  openEditor(pid, false);
}

function blankEx() { return { id: "e" + rid() + rid(), name: "", sets: 3, reps: "", rest: "", rpe: "", note: "", url: "", en: "" }; }
function freeDow(days) {
  for (var d = 1; d <= 7; d++) if (!days.some(function (x) { return x.dow === d; })) return d;
  return 1;
}
function blankDay(pid, days) {
  return { id: pid + "." + rid(), dow: freeDow(days), tag: "Séance " + (days.length + 1), title: "", ex: [blankEx()] };
}

function newProgram() {
  var pid = newProgramId(), draft = { name: "Nouveau programme", days: [] };
  draft.days.push(blankDay(pid, draft.days));
  editor = { id: pid, isNew: true, draft: draft, dirty: false, errors: [] };
  renderPrograms(); window.scrollTo({ top: 0, behavior: "instant" });
}

function openEditor(pid, isNew) {
  var p = store.programs[pid];
  var draft = {
    name: p.name,
    days: p.days.map(function (d) {
      return {
        id: d.id, dow: d.dow, tag: d.tag, title: d.title === d.tag ? "" : d.title,
        ex: d.ex.map(function (x) { return { id: x[8] || ("e" + rid() + rid()), name: x[0], sets: x[1], reps: x[2], rest: x[3], rpe: x[4], note: x[5], url: x[6] || "", en: x[7] || "" }; })
      };
    })
  };
  editor = { id: pid, isNew: !!isNew, draft: draft, dirty: false, errors: [] };
  renderPrograms(); window.scrollTo({ top: 0, behavior: "instant" });
}

function validateDraft(d) {
  var errs = [], used = {};
  if (!d.name.trim()) errs.push("Le nom du programme est obligatoire.");
  if (!d.days.length) errs.push("Ajoute au moins une séance.");
  d.days.forEach(function (day, i) {
    var label = "Séance " + (i + 1) + (day.tag.trim() ? " (" + day.tag.trim() + ")" : "");
    if (!day.tag.trim()) errs.push("Séance " + (i + 1) + " : le nom est obligatoire.");
    if (used[day.dow]) errs.push(label + " : le jour " + DOW_LABELS[day.dow].toLowerCase() + " est déjà pris par une autre séance.");
    used[day.dow] = true;
    if (!day.ex.length) errs.push(label + " : ajoute au moins un exercice.");
    day.ex.forEach(function (x, j) {
      var xl = label + ", exercice " + (j + 1);
      if (!x.name.trim()) errs.push(xl + " : le nom est obligatoire.");
      var n = parseInt(x.sets, 10);
      if (!(n >= 1 && n <= 10)) errs.push(xl + " : le nombre de séries doit être entre 1 et 10.");
    });
  });
  return errs;
}

function saveEditor() {
  var d = editor.draft;
  editor.errors = validateDraft(d);
  if (editor.errors.length) { renderPrograms(); window.scrollTo({ top: 0, behavior: "instant" }); return; }
  var pid = editor.id, existing = store.programs[pid];
  var days = d.days.slice().sort(function (a, b) { return a.dow - b.dow; }).map(function (day) {
    return {
      id: day.id, short: DOW_SHORT[day.dow], dow: day.dow, tag: day.tag.trim(), title: day.title.trim() || day.tag.trim(), p: pid,
      ex: day.ex.map(function (x) { return [x.name.trim(), parseInt(x.sets, 10), x.reps.trim(), x.rest.trim(), x.rpe.trim(), x.note.trim(), x.url.trim(), x.en || "", x.id]; })
    };
  });
  store.programs[pid] = { name: d.name.trim(), created: existing ? existing.created : Date.now(), days: days };
  save();
  progNotice = "Programme « " + d.name.trim() + " » enregistré.";
  editor = null;
  refreshProgram(); renderHome(); renderPrograms();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function closeEditor() {
  if (editor.dirty && !confirm("Abandonner les modifications non enregistrées ?")) return;
  editor = null; progNotice = ""; renderPrograms();
}

function renamePrompt(id) {
  var nn = prompt("Nom du programme :", store.programs[id].name);
  if (nn === null) return;
  nn = nn.trim(); if (!nn) return;
  store.programs[id].name = nn; save(); renderHome(); renderPrograms();
}

/* Suppression réversible : pas de boîte de dialogue, un bandeau « Annuler » pendant quelques secondes.
   L'historique et les charges ne sont jamais touchés. */
function deleteProgram(id) {
  var prog = store.programs[id];
  if (!prog) return;
  var wasActive = store.meta.activeProgram === id, pstart = store.meta["pstart:" + id];
  delete store.programs[id]; delete store.meta["pstart:" + id];
  if (wasActive) store.meta.activeProgram = "default";
  save(); progNotice = "";
  refreshProgram(); renderHome(); renderPrograms();
  showToast("Programme « " + prog.name + " » supprimé", function () {
    store.programs[id] = prog;
    if (pstart) store.meta["pstart:" + id] = pstart;
    if (wasActive) store.meta.activeProgram = id;
    save(); refreshProgram(); renderHome();
    if (activeTab === "programs" && !editor) renderPrograms();
  });
}

/* --- Rendu --- */
function btn(cls, label, fn) { var b = el("button", cls, label); b.type = "button"; b.addEventListener("click", fn); return b; }

function renderPrograms() {
  var root = $("programsRoot"); if (!root) return;
  root.innerHTML = "";
  $("programsHead").hidden = !!editor;
  if (editor) renderEditor(root); else renderProgramList(root);
}

function renderProgramList(root) {
  var act = activeId();
  if (progNotice) root.appendChild(el("div", "session-done", progNotice));
  var create = el("div", "prog-create");
  create.appendChild(btn("ghost", "Copier le programme actif", function () { progNotice = ""; duplicateProgram(act); }));
  create.appendChild(btn("ghost", "Partir de zéro", function () { progNotice = ""; newProgram(); }));
  root.appendChild(create);
  allProgramIds().forEach(function (id) {
    var days = programDays(id), locked = id === "default", isActive = id === act;
    var nEx = days.reduce(function (a, d) { return a + d.ex.length; }, 0);
    var card = el("section", "prog-card" + (isActive ? " is-active" : ""));
    var head = el("div", "prog-head");
    head.appendChild(el("h3", null, programName(id)));
    if (isActive) head.appendChild(el("span", "prog-badge", "Actif"));
    if (locked) head.appendChild(el("span", "prog-badge muted-badge", "Verrouillé"));
    card.appendChild(head);
    card.appendChild(el("p", "note", days.length + (days.length > 1 ? " séances" : " séance") + " · " + nEx + (nEx > 1 ? " exercices" : " exercice") + " · " + days.map(function (d) { return d.short; }).join(" ")));
    var actions = el("div", "prog-actions");
    if (!isActive) actions.appendChild(btn("primary small", "Activer", function () { progNotice = ""; activateProgram(id); }));
    if (!locked) actions.appendChild(btn("ghost", "Modifier", function () { progNotice = ""; openEditor(id, false); }));
    actions.appendChild(btn("ghost", "Dupliquer", function () { progNotice = ""; duplicateProgram(id); }));
    if (!locked) actions.appendChild(btn("ghost", "Renommer", function () { renamePrompt(id); }));
    if (!locked) actions.appendChild(btn("ghost danger", "Supprimer", function () { deleteProgram(id); }));
    card.appendChild(actions);
    root.appendChild(card);
  });
}

function rerenderEditor() {
  var y = window.scrollY; renderPrograms(); window.scrollTo({ top: y, behavior: "instant" });
}
function touch() { editor.dirty = true; }

function field(label, input, cls) {
  var l = el("label", "pf" + (cls ? " " + cls : "")); l.appendChild(el("span", null, label)); l.appendChild(input); return l;
}
function textField(label, value, onChange, cls, placeholder) {
  var i = document.createElement("input"); i.type = "text"; i.value = value || ""; if (placeholder) i.placeholder = placeholder;
  i.autocomplete = "off";
  i.addEventListener("input", function () { onChange(i.value); touch(); });
  return field(label, i, cls);
}
function selectField(label, options, value, onChange, cls) {
  var s = document.createElement("select");
  options.forEach(function (o) { var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; if (String(o[0]) === String(value)) op.selected = true; s.appendChild(op); });
  s.addEventListener("change", function () { onChange(s.value); touch(); });
  return field(label, s, cls);
}

function renderEditor(root) {
  var d = editor.draft;
  var top = el("div", "prog-top");
  top.appendChild(btn("linkbtn back", "‹ Programmes", closeEditor));
  top.appendChild(btn("primary small", "Enregistrer", saveEditor));
  root.appendChild(top);
  root.appendChild(el("h1", "page-title", editor.isNew ? "Nouveau programme" : "Modifier le programme"));
  if (editor.errors.length) {
    var box = el("div", "prog-errors"); box.setAttribute("role", "alert");
    box.appendChild(el("b", null, "À corriger avant d'enregistrer :"));
    var ul = document.createElement("ul"); editor.errors.forEach(function (m) { ul.appendChild(el("li", null, m)); });
    box.appendChild(ul); root.appendChild(box);
  }
  var nameBox = el("section", "panel");
  nameBox.appendChild(textField("Nom du programme", d.name, function (v) { d.name = v; }, "", "Ex. Prise de masse"));
  root.appendChild(nameBox);

  d.days.forEach(function (day, di) {
    var sec = el("section", "prog-day");
    var h = el("div", "prog-head");
    h.appendChild(el("h3", null, "Séance " + (di + 1)));
    h.appendChild(btn("ghost danger small", "Supprimer la séance", function () {
      if (!confirm("Supprimer cette séance du programme ?")) return;
      d.days.splice(di, 1); touch(); rerenderEditor();
    }));
    sec.appendChild(h);
    sec.appendChild(textField("Nom de la séance", day.tag, function (v) { day.tag = v; }, "", "Ex. Push A"));
    sec.appendChild(textField("Description (facultatif)", day.title, function (v) { day.title = v; }, "", "Ex. Pecs, épaules, triceps"));
    sec.appendChild(selectField("Jour de la semaine", DOW_LABELS.slice(1).map(function (l, i) { return [i + 1, l]; }), day.dow, function (v) { day.dow = parseInt(v, 10); }));

    day.ex.forEach(function (x, xi) {
      var ex = el("div", "prog-ex");
      var eh = el("div", "prog-head");
      eh.appendChild(el("h4", null, "Exercice " + (xi + 1)));
      var tools = el("div", "prog-tools");
      var up = btn("icon-btn", "↑", function () { if (xi < 1) return; day.ex.splice(xi - 1, 0, day.ex.splice(xi, 1)[0]); touch(); rerenderEditor(); });
      up.setAttribute("aria-label", "Monter l'exercice " + (xi + 1)); up.disabled = xi === 0;
      var dn = btn("icon-btn", "↓", function () { if (xi >= day.ex.length - 1) return; day.ex.splice(xi + 1, 0, day.ex.splice(xi, 1)[0]); touch(); rerenderEditor(); });
      dn.setAttribute("aria-label", "Descendre l'exercice " + (xi + 1)); dn.disabled = xi === day.ex.length - 1;
      var rm = btn("icon-btn danger", "✕", function () { day.ex.splice(xi, 1); touch(); rerenderEditor(); });
      rm.setAttribute("aria-label", "Supprimer l'exercice " + (xi + 1));
      tools.appendChild(up); tools.appendChild(dn); tools.appendChild(rm); eh.appendChild(tools);
      ex.appendChild(eh);
      ex.appendChild(textField("Nom de l'exercice", x.name, function (v) { x.name = v; }, "", "Ex. Développé couché"));
      var grid = el("div", "pf-grid");
      grid.appendChild(selectField("Séries", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { return [n, String(n)]; }), x.sets, function (v) { x.sets = parseInt(v, 10); }));
      grid.appendChild(textField("Répétitions", x.reps, function (v) { x.reps = v; }, "", "8–10"));
      grid.appendChild(textField("Repos", x.rest, function (v) { x.rest = v; }, "", "90 s"));
      grid.appendChild(textField("RPE", x.rpe, function (v) { x.rpe = v; }, "", "8"));
      ex.appendChild(grid);
      ex.appendChild(textField("Note (facultatif)", x.note, function (v) { x.note = v; }));
      ex.appendChild(textField("Lien d'explication (facultatif)", x.url, function (v) { x.url = v; }, "", "https://…"));
      sec.appendChild(ex);
    });
    sec.appendChild(btn("ghost add", "+ Ajouter un exercice", function () { day.ex.push(blankEx()); touch(); rerenderEditor(); }));
    root.appendChild(sec);
  });

  if (d.days.length < 7) root.appendChild(btn("ghost add", "+ Ajouter une séance", function () { d.days.push(blankDay(editor.id, d.days)); touch(); rerenderEditor(); }));
  var bottom = el("div", "prog-bottom");
  bottom.appendChild(btn("primary", "Enregistrer le programme", saveEditor));
  bottom.appendChild(btn("ghost", "Annuler", closeEditor));
  root.appendChild(bottom);
  root.appendChild(el("p", "hint", "Les séances sont classées par jour de la semaine. L'échauffement et le circuit d'abdos sont communs à tous les programmes."));
}

/* ---------- Bandeau d'annulation ---------- */
var toastEl = $("toast"), toastMsg = $("toastMsg"), toastUndo = $("toastUndo"), toastTimer = null, toastHide = null, toastAction = null;
function showToast(message, undo) {
  clearTimeout(toastTimer); clearTimeout(toastHide);
  toastAction = undo || null;
  toastMsg.textContent = message;
  toastUndo.hidden = !undo;
  toastEl.hidden = false;
  void toastEl.offsetWidth; // le navigateur enregistre l'état de départ avant la transition
  toastEl.classList.add("show");
  toastTimer = setTimeout(hideToast, undo ? 7000 : 3000);
}
function hideToast() {
  clearTimeout(toastTimer);
  toastEl.classList.remove("show"); toastAction = null;
  toastHide = setTimeout(function () { toastEl.hidden = true; }, 300);
}
toastUndo.addEventListener("click", function () { var fn = toastAction; hideToast(); if (fn) fn(); });

/* ---------- Espace personnel (avatar) : ressort, glissement, vélocité ----------
   Une seule valeur p (0 = fermée, 1 = ouverte) pilote tout. Un ressort la fait évoluer ; le doigt peut l'attraper
   à tout moment (le ressort s'arrête, on repart de la valeur affichée) et la vitesse du lâcher est transmise au
   ressort suivant. Sur mobile : feuille du bas. Sur ≥ 900 px : popover ancré à l'avatar.
   Le contenu est un menu (page « menu ») + des pages indépendantes (.pp[data-page]) : Profil, Paramètres, Synchronisation ;
   « Plans » ouvre la page Plans de l'application. */
var sheet = (function () {
  var panel = $("cloudPanel"), scrim = $("cloudScrim"), toggle = $("cloudToggle"), grip = $("cloudGrip");
  if (!panel || !scrim || !toggle || !grip) return null;
  var mqDesk = window.matchMedia("(min-width: 900px)"), mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var p = 0, raf = 0, isOpen = false, drag = null;

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function rubberband(over, dim) { return (over * dim * 0.55) / (dim + 0.55 * Math.abs(over)); }
  function project(v) { return (v / 1000) * 0.998 / (1 - 0.998); } // px/s → px (décélération du défilement iOS)

  function paint() {
    var c = clamp01(p);
    scrim.style.opacity = String(c);
    if (mqReduce.matches) { panel.style.transform = ""; panel.style.opacity = String(c); }          // fondu, sans déplacement
    else if (mqDesk.matches) { panel.style.opacity = String(c); panel.style.transform = "scale(" + (0.96 + 0.04 * c) + ")"; }
    else { panel.style.opacity = ""; panel.style.transform = "translate3d(0," + ((1 - p) * panel.offsetHeight) + "px,0)"; }
  }

  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

  /* Desktop : le popover se place sous l'avatar, d'après sa position réelle (le bouton défile avec la page). */
  function placeDesk() {
    if (!mqDesk.matches) { clearPlace(); return; }
    var r = toggle.getBoundingClientRect();
    panel.style.left = "auto";
    panel.style.top = Math.round(r.bottom + 10) + "px";
    panel.style.right = Math.max(12, Math.round(window.innerWidth - r.right)) + "px";
  }
  function clearPlace() { panel.style.top = panel.style.right = panel.style.left = ""; }

  /* Pages internes : une seule visible à la fois, retour au menu par « ‹ Mon espace ». */
  function showPage(name, focusIt) {
    panel.querySelectorAll(".pp").forEach(function (s) { s.hidden = s.dataset.page !== name; });
    panel.scrollTop = 0;
    if (!focusIt) return;
    var target = name === "menu" ? panel.querySelector('[data-go="' + focusIt + '"]') : panel.querySelector('.pp[data-page="' + name + '"] .back-link');
    if (target) target.focus({ preventScroll: true });
  }
  panel.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () { showPage(b.dataset.go, true); }); });
  panel.querySelectorAll("[data-back]").forEach(function (b) { b.addEventListener("click", function () { showPage("menu", b.dataset.back); }); });
  panel.querySelector('[data-action="plans"]').addEventListener("click", function () { closeAndRestoreFocus(); switchTab("programs"); });

  /* Ressort amorti : response = rapidité (s), damping 1 = sans rebond. Part de la valeur courante, avec sa vitesse. */
  function spring(to, v0, response, damping, done) {
    stop();
    var w = 2 * Math.PI / response, k = w * w, c = 2 * damping * w;
    var x = p, v = v0 || 0, last = performance.now();
    function step(now) {
      var dt = Math.max(0, Math.min(0.032, (now - last) / 1000)); last = now;
      var n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;
      for (var i = 0; i < n; i++) { v += (-k * (x - to) - c * v) * h; x += v * h; }
      if (Math.abs(x - to) < 0.001 && Math.abs(v) < 0.02) { p = to; paint(); raf = 0; if (done) done(); return; }
      p = x; paint(); raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
  }

  function setOpen(next, v0, bounce) {
    isOpen = next;
    toggle.setAttribute("aria-expanded", String(next));
    if (next) {
      if (panel.hidden) { panel.hidden = false; p = 0; }
      placeDesk();
      scrim.hidden = mqDesk.matches;
      paint();
    }
    spring(next ? 1 : 0, v0, mqReduce.matches ? 0.14 : bounce ? 0.3 : 0.38, mqReduce.matches ? 1 : bounce ? 0.8 : 1, function () {
      if (isOpen) return;
      panel.hidden = true; scrim.hidden = true; panel.style.transform = ""; panel.style.opacity = ""; clearPlace();
    });
  }

  function closeAndRestoreFocus() {
    if (panel.contains(document.activeElement)) toggle.focus();
    setOpen(false);
  }

  toggle.addEventListener("click", function () {
    if (isOpen) { closeAndRestoreFocus(); return; }
    showPage("menu"); paintProfile(); // on rouvre toujours sur le menu, à jour
    setOpen(true);
  });
  scrim.addEventListener("click", function () { setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen) closeAndRestoreFocus(); });
  document.addEventListener("pointerdown", function (e) { // popover non bloquant : un appui à l'extérieur le referme
    if (isOpen && mqDesk.matches && !panel.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
  onMedia(mqDesk, function () { if (!panel.hidden) { scrim.hidden = mqDesk.matches; panel.style.transform = ""; placeDesk(); paint(); } });

  /* Glissement 1:1 depuis la poignée (mobile). On respecte l'endroit où le doigt a saisi la feuille. */
  grip.addEventListener("pointerdown", function (e) {
    if (mqDesk.matches || !isOpen) return;
    stop(); // interruption : on repart de p tel qu'affiché, même au milieu d'une animation
    grip.setPointerCapture(e.pointerId);
    drag = { id: e.pointerId, H: panel.offsetHeight, y0: e.clientY, p0: p, hist: [{ t: e.timeStamp, y: e.clientY }] };
  });
  grip.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var y = (1 - drag.p0) * drag.H + (e.clientY - drag.y0);
    if (y < 0) y = -rubberband(-y, drag.H); // résistance progressive au-delà du haut
    p = 1 - y / drag.H; paint();
    drag.hist.push({ t: e.timeStamp, y: e.clientY });
    while (drag.hist.length > 2 && e.timeStamp - drag.hist[0].t > 100) drag.hist.shift();
  });
  function release(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var h = drag.hist, a = h[0], b = h[h.length - 1], H = drag.H;
    drag = null;
    var v = b.t > a.t ? (b.y - a.y) / (b.t - a.t) * 1000 : 0;      // px/s, positif = vers le bas
    var yNow = (1 - p) * H, yEnd = yNow + project(v);               // où la feuille finirait son élan
    setOpen(1 - yEnd / H > 0.5, -v / H, true);                      // on choisit la cible d'après la projection, et on passe la vitesse
  }
  grip.addEventListener("pointerup", release);
  grip.addEventListener("pointercancel", release);

  return { open: function () { showPage("menu"); setOpen(true); }, close: function () { setOpen(false); } };
})();

/* ---------- Profil (prénom facultatif, stocké dans meta donc synchronisé) ---------- */
function profileName() { return String(store.meta.profileName || "").trim(); }
function paintProfile() {
  var nm = profileName(), ini = $("avatarInitial");
  ini.textContent = nm ? nm.charAt(0).toUpperCase() : ""; ini.hidden = !nm;
  document.querySelector(".avatar-ico").style.display = nm ? "none" : "";
  $("menuProfileValue").textContent = nm || "";
  var act = activeId();
  $("menuPlansValue").textContent = programName(act);
  if (document.activeElement !== $("profileName")) $("profileName").value = nm;
  $("profileSessions").textContent = Object.keys(store.logs).length;
  $("profileSince").textContent = store.meta.start ? parseKey(store.meta.start).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "–";
}

/* ---------- Démarrage ---------- */
document.addEventListener("touchstart", function () {}, { passive: true });
document.querySelectorAll(".tabs button").forEach(function (b) { b.addEventListener("click", function () { switchTab(b.dataset.tab); }); });
$("weekPrev").addEventListener("click", function () { viewWeek = Math.max(WEEK_MIN, viewWeek - 1); buildSession(); });
$("weekNext").addEventListener("click", function () { viewWeek = Math.min(WEEK_MAX, viewWeek + 1); buildSession(); });
$("weekToday").addEventListener("click", function () { viewWeek = 0; buildSession(); });
$("timerSkip").addEventListener("click", stopTimer);
$("exportBtn").addEventListener("click", exportData);
$("importBtn").addEventListener("click", function () { $("importFile").click(); });
$("importFile").addEventListener("change", function () { if (this.files && this.files[0]) importData(this.files[0]); });
$("weightDate").value = dateKey(new Date());
$("weightForm").addEventListener("submit", function (event) {
  event.preventDefault();
  var date = $("weightDate").value, raw = $("weightValue").value.trim().replace(",", ".");
  var value = Number(raw);
  if (!date || !/^\d{1,3}(\.\d{1,2})?$/.test(raw) || !isFinite(value) || value <= 0 || value > 500) {
    $("weightValue").setCustomValidity("Entre un poids valide en kg, par exemple 78,5.");
    $("weightValue").reportValidity(); $("weightValue").setCustomValidity(""); return;
  }
  store.weight[date] = fmtNum(value);
  save(); renderWeight(); $("weightValue").value = "";
});
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState !== "visible") return;
  if (tInt) tick();
  if (activeTab === "sessions") requestWake();
  if (activeTab === "home") renderHome();
});

refreshProgram();
var first = nextSession(); cur = first.day; viewWeek = first.week;
$("today").textContent = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
$("appVersion").textContent = "Setly v" + APP_VERSION;
$("programsBack").addEventListener("click", function () { switchTab(lastMainTab || "home"); });
$("profileName").addEventListener("input", function () {
  var v = this.value.trim().slice(0, 24);
  if (v) store.meta.profileName = v; else delete store.meta.profileName;
  save(); paintProfile(); renderHome();
});
renderHome(); buildSession(); paintProfile();

/* Bandeau sticky : on ne fait que poser/retirer .is-stuck (fond) quand la page a défilé ; la fixation elle-même est en CSS. */
(function () {
  var top = document.querySelector(".top"), stuck = false;
  function check() { var s = window.scrollY > 4; if (s !== stuck) { stuck = s; top.classList.toggle("is-stuck", s); } }
  window.addEventListener("scroll", check, { passive: true });
  check();
})();
setupServiceWorker();
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {}); } catch (e) {}

window.Setly = {
  version: APP_VERSION,
  getData: getData,
  applyData: applyData,
  getRev: function () { return rev; },
  onSave: function (fn) { afterSave = fn; }
};

})();
