/* UP-HB Academy — sayfa arka plan müziği (klasik, telifsiz)
   Her sayfanın kendi 10 parçalık listesi var; her 40 sn'de sıradaki parçaya
   yumuşak geçişle döner. Köşede tek altın notalı altıgen buton ile aç/kapat.
   Ses ~%20, tercih (aç/kapa) sayfalar arası hatırlanır. Üreten: Fable (24.07.2026)
   Not: eski tek-parça (data-music) sistemi bu dosyayla değiştirildi. */
(function () {
  var PLAYLISTS = {"index":[{"file":"audio/index/01.mp3","label":"Çaykovski – Çiçek Valsi"},{"file":"audio/index/02.mp3","label":"Çaykovski – Kuğu Gölü"},{"file":"audio/index/03.mp3","label":"Satie – Gymnopédie No.1"},{"file":"audio/index/04.mp3","label":"Vivaldi – Dört Mevsim: Kış"},{"file":"audio/index/05.mp3","label":"Beethoven – Ay Işığı Sonatı"},{"file":"audio/index/06.mp3","label":"Grieg – Dağ Kralının Salonunda"},{"file":"audio/index/07.mp3","label":"Pachelbel – Kanon (Re Majör)"},{"file":"audio/index/08.mp3","label":"Bach – Orkestra Süiti No.2: Badinerie"},{"file":"audio/index/09.mp3","label":"Bach – Orkestra Süiti No.2"},{"file":"audio/index/10.mp3","label":"Beethoven – Für Elise"}],"platform":[{"file":"audio/platform/01.mp3","label":"Debussy – Ay Işığı (Clair de Lune)"},{"file":"audio/platform/02.mp3","label":"Brahms – Macar Dansı No.5"},{"file":"audio/platform/03.mp3","label":"Offenbach – Can-Can"},{"file":"audio/platform/04.mp3","label":"Rossini – William Tell: Final"},{"file":"audio/platform/05.mp3","label":"Mozart – Requiem: Lacrimosa"},{"file":"audio/platform/06.mp3","label":"Çaykovski – Kuğu Gölü"},{"file":"audio/platform/07.mp3","label":"Saint-Saëns – Danse Macabre"},{"file":"audio/platform/08.mp3","label":"Çaykovski – Kuğu Gölü"},{"file":"audio/platform/09.mp3","label":"Chopin – Nocturne Op.9 No.2"},{"file":"audio/platform/10.mp3","label":"Mahler – 5. Senfoni: Adagietto"}],"gun1":[{"file":"audio/gun1/01.mp3","label":"J. Strauss – Mavi Tuna"},{"file":"audio/gun1/02.mp3","label":"Beethoven – 5. Senfoni"},{"file":"audio/gun1/03.mp3","label":"Çaykovski – Fındıkkıran: Trepak"},{"file":"audio/gun1/04.mp3","label":"Debussy – Clair de Lune"},{"file":"audio/gun1/05.mp3","label":"Debussy – Arabesque No.1"},{"file":"audio/gun1/06.mp3","label":"Çaykovski – Şeker Perisi Dansı"},{"file":"audio/gun1/07.mp3","label":"Saint-Saëns – Danse Macabre"},{"file":"audio/gun1/08.mp3","label":"Satie – Gymnopédie No.1"},{"file":"audio/gun1/09.mp3","label":"Rossini – William Tell: Uvertür"},{"file":"audio/gun1/10.mp3","label":"Handel – Mesih: Hallelujah"}],"gun2":[{"file":"audio/gun2/01.mp3","label":"Saint-Saëns – Kuğu (Le Cygne)"},{"file":"audio/gun2/02.mp3","label":"Satie – Gymnopédie No.1"},{"file":"audio/gun2/03.mp3","label":"Beethoven – Ay Işığı Sonatı"},{"file":"audio/gun2/04.mp3","label":"Grieg – Dağ Kralının Salonunda"},{"file":"audio/gun2/05.mp3","label":"Mozart – Ave Verum Corpus"},{"file":"audio/gun2/06.mp3","label":"Handel/Halvorsen – Passacaglia"},{"file":"audio/gun2/07.mp3","label":"Verdi – Il Trovatore: Örs Korosu"},{"file":"audio/gun2/08.mp3","label":"Mozart – 25. Senfoni (Sol minör)"},{"file":"audio/gun2/09.mp3","label":"Chopin – Nocturne Op.9 No.2"},{"file":"audio/gun2/10.mp3","label":"J. Strauss – Mavi Tuna"}]};

  // sayfa tespiti (platform gövdesi 'page-gun2' de taşıdığı için önce ona bak)
  var cl = document.body.className || "";
  var page = /page-platform/.test(cl) ? "platform"
           : /page-index/.test(cl) ? "index"
           : /page-gun1/.test(cl) ? "gun1"
           : /page-gun2/.test(cl) ? "gun2" : "index";
  var PL = PLAYLISTS[page] || [];
  if (!PL.length) return;

  var TARGET = 0.20;      // arka plan ses seviyesi
  var SWITCH_MS = 40000;  // 40 sn'de bir parça değişir
  var FADE = 0.8;         // saniye — geçiş yumuşatma
  var KEY = "uphbMusic";  // aç/kapa tercihi (sayfalar arası)

  // ---- stil ----
  var HEX = "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)";
  var css = document.createElement("style");
  css.textContent =
    "#uphb-music{position:fixed;left:20px;bottom:20px;z-index:99999;display:flex;" +
    "align-items:center;gap:10px;font-family:inherit;}" +
    "#uphb-music .u-lbl{max-width:0;overflow:hidden;white-space:nowrap;opacity:0;" +
    "transition:max-width .5s ease,opacity .5s ease;font-size:12.5px;color:#f3e9d6;" +
    "background:rgba(18,12,24,.82);border:1px solid rgba(232,180,90,.35);" +
    "border-radius:20px;padding:0;line-height:34px;height:34px;backdrop-filter:blur(6px);}" +
    "#uphb-music.show-lbl .u-lbl{max-width:230px;opacity:1;padding:0 14px;}" +
    "#uphb-music button{all:unset;cursor:pointer;position:relative;width:58px;height:58px;" +
    "display:flex;align-items:center;justify-content:center;" +
    "filter:drop-shadow(0 5px 16px rgba(0,0,0,.5));transition:transform .2s ease;}" +
    "#uphb-music button:hover{transform:translateY(-2px) scale(1.06);}" +
    "#uphb-music button:focus-visible{outline:2px solid #00fff4;outline-offset:4px;border-radius:8px;}" +
    "#uphb-music .halo{position:absolute;inset:-6px;border-radius:50%;z-index:0;opacity:0;" +
    "background:conic-gradient(from 0deg,#00fff4,#df66bf,#ff2fa0,#e8b45a,#00fff4);" +
    "filter:blur(9px);transition:opacity .4s ease;}" +
    "#uphb-music.playing .halo{opacity:.85;animation:uphbSpin 5s linear infinite;}" +
    "#uphb-music .hexb{position:absolute;inset:0;z-index:1;clip-path:" + HEX + ";" +
    "background:conic-gradient(from 140deg,#00fff4,#df66bf,#ff2fa0,#e8b45a,#00fff4);}" +
    "#uphb-music .hexf{position:absolute;inset:2px;z-index:1;clip-path:" + HEX + ";" +
    "background:radial-gradient(circle at 50% 32%,#251528,#0b0710);}" +
    "#uphb-music .note{position:relative;z-index:2;width:23px;height:23px;color:#ff2fa0;" +
    "filter:drop-shadow(0 0 3px rgba(255,47,160,.6));" +
    "transition:color .3s,filter .3s,opacity .3s;}" +
    "#uphb-music.playing .note{color:#ff6ec7;" +
    "filter:drop-shadow(0 0 9px rgba(255,47,160,.95));animation:uphbPulse 1.7s ease-in-out infinite;}" +
    "#uphb-music.off .note{opacity:.9;filter:drop-shadow(0 0 2px rgba(255,47,160,.4));}" +
    "#uphb-music.off .hexb{background:linear-gradient(135deg,#453a4d,#2a2230);}" +
    "@keyframes uphbSpin{to{transform:rotate(360deg)}}" +
    "@keyframes uphbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.13)}}" +
    "@media(max-width:600px){#uphb-music button{width:50px;height:50px}" +
    "#uphb-music .note{width:20px;height:20px}" +
    "#uphb-music.show-lbl .u-lbl{max-width:150px}}";
  document.head.appendChild(css);

  // ---- DOM ----
  var wrap = document.createElement("div");
  wrap.id = "uphb-music";
  wrap.className = "off";
  wrap.innerHTML =
    '<button type="button" aria-label="Klasik müziği aç/kapat" title="Klasik müzik">' +
    '<span class="halo"></span><span class="hexb"></span><span class="hexf"></span>' +
    '<svg class="note" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path fill="currentColor" d="M12 3v10.28A3.5 3.5 0 1 0 13.5 16V7.5H18V3H12z"/></svg>' +
    '</button>' +
    '<span class="u-lbl"></span>';
  var btn = wrap.querySelector("button");
  var lbl = wrap.querySelector(".u-lbl");
  if (document.body) document.body.appendChild(wrap);
  else document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(wrap); });

  // ---- ses motoru (iki eleman ile çapraz geçiş) ----
  var el = [new Audio(), new Audio()];
  el.forEach(function (a) { a.preload = "auto"; a.volume = 0; });
  var cur = 0, idx = 0, playing = false, timer = null, lblTimer = null;

  function ramp(a, to, dur, done) {
    var from = a.volume, t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / (dur * 1000));
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }

  function showLabel(text) {
    lbl.textContent = "♪ " + text;
    wrap.classList.add("show-lbl");
    clearTimeout(lblTimer);
    lblTimer = setTimeout(function () { wrap.classList.remove("show-lbl"); }, 4500);
  }

  function playIndex(i) {
    var nx = el[1 - cur], old = el[cur];
    nx.src = PL[i].file; nx.currentTime = 0; nx.volume = 0;
    var p = nx.play();
    if (p && p.catch) p.catch(function () { waitGesture(); });
    ramp(nx, TARGET, FADE);
    ramp(old, 0, FADE, function () { try { old.pause(); } catch (e) {} });
    cur = 1 - cur; idx = i;
    showLabel(PL[i].label);
  }

  function nextTrack() { playIndex((idx + 1) % PL.length); }
  function schedule() { clearInterval(timer); timer = setInterval(nextTrack, SWITCH_MS); }

  function start() {
    playing = true;
    try { localStorage.setItem(KEY, "on"); } catch (e) {}
    wrap.classList.remove("off"); wrap.classList.add("playing");
    playIndex(idx); schedule();
  }

  function stop() {
    playing = false;
    try { localStorage.setItem(KEY, "off"); } catch (e) {}
    wrap.classList.remove("playing"); wrap.classList.add("off");
    clearInterval(timer);
    el.forEach(function (a) { ramp(a, 0, FADE, function () { try { a.pause(); } catch (e) {} }); });
  }

  var gestureBound = false;
  function waitGesture() {
    if (gestureBound) return; gestureBound = true;
    var go = function () {
      gestureBound = false;
      try { if (localStorage.getItem(KEY) === "on") start(); } catch (e) { start(); }
    };
    document.addEventListener("click", go, { once: true });
    document.addEventListener("keydown", go, { once: true });
    document.addEventListener("touchstart", go, { once: true });
  }

  btn.addEventListener("click", function () { playing ? stop() : start(); });

  // açılışta: tercih 'on' ise otomatik başlat (engellenirse ilk harekette başlar)
  var pref = "off";
  try { pref = localStorage.getItem(KEY) || "off"; } catch (e) {}
  if (pref === "on") {
    wrap.classList.remove("off");
    var pr = el[cur]; pr.src = PL[0].file;
    var pp = pr.play();
    if (pp && pp.then) pp.then(function () { pr.pause(); start(); }).catch(function () { waitGesture(); });
    else waitGesture();
  }
})();
