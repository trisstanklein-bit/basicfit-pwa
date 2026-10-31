/* Setly — synchronisation Supabase (connexion + fusion des données entre appareils). */
(function () {
  "use strict";

  var S = window.Setly;
  if (!S) return;

  var SUPABASE_URL = "https://pnhhtjdptbuxvlrdmkky.supabase.co";
  var SUPABASE_KEY = "sb_publishable_gwjUz2xnmPAVDGI-QdzcJg_8xWHSf8Q"; // clé publique : la sécurité repose sur les règles RLS
  var CDN_FALLBACK = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
  var SEP = "\u0001";
  var BASE_PREFIX = "basicfit-base-v1:"; // dernier état synchronisé (par utilisateur)

  function $(id) { return document.getElementById(id); }

  var status = $("cloudStatus"), login = $("cloudLogin"), logout = $("cloudLogout"), setPwd = $("cloudSetPwd");
  var cloudToggle = $("cloudToggle"), cloudPanel = $("cloudPanel"), shortStatus = $("cloudShortStatus"), indicator = $("cloudIndicator");

  var svgBase = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var cloud = '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z"/>';
  var syncIcons = {
    idle: svgBase + cloud + "</svg>",
    "signed-out": svgBase + cloud + "</svg>",
    syncing: svgBase + '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3"/></svg>',
    offline: svgBase + cloud + '<path d="m4 4 16 16"/></svg>',
    error: svgBase + '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg>',
    success: svgBase + '<path d="m5 12 4 4L19 6"/></svg>'
  };
  var labels = { idle: "Compte", syncing: "Sync…", offline: "Hors ligne", error: "À vérifier", "signed-out": "Compte", success: "À jour" };

  var client = null, activeUser = null, syncing = false, again = false, syncTimer = null;

  cloudToggle.addEventListener("click", function () {
    var opening = cloudPanel.hidden;
    cloudPanel.hidden = !opening;
    cloudToggle.setAttribute("aria-expanded", String(opening));
  });

  function showStatus(message, state) {
    status.textContent = message;
    var s = state || (navigator.onLine ? (activeUser ? "idle" : "signed-out") : "offline");
    cloudToggle.dataset.state = s;
    indicator.innerHTML = syncIcons[s] || syncIcons.idle;
    shortStatus.textContent = labels[s] || "Compte";
  }

  /* ---------- Fusion à trois voies ----------
     On aplatit les données en paires clé → valeur, puis pour chaque clé :
     - si cet appareil n'a rien changé depuis la dernière synchro → on prend la version du cloud
       (y compris une suppression faite ailleurs) ;
     - sinon → la version de cet appareil l'emporte (y compris une suppression).
     Les modifications faites sur deux appareils différents sont donc conservées toutes les deux. */
  function flatten(d) {
    var f = {}, name;
    Object.keys(d.sets || {}).forEach(function (k) { if (d.sets[k]) f["s" + SEP + k] = "1"; });
    Object.keys(d.load || {}).forEach(function (k) { if (d.load[k]) f["l" + SEP + k] = String(d.load[k]); });
    Object.keys(d.logs || {}).forEach(function (k) { if (d.logs[k]) f["g" + SEP + k] = JSON.stringify(d.logs[k]); });
    Object.keys(d.warm || {}).forEach(function (k) { if (d.warm[k]) f["w" + SEP + k] = "1"; });
    Object.keys(d.meta || {}).forEach(function (k) { if (d.meta[k]) f["m" + SEP + k] = String(d.meta[k]); });
    Object.keys(d.programs || {}).forEach(function (id) { if (d.programs[id]) f["p" + SEP + id] = JSON.stringify(d.programs[id]); });
    Object.keys(d.weight || {}).forEach(function (date) { if (d.weight[date]) f["b" + SEP + date] = String(d.weight[date]); });
    Object.keys(d.hist || {}).forEach(function (n) {
      var h = d.hist[n] || {};
      Object.keys(h).forEach(function (date) { if (h[date]) f["h" + SEP + n + SEP + date] = String(h[date]); });
    });
    return f;
  }

  function unflatten(f) {
    var d = { sets: {}, load: {}, logs: {}, hist: {}, warm: {}, meta: {}, weight: {}, programs: {} };
    Object.keys(f).forEach(function (key) {
      var p = key.split(SEP), v = f[key];
      if (p[0] === "s") d.sets[p[1]] = 1;
      else if (p[0] === "l") d.load[p[1]] = v;
      else if (p[0] === "g") { try { d.logs[p[1]] = JSON.parse(v); } catch (e) {} }
      else if (p[0] === "w") d.warm[p[1]] = true;
      else if (p[0] === "m") d.meta[p[1]] = v;
      else if (p[0] === "b") d.weight[p[1]] = v;
      else if (p[0] === "p") { try { d.programs[p[1]] = JSON.parse(v); } catch (e) {} }
      else if (p[0] === "h") (d.hist[p[1]] || (d.hist[p[1]] = {}))[p[2]] = v;
    });
    // La « dernière charge » est toujours dérivée de l'historique.
    Object.keys(d.hist).forEach(function (n) {
      var ds = Object.keys(d.hist[n]).sort();
      if (ds.length) d.load[n] = d.hist[n][ds[ds.length - 1]];
    });
    return d;
  }

  function merge3(base, local, remote) {
    var keys = {}, out = {};
    [base, local, remote].forEach(function (m) { Object.keys(m).forEach(function (k) { keys[k] = 1; }); });
    Object.keys(keys).forEach(function (k) {
      var v = local[k] === base[k] ? remote[k] : local[k];
      if (k === "m" + SEP + "start") { // date de première utilisation : la plus ancienne l'emporte
        var c = [local[k], remote[k]].filter(Boolean).sort();
        v = c.length ? c[0] : v;
      }
      if (v !== undefined) out[k] = v;
    });
    return out;
  }

  function sameFlat(a, b) {
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every(function (k) { return a[k] === b[k]; });
  }

  function loadBase(uid) { try { return JSON.parse(localStorage.getItem(BASE_PREFIX + uid) || "{}") || {}; } catch (e) { return {}; } }
  function saveBase(uid, flat) { try { localStorage.setItem(BASE_PREFIX + uid, JSON.stringify(flat)); } catch (e) {} }

  window.SetlySync = { flatten: flatten, unflatten: unflatten, merge3: merge3 }; // exposé pour les tests

  /* ---------- Synchronisation ---------- */
  function scheduleSync(delay) {
    clearTimeout(syncTimer);
    if (!activeUser) return;
    syncTimer = setTimeout(function () {
      if (navigator.onLine) syncWithCloud(activeUser);
      else showStatus("Hors connexion · Modifications conservées sur cet appareil.", "offline");
    }, delay || 1000);
  }

  async function syncWithCloud(user) {
    if (!user) return;
    if (syncing) { again = true; return; }
    if (!navigator.onLine) { showStatus("Hors connexion · Modifications conservées sur cet appareil.", "offline"); return; }
    syncing = true;
    try {
      showStatus("Synchronisation en cours…", "syncing");

      var res = await client.from("workout_data").select("data").eq("user_id", user.id).maybeSingle();
      if (res.error) throw res.error;
      var hasRow = !!res.data;
      var remote = flatten((res.data && res.data.data) || {});

      // Tout ce qui suit est synchrone : aucune saisie ne peut s'intercaler entre la lecture locale et l'application.
      var merged = merge3(loadBase(user.id), flatten(S.getData()), remote);
      var mergedData = unflatten(merged);
      S.applyData(mergedData);

      if (!hasRow || !sameFlat(merged, remote)) {
        var up = await client.from("workout_data").upsert({ user_id: user.id, data: mergedData, updated_at: new Date().toISOString() });
        if (up.error) throw up.error;
      }
      saveBase(user.id, merged);
      showStatus("Synchronisé avec ton compte · " + user.email, "success");
    } catch (error) {
      console.error("Erreur de synchronisation :", error);
      showStatus(navigator.onLine ? "Synchronisation impossible · Modifications conservées sur cet appareil." : "Hors connexion · Modifications conservées sur cet appareil.",
        navigator.onLine ? "error" : "offline");
    } finally {
      syncing = false;
      if (again) { again = false; scheduleSync(300); }
    }
  }

  function start() {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    S.onSave(function () {
      if (!activeUser) return;
      if (navigator.onLine) scheduleSync(1000);
      else showStatus("Hors connexion · Modifications conservées sur cet appareil.", "offline");
    });

    window.addEventListener("online", function () {
      if (activeUser) { showStatus("Connexion retrouvée · Synchronisation…", "syncing"); scheduleSync(300); }
    });
    window.addEventListener("offline", function () {
      if (activeUser) showStatus("Hors connexion · Modifications conservées sur cet appareil.", "offline");
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && activeUser && navigator.onLine) scheduleSync(300);
    });

    $("cloudLinkBtn").addEventListener("click", async function () {
      var email = $("cloudEmail").value.trim();
      if (!email) { showStatus("Entre ton adresse e-mail.", "idle"); return; }
      showStatus("Envoi du lien de connexion…", "syncing");
      var r = await client.auth.signInWithOtp({
        email: email,
        options: { shouldCreateUser: false, emailRedirectTo: window.location.origin + window.location.pathname }
      });
      if (r.error) { showStatus("Erreur : " + r.error.message, "error"); return; }
      showStatus("Lien envoyé ! Ouvre ta boîte mail et clique dessus pour te connecter.", "idle");
    });

    $("cloudLoginBtn").addEventListener("click", async function () {
      var email = $("cloudEmail").value.trim(), password = $("cloudPassword").value;
      if (!email || !password) { showStatus("Entre ton adresse e-mail et ton mot de passe.", "idle"); return; }
      showStatus("Connexion…", "syncing");
      var r = await client.auth.signInWithPassword({ email: email, password: password });
      if (r.error) {
        showStatus(/invalid login/i.test(r.error.message) ? "Erreur : e-mail ou mot de passe incorrect." : "Erreur : " + r.error.message, "error");
        return;
      }
      $("cloudPassword").value = "";
    });

    $("cloudSetPwdBtn").addEventListener("click", async function () {
      var password = $("cloudNewPassword").value;
      if (password.length < 8) { showStatus("Erreur : le mot de passe doit faire au moins 8 caractères.", "error"); return; }
      var r = await client.auth.updateUser({ password: password });
      if (r.error) { showStatus("Erreur : " + r.error.message, "error"); return; }
      $("cloudNewPassword").value = "";
      showStatus("Mot de passe enregistré. Tu peux maintenant te connecter avec ton e-mail et ce mot de passe.", "success");
    });

    logout.addEventListener("click", async function () {
      var r = await client.auth.signOut();
      if (r.error) showStatus("Erreur de déconnexion : " + r.error.message, "error");
    });

    /* On ne synchronise qu'à l'arrivée d'un nouvel utilisateur : les événements répétés
       (retour au premier plan, renouvellement du jeton…) ne relancent pas de synchro. */
    client.auth.onAuthStateChange(function (event, session) {
      if (session && session.user) {
        var isNewUser = !activeUser || activeUser.id !== session.user.id;
        activeUser = session.user;
        login.hidden = true; logout.hidden = false; setPwd.hidden = false;
        if (isNewUser) {
          showStatus("Connexion réussie. Synchronisation…", "syncing");
          setTimeout(function () { syncWithCloud(session.user); }, 0); // jamais d'appel Supabase directement dans ce callback
        }
      } else {
        activeUser = null;
        login.hidden = false; logout.hidden = true; setPwd.hidden = true;
        showStatus("Non connecté · Données conservées sur cet appareil.", "signed-out");
      }
    });
  }

  function unavailable() {
    login.hidden = true;
    showStatus("Synchronisation indisponible : la bibliothèque n'a pas pu être chargée. Tes données restent sur cet appareil.", "error");
  }

  if (window.supabase && window.supabase.createClient) {
    start();
  } else {
    // Repli : le fichier local supabase.js est absent, on tente le CDN.
    var s = document.createElement("script");
    s.src = CDN_FALLBACK;
    s.onload = function () { if (window.supabase && window.supabase.createClient) start(); else unavailable(); };
    s.onerror = unavailable;
    document.head.appendChild(s);
  }
})();
