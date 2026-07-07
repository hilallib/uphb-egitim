/* Lenis akışkan scroll + çağ sahneleri + sihirli geçişler + başvuru formu */
(function () {
  var qa = /noanim/.test(location.search);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || qa;
  var mobile = window.matchMedia("(max-width: 860px)").matches;
  if (reduced) document.documentElement.classList.add("no-motion");
  if (qa) document.documentElement.classList.add("qa");

  /* video arka planlar: oynamazsa fallback görsele düş */
  document.querySelectorAll(".scene .bg video").forEach(function (v) {
    v.addEventListener("error", function () { v.classList.add("dead"); }, true);
    var p = v.play && v.play();
    if (p && p.catch) p.catch(function () { v.classList.add("dead"); });
  });

  /* Lenis */
  var lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1.0, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var el = document.querySelector(a.getAttribute("href"));
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: 0, duration: 1.6 }); }
      });
    });
  }

  /* ── Sihirli geçiş: ışık patlaması + huzme ── */
  var flash = document.getElementById("magicFlash");
  var beam = document.getElementById("magicBeam");
  var lastBurst = 0;
  function magicBurst() {
    var now = Date.now();
    if (now - lastBurst < 900 || !window.gsap) return;
    lastBurst = now;
    if (flash) {
      flash.style.setProperty("--fx", (35 + Math.random() * 30) + "%");
      flash.style.setProperty("--fy", (35 + Math.random() * 30) + "%");
      gsap.fromTo(flash, { opacity: 0 }, { opacity: .9, duration: .16, ease: "power2.out", yoyo: true, repeat: 1, repeatDelay: .05 });
    }
    if (beam) {
      gsap.fromTo(beam,
        { x: "-70vw", opacity: 0, skewX: -12 },
        { x: "170vw", opacity: .85, duration: 1.05, ease: "power2.inOut",
          onComplete: function () { gsap.set(beam, { opacity: 0 }); } });
    }
    window.dispatchEvent(new CustomEvent("magic-burst"));
  }

  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    /* ── ÇAĞ SAHNELERİ: pin + panorama + katman derinliği ── */
    document.querySelectorAll(".scene").forEach(function (scene, idx) {
      var media = scene.querySelector(".bg video:not(.dead)") || scene.querySelector(".bg img:not(.bg-fallback)") || scene.querySelector(".bg img");
      var act = scene.querySelector(".act span");
      var fades = scene.querySelectorAll("[data-fade]");
      var isHero = idx === 0;

      if (mobile) {
        gsap.fromTo(fades, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: scene, start: "top 70%", once: true }
        });
        return;
      }

      // panorama süpürmesi: yatayda geniş gezinme + zoom nefesi
      gsap.fromTo(media,
        { scale: isHero ? 1.05 : 1.28, xPercent: idx % 2 ? 7 : -7, yPercent: isHero ? 0 : -6 },
        {
          scale: isHero ? 1.16 : 1.02, xPercent: idx % 2 ? -5 : 5, yPercent: isHero ? 4 : 6, ease: "none",
          scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: true }
        });

      // dekupe figürler: derinliğe göre farklı hızda süzülme
      scene.querySelectorAll(".fg-el").forEach(function (el) {
        var d = parseFloat(el.dataset.depth || 1);
        gsap.fromTo(el, { yPercent: 26 * d, rotation: -2 * d }, {
          yPercent: -30 * d, rotation: 2 * d, ease: "none",
          scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: true }
        });
      });

      if (act) {
        gsap.fromTo(act, { yPercent: 46, opacity: 0 }, {
          yPercent: -36, opacity: 1, ease: "none",
          scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: true }
        });
      }

      var tl = gsap.timeline({
        scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: true }
      });
      if (isHero) {
        gsap.fromTo(fades, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.13, ease: "power3.out", delay: 0.25 });
        tl.to(fades, { opacity: 0, y: -70, stagger: 0.03, ease: "power1.in" }, 0.62);
      } else {
        tl.fromTo(fades, { opacity: 0, y: 80 }, { opacity: 1, y: 0, stagger: 0.06, ease: "power2.out" }, 0.12)
          .to(fades, { opacity: 0, y: -70, stagger: 0.03, ease: "power1.in" }, 0.74);
      }

      // çağ geçişi: sahneye girerken ışık sıçraması
      if (!isHero) {
        ScrollTrigger.create({
          trigger: scene, start: "top 55%",
          onEnter: magicBurst, onEnterBack: magicBurst
        });
      }
    });

    /* ── ARA BÖLÜMLER ── */
    document.querySelectorAll("[data-reveal]").forEach(function (el, i) {
      gsap.fromTo(el, { opacity: 0, y: 46 }, {
        opacity: 1, y: 0, duration: 1.15, ease: "power3.out", delay: (i % 4) * 0.06,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    /* ── fare paralaksı ── */
    if (!mobile) {
      var bgs = document.querySelectorAll(".scene .bg");
      var fgs = document.querySelectorAll(".fg-el");
      addEventListener("pointermove", function (e) {
        var mx = (e.clientX / innerWidth - 0.5) * 2;
        var my = (e.clientY / innerHeight - 0.5) * 2;
        bgs.forEach(function (bg) {
          gsap.to(bg, { x: mx * -16, y: my * -11, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        });
        fgs.forEach(function (el) {
          var d = parseFloat(el.dataset.depth || 1);
          gsap.to(el, { x: mx * 26 * d, duration: 1.4, ease: "power2.out", overwrite: "auto" });
        });
      }, { passive: true });
    }
  } else {
    document.querySelectorAll("[data-reveal],[data-fade]").forEach(function (el) {
      el.style.opacity = 1; el.style.transform = "none";
    });
  }

  /* ── ÖN BAŞVURU FORMU: FormSubmit → hb@hb-academy.com.tr, olmazsa mailto ── */
  var form = document.getElementById("applyForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = document.getElementById("applyBtn");
      var status = document.getElementById("formStatus");
      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        job: form.job.value.trim(),
        message: form.message.value.trim(),
        _subject: "Üretken YZ & Vibe Coding — Ön Başvuru: " + form.name.value.trim(),
        _template: "table",
        _captcha: "false"
      };
      btn.disabled = true; btn.textContent = "Gönderiliyor…";
      status.className = "form-status";
      fetch("https://formsubmit.co/ajax/hb@hb-academy.com.tr", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res.success === "true" || res.success === true) {
          status.className = "form-status ok";
          status.textContent = "✓ Başvurun alındı! En geç 24 saat içinde sana döneceğiz.";
          form.reset();
          btn.textContent = "Gönderildi ✓";
          magicBurst();
        } else { throw new Error("formsubmit"); }
      }).catch(function () {
        // yedek: e-posta uygulamasıyla gönder
        status.className = "form-status err";
        status.innerHTML = "Form şu an gönderilemedi — e-posta uygulaman açılıyor. Olmazsa: <b>hb@hb-academy.com.tr</b> ya da Instagram <b>@uphbacademy</b>.";
        btn.disabled = false; btn.textContent = "Ön Başvuruyu Gönder →";
        var body = "Ad Soyad: " + data.name + "%0D%0AE-posta: " + data.email +
                   "%0D%0ATelefon: " + data.phone + "%0D%0AMeslek: " + data.job +
                   "%0D%0ABeklenti: " + encodeURIComponent(data.message);
        location.href = "mailto:hb@hb-academy.com.tr?subject=" +
          encodeURIComponent("Üretken YZ & Vibe Coding — Ön Başvuru: " + data.name) + "&body=" + body;
      });
    });
  }

  window.addEventListener("load", function () {
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 300);
  });
})();
