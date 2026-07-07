/* ============================================================
   İlk Çağ 3D Sahnesi — Three.js + bloom + scroll'a bağlı kamera
   Sayfa başına konfigürasyon: agora / temple / library
   ============================================================ */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const canvas = document.getElementById("scene");
const isMobile = window.matchMedia("(max-width: 860px)").matches;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                /noanim/.test(location.search);
if (!canvas || isMobile || reduced) {
  // Hafif sürüm: 3D yok
} else {
  try {
    init(canvas.dataset.scene || "agora");
  } catch (e) {
    // WebGL yoksa sayfa 3D'siz, hafif sürümde yaşamaya devam eder
    canvas.style.display = "none";
    console.warn("3D sahne başlatılamadı, hafif sürüm:", e && e.message);
  }
}

const PINK = 0xdf66bf, BLUE = 0x4d6bff, TURQ = 0x00fff4, GOLD = 0xe8b45a, MARBLE = 0xf5f1e8;

function init(mode) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const night = mode === "library";
  scene.fog = new THREE.FogExp2(night ? 0x05060c : 0x08080d, 0.055);

  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.4, 9);

  // --- Işıklar: altın saat + neon dolgu ---
  scene.add(new THREE.AmbientLight(0xffffff, night ? 0.25 : 0.4));
  const sun = new THREE.DirectionalLight(GOLD, night ? 0.5 : 1.4);
  sun.position.set(6, 8, 4);
  scene.add(sun);
  const fillPink = new THREE.PointLight(PINK, 30, 30); fillPink.position.set(-6, 2, 2); scene.add(fillPink);
  const fillTurq = new THREE.PointLight(TURQ, night ? 40 : 22, 28); fillTurq.position.set(6, -2, 3); scene.add(fillTurq);

  const floaters = new THREE.Group();
  scene.add(floaters);

  // ---------- yardımcılar ----------
  const marbleMat = new THREE.MeshStandardMaterial({ color: MARBLE, roughness: 0.85, metalness: 0.02 });

  function column(x, z, h = 7, r = 0.42) {
    const g = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 20), marbleMat);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(r * 3, r * 0.55, r * 3), marbleMat);
    cap.position.y = h / 2 + r * 0.27;
    const base = cap.clone(); base.position.y = -h / 2 - r * 0.27;
    g.add(shaft, cap, base);
    g.position.set(x, 0, z);
    return g;
  }

  function glowScreenTexture(c1, c2, lines) {
    const cv = document.createElement("canvas"); cv.width = 256; cv.height = 456;
    const ctx = cv.getContext("2d");
    const grd = ctx.createLinearGradient(0, 0, 256, 456);
    grd.addColorStop(0, c1); grd.addColorStop(1, c2);
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 256, 456);
    if (lines) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      for (let i = 0; i < 12; i++) ctx.fillRect(22, 40 + i * 32, 90 + (i * 53) % 120, 5);
    }
    return new THREE.CanvasTexture(cv);
  }

  function phone(x, y, z, s = 1) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.1 * s, 2.2 * s, 0.08 * s),
      new THREE.MeshStandardMaterial({ color: 0x14141e, roughness: 0.4, metalness: 0.6 }));
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0 * s, 2.08 * s),
      new THREE.MeshBasicMaterial({ map: glowScreenTexture("#df66bf", "#0003ff", false) }));
    screen.position.z = 0.05 * s;
    g.add(body, screen);
    g.position.set(x, y, z);
    return g;
  }

  function holoCard(x, y, z, color, s = 1) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5 * s, 0.9 * s),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.32, side: THREE.DoubleSide }));
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(m.geometry),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
    m.add(edge);
    m.position.set(x, y, z);
    m.rotation.set(-0.15, 0.35, 0.05);
    return m;
  }

  function terminal(x, y, z, s = 1) {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.0 * s, 1.3 * s, 0.05 * s),
      new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.5 }));
    const scr = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9 * s, 1.2 * s),
      new THREE.MeshBasicMaterial({ map: glowScreenTexture("#031018", "#04202a", true) }));
    scr.position.z = 0.035 * s;
    g.add(frame, scr);
    g.position.set(x, y, z);
    return g;
  }

  function scroll(x, y, z, s = 1) {
    const g = new THREE.Group();
    const paper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16 * s, 0.16 * s, 1.7 * s, 14),
      new THREE.MeshStandardMaterial({ color: 0xd9c9a3, roughness: 0.9 }));
    paper.rotation.z = Math.PI / 2;
    g.add(paper);
    g.position.set(x, y, z);
    return g;
  }

  function lightThread(from, to, color) {
    const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 1.1, 0));
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const geo = new THREE.TubeGeometry(curve, 32, 0.012, 6, false);
    return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 }));
  }

  function agentFigure(x, y, z) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24),
      new THREE.MeshBasicMaterial({ color: TURQ, transparent: true, opacity: 0.85 }));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.015, 8, 48),
      new THREE.MeshBasicMaterial({ color: PINK, transparent: true, opacity: 0.8 }));
    halo.rotation.x = Math.PI / 2.4;
    const glow = new THREE.PointLight(TURQ, 26, 12);
    g.add(core, halo, glow);
    g.position.set(x, y, z);
    g.userData.spin = true;
    return g;
  }

  // ---------- sahne kurulumları ----------
  const cols = new THREE.Group();
  if (mode === "agora") {
    [[-5.5, -4], [5.5, -5], [-8, -9], [8, -10], [-3.5, -12], [4, -13]].forEach(p => cols.add(column(p[0], p[1])));
    floaters.add(
      phone(2.6, 0.3, 2.2, 0.9),
      holoCard(-3.0, 1.2, 1.5, PINK),
      holoCard(-1.6, -0.9, 2.6, TURQ, 0.75),
      holoCard(3.8, 1.8, -0.5, BLUE, 0.85),
      terminal(-4.2, 0.1, -1.5, 0.9),
      lightThread(new THREE.Vector3(-5.5, 1.5, -4), new THREE.Vector3(2.6, 0.4, 2.2), TURQ),
      lightThread(new THREE.Vector3(5.5, 1.2, -5), new THREE.Vector3(-4.2, 0.2, -1.5), PINK)
    );
  } else if (mode === "temple") {
    [[-4.5, -3], [4.5, -3], [-6.5, -8], [6.5, -8], [0, -14]].forEach(p => cols.add(column(p[0], p[1], 8)));
    floaters.add(
      phone(-2.8, 0.4, 2.4, 1.0),
      phone(3.2, -0.6, 1.2, 0.7),
      holoCard(1.2, 1.6, 0.6, PINK, 0.9),
      holoCard(-4.5, -1.2, 0.4, TURQ, 0.7),
      // mikrofon + ses halkaları
      (() => {
        const g = new THREE.Group();
        const mic = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 6, 14),
          new THREE.MeshStandardMaterial({ color: 0x1a1a26, roughness: 0.35, metalness: 0.7 }));
        for (let i = 1; i <= 3; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34 + i * 0.22, 0.012, 8, 40),
            new THREE.MeshBasicMaterial({ color: PINK, transparent: true, opacity: 0.7 - i * 0.16 }));
          g.add(ring);
        }
        g.add(mic);
        g.position.set(4.6, 1.5, -1.2);
        return g;
      })()
    );
  } else { // library — gece
    [[-5, -4], [5, -4], [-7.5, -9], [7.5, -9]].forEach(p => cols.add(column(p[0], p[1], 8, 0.38)));
    floaters.add(
      scroll(-3.4, 1.1, 1.6, 1.1),
      scroll(2.2, -0.7, 2.4, 0.85),
      scroll(-1.2, 2.0, -0.8, 0.7),
      terminal(3.6, 0.7, 0.4, 1.05),
      terminal(-4.6, -0.4, -1.4, 0.8),
      agentFigure(0.6, 0.5, 3.0),
      lightThread(new THREE.Vector3(-3.4, 1.1, 1.6), new THREE.Vector3(3.6, 0.7, 0.4), TURQ),
      lightThread(new THREE.Vector3(2.2, -0.7, 2.4), new THREE.Vector3(0.6, 0.5, 3.0), PINK)
    );
  }
  scene.add(cols);

  // --- parçacıklar (toz / ateş böceği) ---
  const pGeo = new THREE.BufferGeometry();
  const N = 420, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 26;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 22 - 4;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: night ? TURQ : GOLD, size: 0.035, transparent: true, opacity: night ? 0.5 : 0.55
  }));
  scene.add(particles);

  // --- bloom ---
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), night ? 0.9 : 0.65, 0.85, 0.82);
  composer.addPass(bloom);

  // --- scroll'a bağlı kamera yolculuğu ---
  let scrollT = 0;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollT = max > 0 ? window.scrollY / max : 0;
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- fare parallax ---
  let mx = 0, my = 0;
  addEventListener("pointermove", e => {
    mx = (e.clientX / innerWidth - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // yüzen objeler: fizik esinli salınım
    floaters.children.forEach((o, i) => {
      o.position.y += Math.sin(t * (0.5 + i * 0.11) + i * 1.7) * 0.0035;
      o.rotation.y = Math.sin(t * 0.22 + i) * 0.18;
      o.rotation.x = Math.cos(t * 0.18 + i * 2.1) * 0.06;
      if (o.userData.spin) o.rotation.y = t * 0.45;
    });
    particles.rotation.y = t * 0.014;

    // kamera: scroll ile agora'dan stüdyoya süzülme
    const target = scrollT;
    camera.position.z = 9 - target * 6.5;
    camera.position.y = 0.4 + target * 1.1 + my * -0.18;
    camera.position.x = Math.sin(target * Math.PI * 0.6) * 1.6 + mx * 0.35;
    camera.lookAt(0, 0.2 + target * 0.6, target * -4);

    // ışık nefesi
    fillPink.intensity = 26 + Math.sin(t * 1.3) * 7;
    fillTurq.intensity = (night ? 36 : 20) + Math.cos(t * 1.1) * 6;

    composer.render();
  })();
}
