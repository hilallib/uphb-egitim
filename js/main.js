/* Lenis akışkan scroll + sinematik sahne pinleri + reveal */
(function () {
  var qa = /noanim/.test(location.search);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || qa;
  var mobile = window.matchMedia("(max-width: 860px)").matches;
  if (reduced) document.documentElement.classList.add("no-motion");
  if (qa) document.documentElement.classList.add("qa");

  // Lenis — tereyağı scroll
  if (!reduced && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1.0, smoothWheel: true });
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

  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);

    /* ── SAHNELER: pin + katmanlı parallax ── */
    document.querySelectorAll(".scene").forEach(function (scene, idx) {
      var img = scene.querySelector(".bg img");
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

      // tablo: yavaş zoom + dikey süzülme (Ken Burns)
      gsap.fromTo(img,
        { scale: isHero ? 1.06 : 1.22, yPercent: isHero ? 0 : -7, xPercent: idx % 2 ? 2.5 : -2.5 },
        {
          scale: isHero ? 1.18 : 1.0, yPercent: isHero ? 5 : 7, xPercent: 0, ease: "none",
          scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: true }
        });

      // dev perde numarası: ters yönde derinlik
      if (act) {
        gsap.fromTo(act, { yPercent: 46, opacity: 0.0 }, {
          yPercent: -36, opacity: 1, ease: "none",
          scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: true }
        });
      }

      // içerik: sahne pinliyken sırayla belirir, sonda yukarı süzülüp söner
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
    });

    /* ── ARA BÖLÜMLER: klasik reveal ── */
    document.querySelectorAll("[data-reveal]").forEach(function (el, i) {
      gsap.fromTo(el, { opacity: 0, y: 46 }, {
        opacity: 1, y: 0, duration: 1.15, ease: "power3.out", delay: (i % 4) * 0.06,
        scrollTrigger: { trigger: el, start: "top 88%", once: true }
      });
    });

    /* ── fare parallax: aktif sahnenin tablosu hafifçe bakışı izler ── */
    if (!mobile) {
      var imgs = document.querySelectorAll(".scene .bg");
      addEventListener("pointermove", function (e) {
        var mx = (e.clientX / innerWidth - 0.5) * 2;
        var my = (e.clientY / innerHeight - 0.5) * 2;
        imgs.forEach(function (bg) {
          gsap.to(bg, { x: mx * -14, y: my * -10, duration: 1.2, ease: "power2.out", overwrite: "auto" });
        });
      }, { passive: true });
    }
  } else {
    document.querySelectorAll("[data-reveal],[data-fade]").forEach(function (el) {
      el.style.opacity = 1; el.style.transform = "none";
    });
  }

  window.addEventListener("load", function () {
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 300);
  });
})();
