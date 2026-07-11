/* Sayfa arka plan müziği — telifsiz klasik.
   Kullanım: <body data-music="assets/music/arabesque.mp3" data-music-adi="Debussy — Arabesque No.1">
   Varsayılan KAPALI; ziyaretçi köşedeki butonla açar. Tercih localStorage'da saklanır,
   sayfalar arası korunur. Ses yumuşak fade ile girer/çıkar, düşük seviyede döngüde çalar. */
(function () {
  var kaynak = document.body.getAttribute("data-music");
  if (!kaynak) return;
  var parcaAdi = document.body.getAttribute("data-music-adi") || "Müzik";
  var HEDEF_SES = 0.32;

  var audio = new Audio(kaynak);
  audio.loop = true;
  audio.volume = 0;
  audio.preload = "auto";

  // Buton
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "muzik-btn";
  btn.setAttribute("aria-label", parcaAdi + " — müziği aç/kapat");
  btn.innerHTML =
    '<span class="muzik-ikon" aria-hidden="true"></span>' +
    '<span class="muzik-etiket">' + parcaAdi + "</span>";
  document.body.appendChild(btn);

  var calisiyor = false;
  var rampa = null;

  function sesRampa(hedef, bitince) {
    clearInterval(rampa);
    rampa = setInterval(function () {
      var fark = hedef - audio.volume;
      if (Math.abs(fark) < 0.02) {
        audio.volume = hedef;
        clearInterval(rampa);
        if (bitince) bitince();
      } else {
        audio.volume = Math.max(0, Math.min(1, audio.volume + fark * 0.3));
      }
    }, 40);
  }

  function ac() {
    audio.play().then(function () {
      calisiyor = true;
      btn.classList.add("calisiyor");
      sesRampa(HEDEF_SES);
      try { localStorage.setItem("muzikAcik", "1"); } catch (e) {}
    }).catch(function () {
      // Tarayıcı otomatik oynatmayı engelledi — ilk tıklamayı bekle
    });
  }

  function kapat() {
    sesRampa(0, function () { audio.pause(); });
    calisiyor = false;
    btn.classList.remove("calisiyor");
    try { localStorage.setItem("muzikAcik", "0"); } catch (e) {}
  }

  btn.addEventListener("click", function () {
    if (calisiyor) kapat(); else ac();
  });

  // Önceki sayfada açıksa, burada da sürdürmeyi dene (gesture gerekebilir)
  var tercih = "0";
  try { tercih = localStorage.getItem("muzikAcik") || "0"; } catch (e) {}
  if (tercih === "1") {
    ac();
    // Otomatik oynatma engellendiyse ilk kullanıcı hareketinde başlat.
    // ÖNEMLİ: butona yapılan tıklama bu dinleyiciye GİRMEZ — yoksa butonun
    // kendi aç/kapa mantığıyla çakışıp müziği açar-kapatır (11.07 Handel hatası).
    var basladi = false;
    var ilkHareket = function (e) {
      if (e && e.target && e.target.closest && e.target.closest(".muzik-btn")) return;
      if (basladi || calisiyor) { temizle(); return; }
      basladi = true;
      ac();
      temizle();
    };
    var temizle = function () {
      document.removeEventListener("click", ilkHareket);
      document.removeEventListener("scroll", ilkHareket);
    };
    document.addEventListener("click", ilkHareket);
    document.addEventListener("scroll", ilkHareket, { passive: true });
  }
})();
