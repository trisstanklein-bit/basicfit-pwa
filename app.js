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

var DAYS = [
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

var APP_VERSION = "2.0";
/* Nom historique de la clé de stockage : on le garde tel quel pour ne perdre aucune donnée existante. */
var STORE_KEY = "basicfit-v1";
var MAPS = ["sets", "load", "logs", "hist", "warm"];
var WEEK_MIN = -52, WEEK_MAX = 8;

function $(id) { return document.getElementById(id); }

/* ---------- Données ---------- */
var store = {};
try { store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; } catch (e) { store = {}; }
MAPS.forEach(function (k) { if (!store[k] || typeof store[k] !== "object") store[k] = {}; });

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
function svgEl(tag) { return document.createElementNS("http://www.w3.org/2000/svg", tag); }
function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } }
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
function setKey(date, day, i, n) { return date + ":" + day.id + ":" + i + ":" + n; }
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
  if (isComplete(day, date)) store.logs[k] = { date: date, id: day.id, title: day.tag, sets: countDone(day, date).total };
  else delete store.logs[k];
}

/* Prochaine séance : la première non terminée de la semaine en cours (jour prévu ou en retard),
   sinon le début de la semaine suivante. */
function nextSession() {
  for (var i = 0; i < DAYS.length; i++) {
    var dt = dateKey(dayDate(DAYS[i], 0));
    if (!isComplete(DAYS[i], dt)) return { day: DAYS[i], week: 0, date: dt };
  }
  return { day: DAYS[0], week: 1, date: dateKey(dayDate(DAYS[0], 1)) };
}

/* ---------- État de l'interface ---------- */
var cur = DAYS[0], viewWeek = 0, activeTab = "home", armed = false, ui = null;
var tabScrollPositions = { home: 0, sessions: 0, history: 0, progress: 0 };
function curDate() { return dateKey(dayDate(cur, viewWeek)); }

function switchTab(tab) {
  if (activeTab) tabScrollPositions[activeTab] = window.scrollY;
  activeTab = tab;
  document.querySelectorAll(".view").forEach(function (v) { v.classList.toggle("active", v.id === tab); });
  document.querySelectorAll(".tabs button").forEach(function (b) {
    b.classList.toggle("active", b.dataset.tab === tab);
    if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  if (tab === "home") renderHome();
  if (tab === "history") renderHistory();
  if (tab === "progress") renderProgress();
  if (tab === "sessions") requestWake(); else releaseWake();
  requestAnimationFrame(function () { window.scrollTo(0, tabScrollPositions[tab] || 0); });
}

function refreshAll() {
  renderHome();
  refreshSession();
  if (activeTab === "history") renderHistory();
  if (activeTab === "progress") renderProgress();
}

/* ---------- Semaine ---------- */
function makeWeek(target) {
  var box = $(target); box.innerHTML = "";
  var isHome = target === "homeWeek";
  DAYS.forEach(function (d) {
    var date = dateKey(dayDate(d, isHome ? 0 : viewWeek));
    var active = d === cur && (isHome ? viewWeek === 0 : true);
    var b = el("button", (active ? "active " : "") + (isComplete(d, date) ? "is-done" : ""));
    b.type = "button";
    b.innerHTML = "<b>" + d.short + "</b><small>" + d.tag + "</small>";
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
  var a = el("a", null, "Explication de l’exercice · " + host(url) + (en ? " · anglais" : ""));
  a.href = url; a.target = "_blank"; a.rel = "noopener"; links.appendChild(a);
  var y = el("a", null, "Vidéos de démonstration · YouTube");
  y.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(name.replace(/\s*\(.*?\)/g, "") + " exécution");
  y.target = "_blank"; y.rel = "noopener"; links.appendChild(y);
  d.appendChild(links); return d;
}

function scrollToCard(node) {
  if (!node) return;
  setTimeout(function () { try { node.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { node.scrollIntoView(); } }, 250);
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
    meta.innerHTML = "<span>" + x[1] + " × " + x[2] + "</span><span>" + x[3] + " <small>repos</small></span><span>RPE " + x[4] + "</span>";
    card.appendChild(meta);
    card.appendChild(el("p", "note", x[5]));
    var controls = el("div", "ex-controls"), sets = el("div", "sets"), o = { card: card, btns: [], name: x[0] };

    for (var n = 0; n < x[1]; n++) (function (n) {
      var key = setKey(date, day, i, n), b = el("button", "set", String(n + 1));
      b.type = "button"; b.setAttribute("aria-label", x[0] + ", série " + (n + 1));
      b.addEventListener("click", function () {
        var on = !store.sets[key];
        if (on) store.sets[key] = 1; else delete store.sets[key];
        updateLog(day, date); save(); refreshSession();
        unlockAudio(); requestWake();
        if (!on || isComplete(day, date)) { stopTimer(); return; }
        startTimer(restSeconds(x[3]));
        if (exDone(day, date, i)) scrollToCard(ui.cards[i + 1] ? ui.cards[i + 1].card : ui.circuitCard);
      });
      sets.appendChild(b); o.btns.push(b);
    })(n);
    controls.appendChild(sets);

    var lab = el("label", "load", "Charge"), inp = document.createElement("input"), hint = el("p", "hint");
    inp.type = "text"; inp.inputMode = "decimal"; inp.placeholder = "kg"; inp.setAttribute("aria-label", "Charge en kg, " + x[0]);
    o.inp = inp;
    o.paintHint = function () {
      var prev = lastBefore(x[0], date);
      hint.hidden = !prev;
      if (!prev) return;
      hint.textContent = "";
      hint.appendChild(document.createTextNode(prev.date ? "Dernière fois (" + fmtDate(prev.date) + ") : " : "Dernière fois : "));
      hint.appendChild(el("b", null, prev.value + " kg"));
      var d = diffLoad(inp.value, prev.value);
      if (d !== null) hint.appendChild(document.createTextNode(" · " + d));
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
    b.addEventListener("click", function () {
      var on = !store.sets[key];
      if (on) store.sets[key] = 1; else delete store.sets[key];
      updateLog(day, date); save(); refreshSession();
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
  $("greeting").textContent = h < 5 ? "Bonne nuit." : h < 12 ? "Bonjour." : h < 18 ? "Bon après-midi." : "Bonsoir.";
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
  var count = logs.filter(function (x) { return x.date >= mon && x.date < sun; }).length, goal = DAYS.length;
  $("weekCount").textContent = count + " / " + goal;
  $("weekBar").style.width = Math.min(100, count * 100 / goal) + "%";
  $("weekRing").style.setProperty("--progress", Math.min(100, count * 100 / goal));
  $("statWeek").textContent = count + "/" + goal;
}

/* ---------- Historique ---------- */
function renderHistory() {
  var root = $("historyList"); root.innerHTML = "";
  var logs = Object.keys(store.logs).map(function (k) { return store.logs[k]; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  if (!logs.length) { root.appendChild(el("div", "empty", "Tes séances terminées apparaîtront ici. Valide toutes les séries d’une séance pour l’enregistrer.")); return; }
  var groups = {};
  logs.forEach(function (log) { var key = log.date.slice(0, 7); (groups[key] || (groups[key] = [])).push(log); });
  Object.keys(groups).sort().reverse().forEach(function (monthKey) {
    root.appendChild(el("h2", "history-month", parseKey(monthKey + "-01").toLocaleDateString("fr-FR", { month: "long", year: "numeric" })));
    groups[monthKey].forEach(function (log) {
      var details = el("details", "history-entry"), summary = el("summary", "history-item");
      var left = el("div");
      left.appendChild(el("strong", null, log.title)); left.appendChild(el("small", null, fmtLong(log.date)));
      var right = el("div"); right.appendChild(el("small", null, log.sets + " séries"));
      var chevron = svgEl("svg");
      chevron.setAttribute("class", "history-chevron"); chevron.setAttribute("viewBox", "0 0 24 24"); chevron.setAttribute("fill", "none");
      chevron.setAttribute("stroke", "currentColor"); chevron.setAttribute("stroke-width", "1.75");
      chevron.setAttribute("stroke-linecap", "round"); chevron.setAttribute("stroke-linejoin", "round");
      var p = svgEl("path"); p.setAttribute("d", "m9 18 6-6-6-6"); chevron.appendChild(p);
      summary.appendChild(left); summary.appendChild(right); summary.appendChild(chevron);
      details.appendChild(summary);
      var detail = el("div", "history-detail");
      var day = DAYS.filter(function (d) { return d.id === log.id; })[0];
      if (day) {
        if (store.warm[log.date + ":" + log.id]) detail.appendChild(el("p", null, "Échauffement fait"));
        day.ex.forEach(function (ex) { var v = getLoad(ex[0], log.date); if (v) detail.appendChild(el("p", null, ex[0] + " · " + v + " kg")); });
      }
      if (!detail.childNodes.length) detail.appendChild(el("p", null, "Aucune charge enregistrée pour cette séance."));
      if (day) {
        var open = el("button", "linkbtn", "Ouvrir cette séance"); open.type = "button";
        open.addEventListener("click", function () { cur = day; viewWeek = weekOffsetOf(log.date); buildSession(); switchTab("sessions"); });
        detail.appendChild(open);
      }
      details.appendChild(detail); root.appendChild(details);
    });
  });
}

/* ---------- Progression ---------- */
function loadItem(name) {
  var ds = loadDates(name), d = el("details", "lh"), s = el("summary"), right = el("b", null, "");
  s.appendChild(el("span", null, name));
  if (!ds.length) { right.textContent = store.load[name] + " kg"; s.appendChild(right); d.appendChild(s); return d; }
  var h = store.hist[name], last = h[ds[ds.length - 1]];
  right.textContent = last + " kg";
  if (ds.length > 1) { var df = diffLoad(last, h[ds[ds.length - 2]]); if (df && df !== "identique") right.appendChild(el("i", null, df)); }
  s.appendChild(right); d.appendChild(s);
  var best = null, bestDate = null;
  ds.forEach(function (k) { var v = numLoad(h[k]); if (v !== null && (best === null || v > best)) { best = v; bestDate = k; } });
  if (best !== null && ds.length > 1) {
    var rec = el("p", "hint"); rec.appendChild(document.createTextNode("Record : "));
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

/* ---------- Démarrage ---------- */
document.querySelectorAll(".tabs button").forEach(function (b) { b.addEventListener("click", function () { switchTab(b.dataset.tab); }); });
$("weekPrev").addEventListener("click", function () { viewWeek = Math.max(WEEK_MIN, viewWeek - 1); buildSession(); });
$("weekNext").addEventListener("click", function () { viewWeek = Math.min(WEEK_MAX, viewWeek + 1); buildSession(); });
$("weekToday").addEventListener("click", function () { viewWeek = 0; buildSession(); });
$("timerSkip").addEventListener("click", stopTimer);
$("exportBtn").addEventListener("click", exportData);
$("importBtn").addEventListener("click", function () { $("importFile").click(); });
$("importFile").addEventListener("change", function () { if (this.files && this.files[0]) importData(this.files[0]); });
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState !== "visible") return;
  if (tInt) tick();
  if (activeTab === "sessions") requestWake();
  if (activeTab === "home") renderHome();
});

var first = nextSession(); cur = first.day; viewWeek = first.week;
$("today").textContent = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
$("appVersion").textContent = "Setly v" + APP_VERSION;
renderHome(); buildSession();
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
