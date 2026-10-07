/* Ücretsiz Tablo Kitleri: galeri, kit sayfası, form (FormSubmit) ve indirme açma */
(function () {
  var FORM_URL = "https://formsubmit.co/ajax/98b368cb09fe312e947122767eaca892";
  var SITE = "https://uphbacademy.com.tr";
  var ANAHTAR = "uphb_kit_erisim";
  var liste = window.KITLER || [];
  var kitliler = liste.filter(function (k) { return k.kit === "yayinda"; });

  function acikMi() { try { return localStorage.getItem(ANAHTAR) === "1"; } catch (e) { return false; } }
  function ac() { try { localStorage.setItem(ANAHTAR, "1"); } catch (e) {} }
  function no2(n) { return (n < 10 ? "0" : "") + n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* kart: galeri ve "serinin diğer filmleri" — kit düğmesi, altında YouTube kapağı + İzle */
  function kart(k) {
    var acik = acikMi(), var_kit = k.kit === "yayinda";
    var img = '<img src="/kitler/medya/' + no2(k.no) + '-kart.jpg" alt="' + esc(k.ad) + '" loading="lazy" width="540" height="780">';
    var kitBtn = !var_kit ? '<span class="btn btn-ghost kc-btn kc-off" aria-disabled="true">Kit yakında</span>'
      : acik ? '<a class="btn btn-primary kc-btn" href="' + k.zip + '" download>Kiti indir ↓</a>'
      : '<a class="btn btn-primary kc-btn" href="' + k.sayfa + '#kit-al">Kiti al →</a>';
    var yt = k.youtube
      ? '<a class="kc-yt" href="https://www.youtube.com/watch?v=' + k.youtube + '" target="_blank" rel="noopener" aria-label="' + esc(k.ad) + ' filmini YouTube\'da izle">' +
          '<span class="kc-yt-img"><img src="/kitler/medya/' + no2(k.no) + '-youtube.jpg" alt="" loading="lazy" width="640" height="360"><i class="kc-play" aria-hidden="true"></i></span>' +
          '<span class="kc-yt-txt">▶ İzle</span></a>'
      : '<p class="kc-yt-soon">Film yakında YouTube\'da</p>';
    return '<article class="kit-card">' +
      (var_kit ? '<a class="kc-img" href="' + k.sayfa + '">' + img + '</a>' : '<span class="kc-img">' + img + '</span>') +
      '<div class="kc-body"><p class="kc-no">Tablo ' + k.no + '</p><h3>' + esc(k.ad) + '</h3><p class="kc-by">' + esc(k.ressam) + ' · ' + esc(k.yil) + '</p>' +
      kitBtn + yt + '</div></article>';
  }

  /* galeride her 4 eserden sonra ince ön başvuru şeridi (cümleler sırayla değişir) */
  var SERIT = [
    ["Bu filmleri nasıl yaptığımızı birebir öğren.", "Araştırma, senaryo, görsel, hareket ve kurgu: yapay zekâ ekibiyle bir tablonun filme dönüşmesi."],
    ["Tabloyu değil, kendi projeni canlandır.", "Aynı yöntemi kendi işin üzerinde, Hilal Baktaş ile özel derste uygula."],
    ["Film yapım kitleri özel derste.", "Her filmin hikâyesi, karakter paftası, promptları ve kurgu planı eğitime katılanlarla paylaşılıyor."]
  ];
  function basvuruSeridi(n) {
    var t = SERIT[n % SERIT.length];
    return '<aside class="kit-serit">' +
      '<img src="/assets/hilal-portre.jpg" alt="Hilal Baktaş" loading="lazy" width="64" height="64">' +
      '<div><p class="ks-kick">Hilal Baktaş ile özel ders</p><p class="ks-title">' + t[0] + '</p><p class="ks-sub">' + t[1] + '</p></div>' +
      '<a class="btn btn-primary" href="/#basvuru">Ön başvuru yap →</a></aside>';
  }

  function listeyiDoldur() {
    document.querySelectorAll("[data-kit-liste]").forEach(function (el) {
      var haric = el.getAttribute("data-haric");
      var kitler = liste.filter(function (k) { return k.slug !== haric; });
      if (!kitler.length) {
        el.innerHTML = '<p class="kit-empty">Sıradaki kit hazırlanıyor. Yayına girdiğinde önce Instagram\'da <a href="https://instagram.com/hilal_baktas" target="_blank" rel="noopener">@hilal_baktas</a> hesabında duyuracağız.</p>';
        return;
      }
      var arada = el.hasAttribute("data-arada-basvuru");
      el.innerHTML = kitler.map(function (k, i) {
        var son = i === kitler.length - 1;
        return kart(k) + (arada && (i + 1) % 4 === 0 && !son ? basvuruSeridi((i + 1) / 4 - 1) : "");
      }).join("");
    });
    document.querySelectorAll("[data-kit-sayi]").forEach(function (el) { el.textContent = kitliler.length; });
    document.querySelectorAll("[data-eser-sayi]").forEach(function (el) { el.textContent = liste.length; });
  }

  /* kit sayfası: varsa döngü videosu, yoksa hareketli önizleme */
  function sahne() {
    var kutu = document.querySelector("[data-kit-sahne]");
    if (!kutu) return;
    var k = liste.filter(function (x) { return x.slug === kutu.getAttribute("data-kit-sahne"); })[0];
    if (!k || !k.video || kutu.querySelector("video")) return;
    var v = document.createElement("video");
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
    v.src = k.video;
    v.addEventListener("canplay", function () { kutu.classList.add("has-video"); }, { once: true });
    kutu.appendChild(v);
  }

  function indirmeyiGoster(slug) {
    var k = kitliler.filter(function (x) { return x.slug === slug; })[0];
    var btn = document.getElementById("kitIndir");
    if (k && btn) btn.href = k.zip;
    var form = document.getElementById("kitForm");
    var ok = document.getElementById("kitOk");
    if (form) form.hidden = true;
    if (ok) ok.hidden = false;
    listeyiDoldur();
  }

  function utm() {
    var p = new URLSearchParams(location.search), out = [];
    ["utm_source", "utm_medium", "utm_campaign"].forEach(function (n) { if (p.get(n)) out.push(n.replace("utm_", "") + "=" + p.get(n)); });
    return out.join(" · ") || (document.referrer ? "referrer=" + document.referrer : "doğrudan");
  }

  function formKur() {
    var form = document.getElementById("kitForm");
    if (!form) return;
    var slug = form.getAttribute("data-slug");
    if (acikMi()) { indirmeyiGoster(slug); return; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form._honey && form._honey.value) return;
      var btn = document.getElementById("kitBtn");
      var status = document.getElementById("kitStatus");
      var k = liste.filter(function (x) { return x.slug === slug; })[0] || { ad: slug, no: 0 };
      var ileti = document.getElementById("k-ileti").checked;
      var linkler = kitliler.map(function (x) { return "• " + x.ad + ": " + SITE + x.zip; }).join("\n");
      var data = {
        name: form.name.value.trim() || "—",
        email: form.email.value.trim(),
        kit: no2(k.no) + " · " + k.ad,
        kaynak: utm(),
        kvkk_onayi: "Onaylandı",
        ticari_ileti_onayi: ileti ? "EVET: eğitim ve yeni kit duyurusu alabilir" : "Hayır",
        _subject: "Tablo Kiti · " + k.ad + " · " + form.email.value.trim(),
        _template: "table",
        _captcha: "false",
        _autoresponse: "Merhaba,\n\nTablo kitin hazır. İndirme bağlantıları:\n" + linkler +
          "\n\nKitin içindeki BASLA.html dosyasını aç; adım adım anlatıyor.\n" +
          "Yeni kitler önce Instagram'da duyuruluyor: https://instagram.com/hilal_baktas\n\n" +
          "Bu videoları ve kendi yapay zekâ ekibini birlikte üretmek istersen, Hilal Baktaş ile özel ders için ön başvuru: " + SITE + "/#basvuru\n\n" +
          "Hilal Baktaş · UP-HB Academy\n" + SITE
      };
      btn.disabled = true; btn.textContent = "Gönderiliyor…";
      status.className = "form-status";
      fetch(FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res.success === "true" || res.success === true) { ac(); indirmeyiGoster(slug); }
        else { throw new Error("formsubmit"); }
      }).catch(function () {
        status.className = "form-status err";
        status.innerHTML = "Şu an gönderilemedi. Birkaç saniye sonra tekrar dener misin? Olmazsa Instagram'dan <b>@hilal_baktas</b>'a yaz, kiti oradan gönderelim.";
        btn.disabled = false; btn.textContent = "Kiti Gönder →";
      });
    });
  }

  /* fragman: ses aç/kapat */
  document.querySelectorAll(".kit-sound").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.parentElement.querySelector("video"); if (!v) return;
      v.muted = !v.muted; if (!v.muted) { v.currentTime = 0; v.play(); }
      b.textContent = v.muted ? "🔇 Sesi aç" : "🔊 Sesi kapat";
      b.setAttribute("aria-label", v.muted ? "Sesi aç" : "Sesi kapat");
    });
  });

  listeyiDoldur();
  sahne();
  formKur();
})();
