const revealNodes = document.querySelectorAll(".reveal");
if (revealNodes.length) {
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }
}

const flowSections = document.querySelectorAll(".section");
if (flowSections.length) {
  let ticking = false;

  const updateFlow = () => {
    flowSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const sectionCenter = rect.top + rect.height / 2;
      const distance = (sectionCenter - viewportCenter) / window.innerHeight;
      const shift = Math.max(-14, Math.min(14, distance * 18));

      section.style.transform = `translateY(${shift}px)`;
    });
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateFlow);
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateFlow);
  updateFlow();
}

const heroCosmos = document.getElementById("heroCosmos");
if (heroCosmos && window.THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x09090b, 0.00075);

  const camera = new THREE.PerspectiveCamera(
    55,
    heroCosmos.clientWidth / Math.max(heroCosmos.clientHeight, 1),
    0.1,
    1200
  );
  camera.position.set(0, 0, 140);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(heroCosmos.clientWidth, heroCosmos.clientHeight);
  heroCosmos.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xc9a778, 0.9);
  scene.add(ambient);
  const point = new THREE.PointLight(0xffd89b, 1.2, 700);
  point.position.set(40, 30, 160);
  scene.add(point);

  const createStarLayer = (count, spread, size, opacity, color) => {
    const geometry = new THREE.BufferGeometry();
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      points[i3] = (Math.random() - 0.5) * spread.x;
      points[i3 + 1] = (Math.random() - 0.5) * spread.y;
      points[i3 + 2] = (Math.random() - 0.5) * spread.z;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const material = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geometry, material);
  };

  const starsFar = createStarLayer(
    2200,
    { x: 1200, y: 800, z: 1200 },
    0.8,
    0.6,
    0xdadfea
  );
  const starsMid = createStarLayer(
    1400,
    { x: 900, y: 560, z: 900 },
    1.1,
    0.78,
    0xfde9c8
  );
  const starsNear = createStarLayer(
    500,
    { x: 700, y: 420, z: 700 },
    1.7,
    0.9,
    0xfff6df
  );
  scene.add(starsFar, starsMid, starsNear);

  const dustCloud = createStarLayer(
    800,
    { x: 760, y: 420, z: 700 },
    2.4,
    0.14,
    0xc18f4d
  );
  scene.add(dustCloud);

  const createGalaxyCluster = (x, y, z, radius, pointsCount, color) => {
    const clusterGeo = new THREE.BufferGeometry();
    const pts = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i += 1) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.55) * radius;
      pts[i3] = x + Math.cos(angle) * r;
      pts[i3 + 1] = y + Math.sin(angle) * r * 0.55;
      pts[i3 + 2] = z + (Math.random() - 0.5) * 32;
    }
    clusterGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    return new THREE.Points(
      clusterGeo,
      new THREE.PointsMaterial({
        color,
        size: 1.9,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
  };

  const clusterA = createGalaxyCluster(-120, -20, -180, 120, 620, 0xc07d31);
  const clusterB = createGalaxyCluster(140, 30, -210, 100, 520, 0x7d8fc9);
  scene.add(clusterA, clusterB);

  const geometryGroup = new THREE.Group();
  geometryGroup.position.set(0, -4, -60);
  scene.add(geometryGroup);

  const ringMaterial = new THREE.LineBasicMaterial({
    color: 0xf0c17a,
    transparent: true,
    opacity: 0.34
  });

  const createRing = (radius, segments = 120) => {
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(t) * radius, Math.sin(t) * radius, 0));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(ringGeo, ringMaterial);
  };

  geometryGroup.add(createRing(20));
  geometryGroup.add(createRing(33));
  geometryGroup.add(createRing(47));

  const triMaterial = new THREE.LineBasicMaterial({
    color: 0xffe0ad,
    transparent: true,
    opacity: 0.3
  });

  const addTriangle = (radius, rotation = 0, yScale = 0.92) => {
    const points = [];
    for (let i = 0; i < 4; i += 1) {
      const angle = rotation + (i % 3) * ((Math.PI * 2) / 3) - Math.PI / 2;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * yScale,
          0
        )
      );
    }
    const triGeo = new THREE.BufferGeometry().setFromPoints(points);
    const tri = new THREE.Line(triGeo, triMaterial);
    geometryGroup.add(tri);
  };

  addTriangle(46, 0);
  addTriangle(46, Math.PI);
  addTriangle(34, Math.PI / 12);
  addTriangle(34, Math.PI + Math.PI / 12);

  const lotusMat = new THREE.PointsMaterial({
    color: 0xffedca,
    size: 1.4,
    transparent: true,
    opacity: 0.72
  });
  const lotusPoints = [];
  const petals = 16;
  for (let i = 0; i < petals; i += 1) {
    const angle = (i / petals) * Math.PI * 2;
    lotusPoints.push(
      new THREE.Vector3(
        Math.cos(angle) * 56,
        Math.sin(angle) * 56 * 0.9,
        0
      )
    );
  }
  const lotusGeo = new THREE.BufferGeometry().setFromPoints(lotusPoints);
  geometryGroup.add(new THREE.Points(lotusGeo, lotusMat));

  const mouseTarget = { x: 0, y: 0 };
  window.addEventListener("mousemove", (event) => {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    mouseTarget.x = (x - 0.5) * 2;
    mouseTarget.y = (y - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  const animate = () => {
    const t = clock.getElapsedTime();
    starsFar.rotation.y = t * 0.007;
    starsMid.rotation.y = t * 0.013;
    starsNear.rotation.y = t * 0.019;
    starsNear.rotation.x = Math.sin(t * 0.07) * 0.045;

    dustCloud.rotation.y = -t * 0.01;
    dustCloud.rotation.x = Math.sin(t * 0.1) * 0.03;
    clusterA.rotation.z = t * 0.012;
    clusterB.rotation.z = -t * 0.01;
    geometryGroup.rotation.z = Math.sin(t * 0.15) * 0.06;
    geometryGroup.rotation.y = Math.cos(t * 0.13) * 0.08;

    camera.position.x += ((mouseTarget.x * 16) - camera.position.x) * 0.03;
    camera.position.y += ((-mouseTarget.y * 9) - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -120);

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };
  animate();

  const onResize = () => {
    const w = heroCosmos.clientWidth;
    const h = heroCosmos.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);
} else if (heroCosmos) {
  heroCosmos.setAttribute("data-fallback", "true");
}
