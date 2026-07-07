/* Lenis akışkan scroll + GSAP reveal animasyonları */
(function () {
  var qa = /noanim/.test(location.search);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || qa;
  if (reduced) document.documentElement.classList.add("no-motion");
  if (qa) document.documentElement.classList.add("qa"); // QA çekimleri: hero kısalır

  // Lenis — tereyağı scroll
  if (!reduced && window.Lenis) {
    var lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1.0, smoothWheel: true });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
    }
    // Çapa linkleri Lenis ile kaydır
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        var el = document.querySelector(id);
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -20, duration: 1.4 }); }
      });
    });
  }

  // GSAP reveal
  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll("[data-reveal]").forEach(function (el, i) {
      gsap.fromTo(el,
        { opacity: 0, y: 46 },
        {
          opacity: 1, y: 0, duration: 1.15, ease: "power3.out",
          delay: (i % 4) * 0.06,
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
    });
    // Hero başlığı hafif parallax
    var head = document.querySelector(".hero .headline");
    if (head) {
      gsap.to(head, {
        yPercent: -14, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
    var hbg = document.querySelector(".hero-bg img");
    if (hbg) {
      gsap.to(hbg, {
        scale: 1.12, yPercent: 6, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.style.opacity = 1; el.style.transform = "none";
    });
  }

  // Hash ile gelindiğinde ScrollTrigger pozisyonlarını tazele
  window.addEventListener("load", function () {
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 300);
  });
})();
