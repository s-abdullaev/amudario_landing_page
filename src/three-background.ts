import * as THREE from 'three';

const PARTICLE_COUNT = 1500;

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particlesMesh: THREE.Points;
let clock: THREE.Clock;

export function initBackground(container: HTMLElement): void {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
  camera.position.z = 250;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  // Particle field
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  const col = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 600;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 600;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 400;
    const m = Math.random();
    col[i * 3]     = m * 0.0;
    col[i * 3 + 1] = 0.5 + m * 0.4;
    col[i * 3 + 2] = 0.4 + (1 - m) * 0.45;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  particlesMesh = new THREE.Points(geo, new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  scene.add(particlesMesh);

  // Grid
  const gridPoints: number[] = [];
  const spacing = 40, count = 16;
  for (let i = -count; i <= count; i++) {
    gridPoints.push(-count * spacing, i * spacing, -100, count * spacing, i * spacing, -100);
    gridPoints.push(i * spacing, -count * spacing, -100, i * spacing, count * spacing, -100);
  }
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
  scene.add(new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({
    color: 0x00e5a0, transparent: true, opacity: 0.03,
  })));

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // Start animation
  animate();
}

function animate(): void {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  const scrollFraction = scrollY / (document.body.scrollHeight - innerHeight);

  particlesMesh.rotation.y = elapsed * 0.03 + scrollFraction * 1.5;
  particlesMesh.rotation.x = Math.sin(elapsed * 0.05) * 0.15 + scrollFraction * 0.5;

  const positions = particlesMesh.geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3 + 1] += Math.sin(elapsed + i * 0.1) * 0.015;
  }
  particlesMesh.geometry.attributes.position.needsUpdate = true;

  renderer.render(scene, camera);
}
