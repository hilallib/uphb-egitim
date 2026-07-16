/* Lenis akışkan scroll + çağ sahneleri + sihirli geçişler + başvuru formu */
(function () {
  var qa = /noanim/.test(location.search);
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || qa;
  var mobile = window.matchMedia("(max-width: 860px)").matches;
  if (reduced) document.documentElement.classList.add("no-motion");
  if (qa) document.documentElement.classList.add("qa");

  /* mobil menü */
  var burger = document.getElementById("navBurger");
  var mmenu = document.getElementById("mobileMenu");
  if (burger && mmenu) {
    burger.addEventListener("click", function () {
      burger.classList.toggle("open");
      mmenu.classList.toggle("open");
    });
    mmenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        burger.classList.remove("open");
        mmenu.classList.remove("open");
      });
    });
  }

  /* ── Video 3D derinlik sahnesi ──
     Video + fallback aynı stage içinde tutulur. Böylece mevcut lazy-loading,
     poster ve GSAP panorama hareketi korunurken perspektif ayrı katmanda yaşar. */
  var depthStages = [];
  document.querySelectorAll(".scene .bg").forEach(function (bg, index) {
    var video = bg.querySelector(":scope > video");
    if (!video) return;

    var stage = document.createElement("div");
    stage.className = "video-depth-stage";
    stage.style.setProperty("--depth-direction", index % 2 ? -1 : 1);
    bg.insertBefore(stage, video);
    stage.appendChild(video);

    var fallback = bg.querySelector(":scope > .bg-fallback");
    if (fallback) stage.appendChild(fallback);

    var rim = document.createElement("span");
    rim.className = "video-depth-rim";
    rim.setAttribute("aria-hidden", "true");
    stage.appendChild(rim);
    bg.classList.add("has-video-depth");
    depthStages.push(stage);
  });

  if (depthStages.length && !reduced && !mobile) { /* mobilde surekli rAF dongusu kaydirmayi tikiyordu */
    var depthFrame = 0;
    var depthTargetX = 0;
    var depthTargetY = 0;
    var depthCurrentX = 0;
    var depthCurrentY = 0;

    function updateDepthScroll() {
      depthStages.forEach(function (stage) {
        var scene = stage.closest(".scene");
        var rect = scene.getBoundingClientRect();
        var progress;
        if (mobile) {
          progress = (innerHeight - rect.top) / Math.max(1, innerHeight + rect.height);
        } else {
          progress = -rect.top / Math.max(1, rect.height - innerHeight);
        }
        progress = Math.max(0, Math.min(1, progress));
        stage._depthPhase = (progress - 0.5) * 2;
        stage._depthWave = Math.sin(progress * Math.PI);
      });
    }

    function renderVideoDepth() {
      var idle = Math.sin(performance.now() / 2200);
      depthCurrentX += (depthTargetX - depthCurrentX) * 0.075;
      depthCurrentY += (depthTargetY - depthCurrentY) * 0.075;
      document.documentElement.style.setProperty("--video-light-x", (50 + depthCurrentX * 28 + idle * 3).toFixed(2) + "%");
      document.documentElement.style.setProperty("--video-light-y", (48 + depthCurrentY * 22 - idle * 2).toFixed(2) + "%");
      depthStages.forEach(function (stage) {
        var direction = parseFloat(stage.style.getPropertyValue("--depth-direction")) || 1;
        var contain = stage.closest(".scene-contain");
        var phase = stage._depthPhase == null ? -1 : stage._depthPhase;
        var wave = stage._depthWave || 0;
        var pitch = contain ? 1.2 : (mobile ? 1.35 : 2.15);
        var yaw = contain ? 1.8 : (mobile ? 2.5 : 4.6);
        var pointerX = mobile ? 0 : depthCurrentX;
        var pointerY = mobile ? 0 : depthCurrentY;
        var rx = -pointerY * pitch - phase * (contain ? 0.8 : (mobile ? 1.1 : 2.2)) + idle * 0.22;
        var ry = pointerX * direction * yaw + phase * direction * yaw + idle * direction * 0.3;
        var scale = (contain ? 1.025 : (mobile ? 1.055 : 1.075)) + wave * (contain ? 0.012 : 0.035);
        stage.style.setProperty("--video-depth-rx", rx.toFixed(3) + "deg");
        stage.style.setProperty("--video-depth-ry", ry.toFixed(3) + "deg");
        stage.style.setProperty("--video-depth-scale", scale.toFixed(4));
        stage.style.setProperty("--video-depth-tx", (phase * direction * (mobile ? 7 : 20)).toFixed(2) + "px");
        stage.style.setProperty("--video-depth-ty", (phase * (mobile ? -5 : -13)).toFixed(2) + "px");
      });
      depthFrame = requestAnimationFrame(renderVideoDepth);
    }

    if (!mobile) {
      addEventListener("pointermove", function (e) {
        depthTargetX = (e.clientX / innerWidth - 0.5) * 2;
        depthTargetY = (e.clientY / innerHeight - 0.5) * 2;
      }, { passive: true });
    }
    addEventListener("blur", function () { depthTargetX = 0; depthTargetY = 0; });
    addEventListener("scroll", updateDepthScroll, { passive: true });
    addEventListener("resize", updateDepthScroll, { passive: true });
    updateDepthScroll();
    depthFrame = requestAnimationFrame(renderVideoDepth);
  }

  /* lazy videolar: sahneye yaklaşınca yükle+oynat, uzaklaşınca durdur */
  var lazyVids = document.querySelectorAll("video.lazy-vid");
  if ("IntersectionObserver" in window && lazyVids.length) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (mobile && v.poster) return; // mobilde buyuk sahne videolari yerine poster: 4K video decode kaydirmayi kilitliyor
          if (v.preload === "none") v.preload = "auto";
          var p = v.play(); if (p && p.catch) p.catch(function(){});
        } else {
          v.pause();
        }
      });
    }, { rootMargin: "600px 0px" });
    lazyVids.forEach(function (v) { vio.observe(v); });
  } else {
    lazyVids.forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function(){}); });
  }

  /* video arka planlar: oynamazsa fallback görsele düş (lazy olanları yukarıdaki IO yönetir;
     burada play() çağrılırsa IO'nun ilk pause()'u promise'i AbortError ile düşürüp videoyu
     yanlışlıkla "dead" işaretliyor) */
  document.querySelectorAll(".scene .bg video").forEach(function (v) {
    v.addEventListener("error", function () { v.classList.add("dead"); }, true);
    if (v.classList.contains("lazy-vid")) return;
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

  /* ── Hologram karesi → ışıklı açılış + sahne videosu ── */
  var hlBox = null;
  function openHoloLb(d) {
    if (!hlBox) {
      hlBox = document.createElement("div");
      hlBox.className = "holo-lb";
      hlBox.innerHTML =
        '<div class="hlb-back"></div>' +
        '<figure class="hlb-frame">' +
        '  <span class="hlb-sweep"></span>' +
        '  <video muted loop playsinline preload="auto"></video>' +
        '  <figcaption><div class="hlb-cap"><b></b><i></i></div><a class="hlb-go"></a></figcaption>' +
        '  <button class="hlb-x" aria-label="Kapat">×</button>' +
        '</figure>';
      document.body.appendChild(hlBox);
      hlBox.querySelector(".hlb-back").addEventListener("click", closeHoloLb);
      hlBox.querySelector(".hlb-x").addEventListener("click", closeHoloLb);
      hlBox.querySelector(".hlb-go").addEventListener("click", function (ev) {
        var href = this.getAttribute("href");
        closeHoloLb();
        if (href && href.charAt(0) === "#" && lenis) {
          var el = document.querySelector(href);
          if (el) { ev.preventDefault(); lenis.scrollTo(el, { offset: 0, duration: 1.6 }); }
        }
      });
      addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeHoloLb(); });
    }
    var v = hlBox.querySelector("video");
    // innerHTML ile gelen muted özniteliği bazı tarayıcılarda autoplay'e yetmiyor — özellikleri elle bas
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.src = d.video;
    if (d.poster) v.poster = d.poster;
    v.addEventListener("canplay", function () {
      if (hlBox.classList.contains("show") && v.paused) {
        var p2 = v.play(); if (p2 && p2.catch) p2.catch(function () {});
      }
    }, { once: true });
    hlBox.querySelector(".hlb-cap b").textContent = d.title;
    hlBox.querySelector(".hlb-cap i").textContent = d.theme || "";
    var go = hlBox.querySelector(".hlb-go");
    go.textContent = d.cta;
    go.setAttribute("href", d.href);
    hlBox.style.setProperty("--hl", d.color);
    hlBox.classList.add("show");
    void hlBox.offsetWidth; // display:none → block geçişinde transition için reflow şart
    hlBox.classList.add("open");
    var p = v.play(); if (p && p.catch) p.catch(function () {});
    if (lenis) lenis.stop();
  }
  function closeHoloLb() {
    if (!hlBox || !hlBox.classList.contains("show")) return;
    var v = hlBox.querySelector("video");
    v.pause();
    hlBox.classList.remove("open");
    setTimeout(function () {
      hlBox.classList.remove("show");
      v.removeAttribute("src"); v.load();
    }, 480);
    if (lenis) lenis.start();
  }
  window.addEventListener("holo-open", function (e) {
    var d = e.detail;
    // ışık patlaması tıklanan karenin üzerinden doğar
    if (flash && window.gsap) {
      flash.style.setProperty("--fx", d.fx + "%");
      flash.style.setProperty("--fy", d.fy + "%");
      gsap.fromTo(flash, { opacity: 0 },
        { opacity: .95, duration: .18, ease: "power2.out", yoyo: true, repeat: 1, repeatDelay: .1 });
    }
    setTimeout(function () { openHoloLb(d); }, 230);
  });

  if (window.gsap && window.ScrollTrigger && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    // mobilde adres cubugu gizlenince tetiklenen resize, refresh + sicramaya yol aciyordu
    ScrollTrigger.config({ ignoreMobileResize: true });

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

      // panorama süpürmesi: SADECE görsellerde (videoların kendi kamera hareketi var)
      var isVideo = media && media.tagName === "VIDEO";
      if (scene.classList.contains("scene-contain")) {
        // tam kare panorama: kırpma/zoom yok
      } else if (!isVideo) {
        gsap.fromTo(media,
          { scale: isHero ? 1.08 : 1.42, xPercent: idx % 2 ? 10 : -10, yPercent: isHero ? 0 : -9 },
          {
            scale: isHero ? 1.22 : 1.02, xPercent: idx % 2 ? -8 : 8, yPercent: isHero ? 6 : 9, ease: "none",
            scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: true }
          });
      } else {
        // video: panoramik süzülme + derin zoom (kompozisyon sabit merkezli, kayma yok)
        gsap.fromTo(media,
          { scale: isHero ? 1.05 : 1.3, xPercent: idx % 2 ? 8 : -8 },
          {
            scale: isHero ? 1.16 : 1.06, xPercent: idx % 2 ? -8 : 8, ease: "none",
            scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: true }
          });
      }

      // dekupe figürler: derinliğe göre farklı hızda süzülme
      scene.querySelectorAll(".fg-el").forEach(function (el) {
        var d = parseFloat(el.dataset.depth || 1);
        gsap.fromTo(el, { yPercent: 34 * d, rotation: -3 * d, scale: 0.94 }, {
          yPercent: -40 * d, rotation: 3 * d, scale: 1.06, ease: "none",
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

      // derinlik: sahne biterken geriye gömülür (yeni bölüm üzerine akar)
      var pin = scene.querySelector(".pin");
      gsap.fromTo(pin, { scale: 1, opacity: 1, borderRadius: 0 }, {
        scale: 0.93, opacity: 0.45, borderRadius: 28, ease: "none",
        scrollTrigger: { trigger: scene, start: "bottom 90%", end: "bottom 25%", scrub: true }
      });

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
          gsap.to(el, { x: mx * 34 * d, y: my * 14 * d, duration: 1.4, ease: "power2.out", overwrite: "auto" });
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
        _subject: "Üretken YZ & AI Agents — Ön Başvuru: " + form.name.value.trim(),
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
          form.reset();
          // kapı açılır, ışık süzülür
          var door = document.getElementById("formDoor");
          if (door) {
            form.style.display = "none";
            door.hidden = false;
            requestAnimationFrame(function () {
              requestAnimationFrame(function () { door.classList.add("open"); });
            });
          } else {
            status.className = "form-status ok";
            status.textContent = "✓ Başvurun alındı! En geç 24 saat içinde sana döneceğiz.";
          }
          magicBurst();
          setTimeout(magicBurst, 1100);
        } else { throw new Error("formsubmit"); }
      }).catch(function () {
        // yedek: e-posta uygulamasıyla gönder
        status.className = "form-status err";
        status.innerHTML = "Form şu an gönderilemedi — e-posta uygulaman açılıyor. Olmazsa: <b>hb@hb-academy.com.tr</b> ya da Instagram <b>@uphbacademy</b>.";
        btn.disabled = false; btn.textContent = "Ön Başvuru Yap →";
        var body = "Ad Soyad: " + data.name + "%0D%0AE-posta: " + data.email +
                   "%0D%0ATelefon: " + data.phone + "%0D%0AMeslek: " + data.job +
                   "%0D%0ABeklenti: " + encodeURIComponent(data.message);
        location.href = "mailto:hb@hb-academy.com.tr?subject=" +
          encodeURIComponent("Üretken YZ & AI Agents — Ön Başvuru: " + data.name) + "&body=" + body;
      });
    });
  }

  /* ── meslek bulutu: meslek chip'ine tıkla → agent ekibi görünsün ── */
  var cloud = document.getElementById("agentCloud");
  if (cloud) {
    var panel = document.getElementById("acPanel");
    var pTitle = panel.querySelector(".ac-p-title");
    var pList = panel.querySelector(".ac-p-list");
    var current = null;

    function closeCloud() {
      cloud.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      if (current) current.classList.remove("on");
      current = null;
    }

    function openCloud(chip) {
      if (current === chip) { closeCloud(); return; }
      if (current) current.classList.remove("on");
      chip.classList.add("on");
      current = chip;
      var chipColor = chip.style.getPropertyValue("--c");
      if (chipColor) panel.style.setProperty("--c", chipColor);
      pTitle.textContent = chip.dataset.meslek;
      pList.innerHTML = "";
      chip.dataset.agents.split("|").forEach(function (name, i) {
        var tag = document.createElement("span");
        tag.className = "ac-agent";
        tag.style.setProperty("--i", (i * 0.07) + "s");
        tag.textContent = name.trim();
        pList.appendChild(tag);
      });
      cloud.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      magicBurst();
    }

    cloud.querySelectorAll(".ac-chip").forEach(function (chip) {
      chip.addEventListener("click", function () { openCloud(chip); });
    });
    document.getElementById("acClose").addEventListener("click", closeCloud);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeCloud();
    });
  }

  window.addEventListener("load", function () {
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 300);
  });
})();
