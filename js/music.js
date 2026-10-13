/* UP-HB Academy — sayfa arka plan müziği (klasik, telifsiz)
   Her sayfanın kendi 10 parçalık listesi var. Her parça ~1 dk (56–72 sn) çalar,
   bitimine yakın yumuşak geçişle sıradakine döner. Köşede piyano başındaki
   Clara Schumann (Franz Seidel, 1837, kamu malı) yuvarlak düğmesiyle aç/kapat.
   Ses ~%20, tercih (aç/kapa) sayfalar arası hatırlanır.
   Fable (24.07.2026) · 12.10.2026: uzun klipler, FelseFemina + Tablo Kitleri listeleri,
   platform sayfasından kaldırıldı, nota simgesi yerine Clara Schumann; her açılışta karışık sıra.
   13.10.2026: arka plan sekmesinde sessizlik/durma hatası giderildi (kare döngüsü yerine zamanlayıcı). */
(function () {
  var PLAYLISTS = {"felsefemina": [{"file": "/audio/felsefemina/01.mp3", "label": "Hildegard von Bingen – O frondens virga"}, {"file": "/audio/felsefemina/02.mp3", "label": "Barbara Strozzi – Dialogo in Partenza"}, {"file": "/audio/felsefemina/03.mp3", "label": "Élisabeth Jacquet de La Guerre – Marche du Roi Nérée"}, {"file": "/audio/felsefemina/04.mp3", "label": "Cécile Chaminade – Automne"}, {"file": "/audio/felsefemina/05.mp3", "label": "Pauline Viardot – Havanaise"}, {"file": "/audio/felsefemina/06.mp3", "label": "Agathe Backer Grøndahl – Klage"}, {"file": "/audio/felsefemina/07.mp3", "label": "Teresa Carreño – Gottschalk Valsi"}, {"file": "/audio/felsefemina/08.mp3", "label": "Augusta Holmès – Trois anges sont venus ce soir"}, {"file": "/audio/felsefemina/09.mp3", "label": "Cécile Chaminade – Flüt Konçertinosu"}, {"file": "/audio/felsefemina/10.mp3", "label": "Pauline Viardot – Sérénade à Rosine"}], "gun1": [{"file": "/audio/gun1/01.mp3", "label": "J. Strauss – Mavi Tuna"}, {"file": "/audio/gun1/02.mp3", "label": "Beethoven – 5. Senfoni"}, {"file": "/audio/gun1/03.mp3", "label": "Çaykovski – Fındıkkıran: Trepak"}, {"file": "/audio/gun1/04.mp3", "label": "Debussy – Clair de Lune"}, {"file": "/audio/gun1/05.mp3", "label": "Debussy – Arabesque No.1"}, {"file": "/audio/gun1/06.mp3", "label": "Çaykovski – Şeker Perisi Dansı"}, {"file": "/audio/gun1/07.mp3", "label": "Saint-Saëns – Danse Macabre"}, {"file": "/audio/gun1/08.mp3", "label": "Satie – Gymnopédie No.1"}, {"file": "/audio/gun1/09.mp3", "label": "Rossini – William Tell: Uvertür"}, {"file": "/audio/gun1/10.mp3", "label": "Handel – Mesih: Hallelujah"}], "gun2": [{"file": "/audio/gun2/01.mp3", "label": "Saint-Saëns – Kuğu (Le Cygne)"}, {"file": "/audio/gun2/02.mp3", "label": "Satie – Gymnopédie No.1"}, {"file": "/audio/gun2/03.mp3", "label": "Beethoven – Ay Işığı Sonatı"}, {"file": "/audio/gun2/04.mp3", "label": "Grieg – Dağ Kralının Salonunda"}, {"file": "/audio/gun2/05.mp3", "label": "Mozart – Ave Verum Corpus"}, {"file": "/audio/gun2/06.mp3", "label": "Handel/Halvorsen – Passacaglia"}, {"file": "/audio/gun2/07.mp3", "label": "Verdi – Il Trovatore: Örs Korosu"}, {"file": "/audio/gun2/08.mp3", "label": "Mozart – 25. Senfoni (Sol minör)"}, {"file": "/audio/gun2/09.mp3", "label": "Chopin – Nocturne Op.9 No.2"}, {"file": "/audio/gun2/10.mp3", "label": "J. Strauss – Mavi Tuna"}], "index": [{"file": "/audio/index/01.mp3", "label": "Çaykovski – Çiçek Valsi"}, {"file": "/audio/index/02.mp3", "label": "Çaykovski – Kuğu Gölü"}, {"file": "/audio/index/03.mp3", "label": "Satie – Gymnopédie No.1"}, {"file": "/audio/index/04.mp3", "label": "Vivaldi – Dört Mevsim: Kış"}, {"file": "/audio/index/05.mp3", "label": "Beethoven – Ay Işığı Sonatı"}, {"file": "/audio/index/06.mp3", "label": "Grieg – Dağ Kralının Salonunda"}, {"file": "/audio/index/07.mp3", "label": "Pachelbel – Kanon (Re Majör)"}, {"file": "/audio/index/08.mp3", "label": "Bach – Orkestra Süiti No.2: Badinerie"}, {"file": "/audio/index/09.mp3", "label": "Brahms – Macar Dansı No.5"}, {"file": "/audio/index/10.mp3", "label": "Beethoven – Für Elise"}], "tablolar": [{"file": "/audio/tablolar/01.mp3", "label": "Musorgski – Tablolar Sergisi: Promenad"}, {"file": "/audio/tablolar/02.mp3", "label": "Musorgski – Tablolar Sergisi: Gnom"}, {"file": "/audio/tablolar/03.mp3", "label": "Musorgski – Tablolar Sergisi: Eski Şato"}, {"file": "/audio/tablolar/04.mp3", "label": "Musorgski – Tablolar Sergisi: Tuileries"}, {"file": "/audio/tablolar/05.mp3", "label": "Musorgski – Tablolar Sergisi: Bydło"}, {"file": "/audio/tablolar/06.mp3", "label": "Musorgski – Tablolar Sergisi: Civcivlerin Balesi"}, {"file": "/audio/tablolar/07.mp3", "label": "Musorgski – Tablolar Sergisi: Samuel Goldenberg ve Schmuÿle"}, {"file": "/audio/tablolar/08.mp3", "label": "Musorgski – Tablolar Sergisi: Promenad (yumuşak)"}, {"file": "/audio/tablolar/09.mp3", "label": "Musorgski – Tablolar Sergisi: Con mortuis"}, {"file": "/audio/tablolar/10.mp3", "label": "Musorgski – Tablolar Sergisi: Kiev'in Büyük Kapısı"}]};

  // sayfa tespiti: önce yol (FelseFemina, Tablo Kitleri), sonra gövde sınıfı
  var path = location.pathname || "";
  var cl = document.body.className || "";
  var page = /\/felsefemina/.test(path) || /page-ff/.test(cl) ? "felsefemina"
           : /\/kitler/.test(path) ? "tablolar"
           : /page-platform/.test(cl) ? null
           : /page-index/.test(cl) ? "index"
           : /page-gun1/.test(cl) ? "gun1"
           : /page-gun2/.test(cl) ? "gun2" : "index";
  var PL = ((page && PLAYLISTS[page]) || []).slice();
  if (!PL.length) return;
  // her açılışta farklı sıra: liste karıştırılır (Fisher–Yates)
  for (var s = PL.length - 1; s > 0; s--) {
    var r = Math.floor(Math.random() * (s + 1)), t = PL[s]; PL[s] = PL[r]; PL[r] = t;
  }

  var TARGET = 0.20;      // arka plan ses seviyesi
  var FADE = 2.5;         // saniye — çapraz geçiş (eski parça söner, yenisi yükselir)
  var LEAD = 3.5;         // parça bitmeden kaç sn önce sıradakine geçilir (klip sonu 4 sn sönümlü)
  var KEY = "uphbMusic";  // aç/kapa tercihi (sayfalar arası)
  var IMG = "/assets/muzik/clara-piyano.jpg";

  // ---- stil ----
  var css = document.createElement("style");
  css.textContent =
    "#uphb-music{position:fixed;left:20px;bottom:20px;z-index:99999;display:flex;" +
    "align-items:center;gap:10px;font-family:inherit;}" +
    "#uphb-music .u-lbl{max-width:0;overflow:hidden;white-space:nowrap;opacity:0;" +
    "transition:max-width .5s ease,opacity .5s ease;font-size:12.5px;color:#f3e9d6;" +
    "background:rgba(18,12,24,.82);border:1px solid rgba(232,180,90,.35);" +
    "border-radius:20px;padding:0;line-height:34px;height:34px;backdrop-filter:blur(6px);}" +
    "#uphb-music.show-lbl .u-lbl,#uphb-music:hover .u-lbl{max-width:300px;opacity:1;padding:0 14px;}" +
    "#uphb-music button{all:unset;cursor:pointer;position:relative;width:60px;height:60px;" +
    "border-radius:50%;display:block;filter:drop-shadow(0 5px 16px rgba(0,0,0,.5));" +
    "transition:transform .2s ease;}" +
    "#uphb-music button:hover{transform:translateY(-2px) scale(1.06);}" +
    "#uphb-music button:focus-visible{outline:2px solid #00fff4;outline-offset:4px;}" +
    "#uphb-music .halo{position:absolute;inset:-6px;border-radius:50%;z-index:0;opacity:0;" +
    "background:conic-gradient(from 0deg,#00fff4,#df66bf,#ff2fa0,#e8b45a,#00fff4);" +
    "filter:blur(9px);transition:opacity .4s ease;}" +
    "#uphb-music.playing .halo{opacity:.85;animation:uphbSpin 5s linear infinite;}" +
    "#uphb-music .ring{position:absolute;inset:0;border-radius:50%;z-index:1;" +
    "background:conic-gradient(from 140deg,#00fff4,#df66bf,#ff2fa0,#e8b45a,#00fff4);}" +
    "#uphb-music .pic{position:absolute;inset:2.5px;border-radius:50%;z-index:2;" +
    "background:#0b0710 url(" + IMG + ") center/cover no-repeat;" +
    "transition:filter .4s ease;}" +
    "#uphb-music.playing .pic{animation:uphbPulse 2.4s ease-in-out infinite;}" +
    "#uphb-music.off .ring{background:linear-gradient(135deg,#8a6a86,#3a2f40);}" +
    "#uphb-music.off .pic{filter:grayscale(.55) brightness(.8);}" +
    "#uphb-music .mute{position:absolute;right:-2px;bottom:-2px;z-index:3;width:20px;height:20px;" +
    "border-radius:50%;background:#1a1020;border:1.5px solid #df66bf;color:#ff6ec7;" +
    "display:flex;align-items:center;justify-content:center;font-size:11px;line-height:1;}" +
    "#uphb-music.playing .mute{display:none;}" +
    "@keyframes uphbSpin{to{transform:rotate(360deg)}}" +
    "@keyframes uphbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}" +
    "@media(max-width:600px){#uphb-music button{width:52px;height:52px}" +
    "#uphb-music.show-lbl .u-lbl{max-width:170px}}";
  document.head.appendChild(css);

  // ---- DOM ----
  var wrap = document.createElement("div");
  wrap.id = "uphb-music";
  wrap.className = "off";
  wrap.innerHTML =
    '<button type="button" aria-label="Klasik müziği aç/kapat" ' +
    'title="Klasik müzik — görsel: Clara Schumann piyano başında (Franz Seidel, 1837)">' +
    '<span class="halo"></span><span class="ring"></span><span class="pic"></span>' +
    '<span class="mute" aria-hidden="true">♪</span>' +
    '</button>' +
    '<span class="u-lbl"></span>';
  var btn = wrap.querySelector("button");
  var lbl = wrap.querySelector(".u-lbl");
  if (document.body) document.body.appendChild(wrap);
  else document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(wrap); });

  // ---- ses motoru (iki eleman ile çapraz geçiş; parça bitince sıradaki) ----
  var el = [new Audio(), new Audio()];
  el.forEach(function (a) { a.preload = "auto"; a.volume = 0; });
  var cur = 0, idx = 0, playing = false, lblTimer = null, preTimer = null;

  // ses yumuşatma: kare döngüsü arka plan sekmesinde durduğu için zamanlayıcı kullanılır;
  // ilerleme geçen süreye göre hesaplanır (tarayıcı zamanlayıcıyı yavaşlatsa da doğru biter)
  function ramp(a, to, dur, done) {
    clearInterval(a._ramp);
    var from = a.volume, t0 = Date.now();
    a._ramp = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / (dur * 1000));
      a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
      if (k >= 1) { clearInterval(a._ramp); if (done) done(); }
    }, 50);
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
    // sıradaki parçayı önceden önbelleğe al (geçişte yükleme sessizliği olmasın)
    clearTimeout(preTimer);
    preTimer = setTimeout(function () {
      var pre = new Audio(); pre.preload = "auto"; pre.src = PL[(i + 1) % PL.length].file;
    }, 8000);
  }

  // geçiş yalnız o an çalan elemandan tetiklenir; geçişten sonra eski elemanın olayları yok sayılır
  function nextTrack() {
    if (!playing) return;
    playIndex((idx + 1) % PL.length);
  }

  // çalan parça bitmeye yaklaşınca (ya da biterse) sıradakine geç
  el.forEach(function (a, n) {
    a.addEventListener("timeupdate", function () {
      if (n === cur && a.duration && a.currentTime >= a.duration - LEAD) nextTrack();
    });
    a.addEventListener("ended", function () { if (n === cur) nextTrack(); });
  });

  function start() {
    playing = true;
    try { localStorage.setItem(KEY, "on"); } catch (e) {}
    wrap.classList.remove("off"); wrap.classList.add("playing");
    playIndex(idx);
  }

  function stop() {
    playing = false;
    try { localStorage.setItem(KEY, "off"); } catch (e) {}
    wrap.classList.remove("playing"); wrap.classList.add("off");
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

  btn.addEventListener("click", function (e) { e.stopPropagation(); playing ? stop() : start(); });

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
