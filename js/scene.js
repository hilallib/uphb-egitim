/* ============================================================
   Atmosfer Katmanı — tabloların üzerinde yaşayan derinlik
   Toz zerreleri + neon ateşböcekleri + süzülen hologram kartları
   (mix-blend: screen → görsellerin ışığına karışır)
   ============================================================ */
import * as THREE from "three";

const canvas = document.getElementById("scene");
const isMobile = window.matchMedia("(max-width: 860px)").matches;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
                /noanim/.test(location.search);

if (canvas && !isMobile && !reduced) {
  try { init(canvas.dataset.scene || "day"); }
  catch (e) { canvas.style.display = "none"; console.warn("Atmosfer katmanı kapalı:", e && e.message); }
}

const HOLO_DATA = {
  pink: {
    video: "assets/video-anka-lb.mp4", poster: "assets/scene-anka.jpg",
    title: "Gün 1 · Üretken YZ", theme: "İlk Çağ'dan Üretken Zekâya",
    href: "gun1.html", cta: "Gün 1'i keşfet →", color: "#df66bf"
  },
  turq: {
    video: "assets/video-evrim-lb.mp4", poster: "assets/scene-evrim.jpg",
    title: "Gün 2 · Vibe Coding", theme: "Agora'dan Agent'a",
    href: "gun2.html", cta: "Gün 2'yi keşfet →", color: "#00fff4"
  },
  blue: {
    video: "assets/video-kozmik-lb.mp4", poster: "assets/scene-posthuman.jpg",
    title: "Çağ V · Posthuman Sıçrama", theme: "Analog kalp, dijital zekâ",
    href: "#basvuru", cta: "Ücretsiz görüşmeye başvur →", color: "#4d6bff"
  }
};

function init(mode) {
  const night = mode === "night";
  const PINK = 0xdf66bf, TURQ = 0x00fff4, GOLD = 0xe8b45a, BLUE = 0x4d6bff;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 60);
  camera.position.z = 10;

  // ---- katman A: altın/gümüş toz (yakın plan, iri, yavaş) ----
  function dust(count, size, spreadZ, color, opacity) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spreadZ;
      phase[i] = Math.random() * Math.PI * 2;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color, size, transparent: true, opacity,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(geo, mat);
    pts.userData.phase = phase;
    scene.add(pts);
    return pts;
  }
  const dustFar  = dust(700, 0.035, 14, night ? 0x8899ff : GOLD, night ? 0.35 : 0.4);
  const dustNear = dust(160, 0.10, 6, night ? TURQ : 0xfff2cc, night ? 0.5 : 0.45);
  const fireflies = dust(70, 0.16, 8, night ? TURQ : PINK, 0.85);

  // ---- katman B: süzülen hologram kartları (hafif, seyrek) ----
  const floaters = new THREE.Group();
  scene.add(floaters);
  function holo(x, y, z, color, s, rot, key) {
    const g = new THREE.Group();
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5 * s, 0.94 * s),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.10, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(plane.geometry),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.6 }));
    g.add(plane, edge);
    g.position.set(x, y, z);
    g.rotation.set(rot[0], rot[1], rot[2]);
    g.userData = { key, plane, edge, hover: 0 };
    floaters.add(g);
  }
  if (night) {
    holo(-7.5, 2.6, -3, TURQ, 1.1, [-0.1, 0.5, 0.06], "turq");
    holo(8.0, -2.2, -5, PINK, 1.5, [0.14, -0.4, -0.05], "pink");
    holo(6.4, 3.4, -2, BLUE, 0.8, [0.05, -0.25, 0.1], "blue");
  } else {
    holo(-8.2, 3.0, -4, PINK, 1.3, [-0.12, 0.45, 0.05], "pink");
    holo(8.6, 2.2, -6, TURQ, 1.6, [0.1, -0.5, -0.04], "turq");
    holo(-6.8, -3.0, -2, BLUE, 0.9, [0.16, 0.3, 0.08], "blue");
  }

  // ---- kareler tıklanabilir: raycast → hover parlaması + ışıklı video ----
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = null;
  function overUI(e) {
    return e.target && e.target.closest &&
      e.target.closest("a, button, input, textarea, select, label, form, nav, header, .holo-lb");
  }
  function pick(e) {
    if (overUI(e)) { setHover(null); return; }
    ndc.x = (e.clientX / innerWidth) * 2 - 1;
    ndc.y = -(e.clientY / innerHeight) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(floaters.children, true)[0];
    setHover(hit ? hit.object.parent : null);
  }
  function setHover(g) {
    if (hovered === g) return;
    hovered = g;
    document.body.classList.toggle("holo-hover", !!g);
  }
  addEventListener("click", e => {
    if (overUI(e)) return;
    pick(e);
    const d = hovered && HOLO_DATA[hovered.userData.key];
    if (!d) return;
    window.dispatchEvent(new CustomEvent("holo-open", {
      detail: Object.assign({
        fx: (e.clientX / innerWidth) * 100,
        fy: (e.clientY / innerHeight) * 100
      }, d)
    }));
  });

  // ---- katman C: iki ışık ipliği (nefes alan bezier tüpler) ----
  function thread(a, b, lift, color) {
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, lift, 0));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 40, 0.008, 6, false),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(mesh);
    return mesh;
  }
  const t1 = thread(new THREE.Vector3(-9, -3.5, -4), new THREE.Vector3(9, 2.5, -6), 3.2, night ? TURQ : PINK);
  const t2 = thread(new THREE.Vector3(9, -2.8, -3), new THREE.Vector3(-8, 3.4, -7), -2.6, night ? PINK : TURQ);

  // ---- hareket ----
  let mx = 0, my = 0, scrollY = 0;
  addEventListener("pointermove", e => {
    mx = (e.clientX / innerWidth - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
    pick(e);
  }, { passive: true });
  addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // toz: ağır süzülme + scroll ile ters akış (derinlik hissi)
    [dustFar, dustNear, fireflies].forEach((p, li) => {
      p.rotation.y = t * 0.008 * (li + 1);
      p.position.y = ((scrollY * 0.0006) * (li + 1)) % 4;
      p.material.opacity = p.material.opacity; // sabit
    });
    // ateşböcekleri nefes alır
    fireflies.material.size = 0.13 + Math.sin(t * 1.6) * 0.045;

    // hologramlar süzülür + hover'da parlar
    floaters.children.forEach((g, i) => {
      g.position.y += Math.sin(t * (0.4 + i * 0.13) + i * 2.2) * 0.004;
      g.rotation.y += 0.0007 * (i % 2 ? 1 : -1);
      const u = g.userData;
      u.hover += ((g === hovered ? 1 : 0) - u.hover) * 0.12;
      u.plane.material.opacity = 0.10 + u.hover * 0.22;
      u.edge.material.opacity = 0.6 + u.hover * 0.4;
      g.scale.setScalar(1 + u.hover * 0.14);
    });

    // iplikler nefes alır
    t1.material.opacity = 0.22 + Math.sin(t * 0.8) * 0.14;
    t2.material.opacity = 0.22 + Math.cos(t * 0.66) * 0.14;

    // kamera: fare + scroll paralaksı
    camera.position.x += (mx * 0.9 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.6 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, -3);

    renderer.render(scene, camera);
  })();
}
