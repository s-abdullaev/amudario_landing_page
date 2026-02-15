/* ============================================================
   AMUDAR.IO v4 — Scroll-Driven Product Stories + Callout Boxes
   ============================================================ */

/* roundRect polyfill */
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (typeof r === 'number') r = [r, r, r, r];
        const [tl, tr, br, bl] = r || [0,0,0,0];
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();
        return this;
    };
}

/* helper: ease in-out */
function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function subT(t, start, end) { return clamp((t - start) / (end - start), 0, 1); }

/* =========================================================
   1. THREE.JS BACKGROUND
   ========================================================= */
const bgContainer = document.getElementById('three-bg');
let scene, camera, renderer, particlesMesh, clock;
const PC = 1500;

function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
    camera.position.z = 250;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    bgContainer.appendChild(renderer.domElement);
    clock = new THREE.Clock();

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(PC * 3), col = new Float32Array(PC * 3);
    for (let i = 0; i < PC; i++) {
        pos[i*3]   = (Math.random()-0.5)*600;
        pos[i*3+1] = (Math.random()-0.5)*600;
        pos[i*3+2] = (Math.random()-0.5)*400;
        const m = Math.random();
        col[i*3]   = m*0.0;
        col[i*3+1] = 0.5+m*0.4;
        col[i*3+2] = 0.4+(1-m)*0.45;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    particlesMesh = new THREE.Points(geo, new THREE.PointsMaterial({
        size: 2, vertexColors: true, transparent: true, opacity: 0.5,
        sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(particlesMesh);

    /* grid */
    const gp = []; const sp = 40, cnt = 16;
    for (let i = -cnt; i <= cnt; i++) {
        gp.push(-cnt*sp, i*sp, -100, cnt*sp, i*sp, -100);
        gp.push(i*sp, -cnt*sp, -100, i*sp, cnt*sp, -100);
    }
    const gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
    scene.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: 0x00e5a0, transparent: true, opacity: 0.03 })));
}

function animThree() {
    requestAnimationFrame(animThree);
    const t = clock.getElapsedTime();
    const sf = scrollY / (document.body.scrollHeight - innerHeight);
    particlesMesh.rotation.y = t * 0.03 + sf * 1.5;
    particlesMesh.rotation.x = Math.sin(t * 0.05) * 0.15 + sf * 0.5;
    const p = particlesMesh.geometry.attributes.position.array;
    for (let i = 0; i < PC; i++) p[i*3+1] += Math.sin(t + i*0.1)*0.015;
    particlesMesh.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

initThree(); animThree();
addEventListener('resize', () => { camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

/* =========================================================
   2. GENERIC STORY HELPERS
   ========================================================= */
function getStoryT(section) {
    const r = section.getBoundingClientRect();
    const range = section.offsetHeight - innerHeight;
    return clamp(-r.top / range, 0, 1);
}

function resizeCanvas(canvas) {
    const p = canvas.parentElement;
    if (canvas.width !== p.clientWidth || canvas.height !== p.clientHeight) {
        canvas.width = p.clientWidth; canvas.height = p.clientHeight;
    }
}

/* setup each story canvas */
const stories = ['explode', 'jayhun', 'airsense', 'gozan'];
const canvases = {}, ctxs = {}, sections = {}, captions = {}, progressBars = {}, factContainers = {};
stories.forEach(id => {
    const cId = id + 'Canvas';
    canvases[id] = document.getElementById(cId);
    ctxs[id] = canvases[id].getContext('2d');
    sections[id] = canvases[id].closest('.story-section');
    captions[id] = sections[id].querySelector('.story-caption');
    progressBars[id] = sections[id].querySelector('.story-progress-fill');
    factContainers[id] = sections[id].querySelector('.story-facts');
});

function updateProgress(id, t) {
    if (progressBars[id]) progressBars[id].style.width = (t * 100) + '%';
}

function setCaption(id, text) {
    if (captions[id] && captions[id].textContent !== text) captions[id].textContent = text;
}

/* Reveal facts based on scroll t */
function revealFacts(id, t) {
    if (!factContainers[id]) return;
    factContainers[id].querySelectorAll('.fact').forEach(fact => {
        const threshold = parseFloat(fact.dataset.appear);
        fact.classList.toggle('visible', t >= threshold);
    });
}

/* =========================================================
   Helper: Callout Box (connected to device with a line)
   ========================================================= */
function drawCalloutBox(ctx, w, h, deviceX, deviceY, title, items, t, side) {
    const alpha = easeInOut(t);
    if (alpha < 0.01) return;

    const boxW = 220;
    const boxH = 30 + items.length * 32;
    // Position the box to the side of the device
    const offsetX = side === 'left' ? -boxW - 60 : 60;
    const boxX = deviceX + offsetX;
    const boxY = deviceY - boxH / 2;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Connecting line from device to box
    const lineStartX = deviceX + (side === 'left' ? -10 : 10);
    const lineEndX = side === 'left' ? boxX + boxW : boxX;
    ctx.beginPath();
    ctx.moveTo(lineStartX, deviceY);
    ctx.lineTo(lineEndX, deviceY);
    ctx.strokeStyle = 'rgba(0,229,160,0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Small dot at device end
    ctx.beginPath(); ctx.arc(lineStartX, deviceY, 3, 0, Math.PI*2);
    ctx.fillStyle = '#00E5A0'; ctx.fill();

    // Glass panel
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(10, 15, 26, 0.88)';
    ctx.beginPath(); ctx.roundRect(boxX, boxY, boxW, boxH, 12); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(0,229,160,0.25)'; ctx.lineWidth = 1; ctx.stroke();

    // Title
    ctx.font = '600 11px Inter'; ctx.fillStyle = '#00E5A0';
    ctx.textAlign = 'left';
    ctx.fillText(title, boxX + 16, boxY + 22);

    // Items
    items.forEach((item, i) => {
        const iy = boxY + 44 + i * 30;
        ctx.font = '400 10px Inter'; ctx.fillStyle = 'rgba(240,244,255,0.5)';
        ctx.fillText(item.label, boxX + 16, iy);
        ctx.font = '700 15px Outfit'; ctx.fillStyle = item.color || '#f0f4ff';
        ctx.fillText(item.value, boxX + 16, iy + 17);
        if (item.unit) {
            const tw = ctx.measureText(item.value).width;
            ctx.font = '400 9px Inter'; ctx.fillStyle = 'rgba(240,244,255,0.35)';
            ctx.fillText(item.unit, boxX + 16 + tw + 4, iy + 17);
        }
    });

    ctx.restore();
}

/* =========================================================
   3. OXUS WS — Cotton Field + Station
   ========================================================= */
function drawExplode(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    const now = Date.now() / 1000;

    /* Sky */
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#0a1a2a');
    skyGrad.addColorStop(1, '#152535');
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, w, h);

    const horizon = h * 0.55;
    const bloomT = subT(t, 0.2, 0.8);

    ctx.save();
    ctx.fillStyle = '#0d1a12'; ctx.fillRect(0, horizon, w, h - horizon);

    /* Cotton rows */
    const rows = 12;
    for (let r = 0; r < rows; r++) {
        const prog = r / rows;
        const y = horizon + Math.pow(prog, 1.4) * (h - horizon);
        const scale = 0.3 + 0.7 * prog;
        const rowW = w * (0.6 + 2 * prog);
        const rowX = w / 2;
        const count = 8 + r * 2;
        const spacing = rowW / count;
        for (let p = 0; p < count; p++) {
            const px = rowX - rowW/2 + p*spacing + (r%2)*spacing*0.5;
            const seed = r*99 + p*13;
            const wind = Math.sin(now + seed) * 3 * scale;
            ctx.beginPath();
            ctx.arc(px + wind, y, 25 * scale, 0, Math.PI, true);
            ctx.fillStyle = `rgba(30, ${60 + r*5}, 40, ${0.4 + 0.6*prog})`;
            ctx.fill();
            const numBolls = 2 + (seed % 2);
            for (let b = 0; b < numBolls; b++) {
                const bx = px + wind + Math.sin(seed + b) * 15 * scale;
                const by = y - Math.cos(seed + b) * 10 * scale;
                const open = Math.max(0, Math.min(1, bloomT * 1.5 + Math.sin(seed)*0.5 - 0.2));
                const size = (4 + 6 * open) * scale;
                ctx.beginPath(); ctx.arc(bx, by, size, 0, Math.PI*2);
                const gb = Math.floor(lerp(40, 240, open));
                ctx.fillStyle = `rgb(${Math.floor(lerp(20, 240, open))}, ${gb}, ${Math.floor(lerp(20, 240, open))})`;
                ctx.fill();
            }
        }
    }
    ctx.restore();

    /* Weather Station (Right side) */
    const sc = Math.min(w, h) / 600;
    const sx = w * 0.72, sy = h * 0.48;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(sc, sc);

    /* Main Pole */
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath(); ctx.roundRect(-6, -150, 12, 350, 4); ctx.fill();
    ctx.strokeStyle = '#808080'; ctx.lineWidth = 1; ctx.stroke();

    /* Cross-Arm + Anemometer */
    ctx.save(); ctx.translate(0, -140);
    ctx.fillStyle = '#A0A0A0';
    ctx.beginPath(); ctx.roundRect(-60, -4, 120, 8, 2); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(-55, -5);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-10); ctx.stroke();
    const rot = t * 25 + now * 0.5;
    ctx.save(); ctx.translate(0, -10); ctx.scale(1, 0.3);
    for(let a=0; a<3; a++){
        const ang = rot + a * (Math.PI*2/3);
        const cx = Math.cos(ang)*15, cy = Math.sin(ang)*15;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(cx, cy);
        ctx.strokeStyle='#808080'; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI*2);
        ctx.fillStyle = '#00E5A0'; ctx.fill();
    }
    ctx.restore(); ctx.restore();

    /* Wind Vane */
    ctx.save(); ctx.translate(55, -5);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-10); ctx.stroke();
    ctx.save(); ctx.translate(0, -10);
    ctx.rotate(Math.sin(now)*0.5 + t*2);
    ctx.beginPath();
    ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.lineTo(10, -5); ctx.moveTo(15, 0); ctx.lineTo(10, 5);
    ctx.strokeStyle = '#00B4D8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore(); ctx.restore();
    ctx.restore(); // Cross-Arm

    /* Solar Panel */
    ctx.save(); ctx.translate(0, 20); ctx.rotate(0.4);
    ctx.beginPath(); ctx.roundRect(-15, -5, 5, 40, 2); ctx.fillStyle='#808080'; ctx.fill();
    ctx.translate(0, 20); ctx.rotate(-0.6);
    ctx.beginPath(); ctx.roundRect(-30, -5, 60, 40, 2);
    ctx.fillStyle = '#1a3a5c'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,180,216,0.6)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();

    /* Sensor Box */
    ctx.save(); ctx.translate(0, -60);
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath(); ctx.roundRect(-15, -20, 30, 40, 4); ctx.fill();
    ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -10, 3, 0, Math.PI*2);
    ctx.fillStyle = '#00E5A0'; ctx.globalAlpha = 0.5 + Math.sin(now*3)*0.5; ctx.fill(); ctx.globalAlpha=1;
    ctx.restore();

    ctx.restore(); // End station

    /* Callout Box */
    if (t > 0.35) {
        drawCalloutBox(ctx, w, h, sx, sy - 30*sc, 'FIELD CONDITIONS', [
            { label: 'Wind Speed', value: (12 + t*15).toFixed(1), unit: 'km/h', color: '#00E5A0' },
            { label: 'Temperature', value: '28.5', unit: '°C', color: '#FFB347' },
            { label: 'Humidity', value: '42', unit: '%', color: '#4DA8FF' },
            { label: 'Pressure', value: '1012', unit: 'hPa', color: '#f0f4ff' }
        ], subT(t, 0.35, 0.55), 'left');
    }

    const msgs = [
        'Monitoring vast cotton fields…',
        'Smart sensors track microclimate data',
        'Cotton buds opening in optimal conditions',
        'Real-time wind and weather analysis',
        'Ensuring healthy crop cycles with precision data'
    ];
    setCaption('explode', msgs[Math.min(Math.floor(t * msgs.length), msgs.length - 1)]);
}

/* =========================================================
   4. JAYHUN — Moth Trap + Wheat Field
   ========================================================= */
const moths = []; const MOTH_COUNT = 5;
for (let i = 0; i < MOTH_COUNT; i++) {
    moths.push({
        x: Math.random(), y: Math.random(),
        size: 8 + Math.random() * 10,
        speed: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        wingPhase: Math.random() * Math.PI * 2,
    });
}

function drawMoth(ctx, x, y, size, wingAngle, alpha) {
    ctx.save(); ctx.translate(x, y); ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.ellipse(0, 0, size*0.15, size*0.4, 0, 0, Math.PI*2);
    ctx.fillStyle = '#8B7355'; ctx.fill();
    ctx.save(); ctx.rotate(wingAngle);
    ctx.beginPath(); ctx.ellipse(-size*0.35, -size*0.1, size*0.45, size*0.25, -0.3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(160,130,90,0.7)'; ctx.fill();
    ctx.restore();
    ctx.save(); ctx.rotate(-wingAngle);
    ctx.beginPath(); ctx.ellipse(size*0.35, -size*0.1, size*0.45, size*0.25, 0.3, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(160,130,90,0.7)'; ctx.fill();
    ctx.restore();
    ctx.restore();
}

function drawJayhun(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);
    const now = Date.now() / 1000;

    /* Night Sky */
    const nightGrad = ctx.createLinearGradient(0, 0, 0, h);
    nightGrad.addColorStop(0, '#050a18'); nightGrad.addColorStop(1, '#0a1428');
    ctx.fillStyle = nightGrad; ctx.fillRect(0, 0, w, h);

    /* Stars (deterministic) */
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 40; i++) {
        const sx = ((i * 137) % w), sy = ((i * 97) % (h * 0.6));
        const starSize = 0.5 + (i % 3) * 0.5;
        ctx.beginPath(); ctx.arc(sx, sy, starSize, 0, Math.PI*2); ctx.fill();
    }

    const horizon = h * 0.6;
    ctx.fillStyle = '#1a1510'; ctx.fillRect(0, horizon, w, h - horizon);

    /* Wheat field (grows with scroll) */
    const growth = subT(t, 0.05, 0.6);
    const wheatRows = 10;
    for(let r = 0; r < wheatRows; r++) {
        const prog = r / wheatRows;
        const y = horizon + Math.pow(prog, 1.5) * (h - horizon);
        const rowW = w * (0.8 + 1.5 * prog);
        const count = 18 + r * 4;
        const spacing = rowW / count;
        for(let p = 0; p < count; p++) {
            const px = w/2 - rowW/2 + p*spacing + (r%2)*spacing*0.5;
            const seed = r*13 + p*7;
            const maxH = 20 + 55 * prog;
            const currentH = maxH * (0.2 + 0.8 * growth);
            const sway = Math.sin(now * 0.8 + seed) * 4 * prog;
            ctx.beginPath();
            ctx.moveTo(px, y);
            ctx.quadraticCurveTo(px + sway * 0.5, y - currentH * 0.5, px + sway, y - currentH);
            ctx.strokeStyle = `rgba(180, 160, 100, ${0.3 + 0.7*prog})`;
            ctx.lineWidth = 1 + 2*prog;
            ctx.stroke();
            if(growth > 0.3) {
                ctx.beginPath();
                ctx.ellipse(px + sway, y - currentH, 3*prog, 8*prog, sway*0.05, 0, Math.PI*2);
                ctx.fillStyle = `rgba(220, 190, 80, ${0.5+0.5*prog})`;
                ctx.fill();
            }
        }
    }

    /* Trap (centered, right side) */
    const trapX = w * 0.65, trapY = h * 0.48;
    const zoom = 1 + easeInOut(subT(t, 0.25, 0.6)) * 1.5;
    ctx.save();
    ctx.translate(trapX, trapY); ctx.scale(zoom, zoom); ctx.translate(-trapX, -trapY);

    // Pole
    ctx.fillStyle = '#2a3a2a'; ctx.fillRect(trapX - 3, trapY, 6, h * 0.25);
    // Funnel
    ctx.beginPath(); ctx.moveTo(trapX - 50, trapY - 20); ctx.lineTo(trapX + 50, trapY - 20);
    ctx.lineTo(trapX + 30, trapY + 30); ctx.lineTo(trapX - 30, trapY + 30); ctx.closePath();
    ctx.fillStyle = '#1a3a1a'; ctx.fill(); ctx.strokeStyle = 'rgba(0,229,160,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    // Roof
    ctx.beginPath(); ctx.moveTo(trapX - 60, trapY - 20); ctx.lineTo(trapX, trapY - 50); ctx.lineTo(trapX + 60, trapY - 20); ctx.closePath();
    ctx.fillStyle = '#1e3020'; ctx.fill(); ctx.strokeStyle = 'rgba(0,229,160,0.2)'; ctx.stroke();
    // Glow
    const glowR = 40 + Math.sin(now * 2) * 8;
    const glowGrad = ctx.createRadialGradient(trapX, trapY, 5, trapX, trapY, glowR);
    glowGrad.addColorStop(0, 'rgba(255,200,50,0.3)'); glowGrad.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = glowGrad; ctx.beginPath(); ctx.arc(trapX, trapY, glowR, 0, Math.PI*2); ctx.fill();
    // Sticky plate
    if (t > 0.3) {
        ctx.globalAlpha = subT(t, 0.3, 0.45);
        ctx.fillStyle = '#3a3520'; ctx.fillRect(trapX - 25, trapY + 5, 50, 25);
        ctx.globalAlpha = 1;
    }

    /* Moths */
    moths.forEach((m, i) => {
        const wingAng = Math.sin(now * 8 + m.wingPhase) * 0.4;
        let mx, my;
        if (t < 0.2) {
            const flyT = t / 0.2;
            mx = lerp(m.x * w, trapX + (i - 2) * 12, flyT * m.speed);
            my = lerp(m.y * h * 0.5, trapY - 10, flyT * m.speed);
        } else if (t < 0.45) {
            mx = trapX + (i - 2) * 8;
            my = trapY + 10 + (i % 3) * 5;
        } else {
            mx = trapX - 15 + (i % 3) * 15;
            my = trapY + 10 + Math.floor(i / 3) * 10;
        }
        drawMoth(ctx, mx, my, m.size * (t > 0.4 ? 1 : 0.7), wingAng, 1);
        /* AI Detection Box */
        if (t > 0.5 && t < 0.95 && i < Math.floor(subT(t, 0.5, 0.7) * MOTH_COUNT)) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,229,160,0.8)'; ctx.lineWidth = 1/zoom;
            ctx.setLineDash([3/zoom, 2/zoom]);
            ctx.strokeRect(mx - m.size*0.5, my - m.size*0.5, m.size, m.size);
            ctx.font = `${9/zoom}px Inter`; ctx.fillStyle = '#00E5A0';
            ctx.fillText(`${(85 + i*2)}%`, mx - m.size*0.5, my - m.size*0.5 - 2/zoom);
            ctx.restore();
        }
    });
    ctx.restore(); // End zoom

    /* Callout Box */
    if (t > 0.45) {
        const count = Math.min(5, Math.floor(subT(t, 0.45, 0.8) * 5.5));
        drawCalloutBox(ctx, w, h, trapX, trapY, 'PEST ANALYSIS', [
            { label: 'Species', value: 'Helicoverpa', color: '#00E5A0' },
            { label: 'Count', value: count.toString(), color: '#FF6B6B' },
            { label: 'Confidence', value: '94%', color: '#4DA8FF' },
        ], subT(t, 0.45, 0.65), 'left');
    }

    const msgs = ['Wheat ripening under the night sky…', 'Moths lured by pheromones…', 'Pests captured on sticky plate', 'AI identifies species instantly', 'Automated counting for precision data'];
    setCaption('jayhun', msgs[Math.min(Math.floor(t * msgs.length), msgs.length - 1)]);
}

/* =========================================================
   5. AIRSENSE — Urban Setting + Plant Gas Sensing
   ========================================================= */
const smokeParts = [];
for (let i = 0; i < 60; i++) smokeParts.push({ x: 0, y: 0, r: 3+Math.random()*8, alpha: 0.2+Math.random()*0.3, phase: Math.random()*10, speed: 0.5+Math.random()*0.5, hue: Math.random()>0.5?0:30 });

/* Pre-generated city buildings */
const cityBuildings = [];
for (let i = 0; i < 25; i++) {
    const seed = i * 7 + 3;
    const bh = 40 + Math.abs(Math.sin(seed * 1.7)) * 60 + Math.abs(Math.cos(seed * 0.3)) * 30;
    const bw = 25 + Math.abs(Math.sin(seed * 3.1)) * 35;
    const gap = Math.abs(Math.sin(seed * 2.3)) * 8;
    const windows = [];
    const cols = Math.floor(bw / 8);
    const brows = Math.floor(bh / 12);
    for (let wy = 0; wy < brows; wy++) {
        for (let wx = 0; wx < cols; wx++) {
            const litSeed = (i * 31 + wy * 7 + wx * 13) % 100;
            if (litSeed < 40) {
                windows.push({ wx, wy, warmth: litSeed % 3 });
            }
        }
    }
    cityBuildings.push({ bh, bw, gap, windows, cols, rows: brows });
}

/* Pre-generated park trees */
const parkTrees = [];
for (let i = 0; i < 8; i++) {
    parkTrees.push({
        x: 0.3 + Math.abs(Math.sin(i * 4.7)) * 0.5,
        size: 20 + Math.abs(Math.sin(i * 2.3)) * 25,
        hue: 100 + Math.floor(Math.abs(Math.sin(i * 3.1)) * 60),
    });
}

function drawAirsense(ctx, w, h, t) {
    ctx.clearRect(0,0,w,h);
    const now = Date.now()/1000;

    /* Hazy urban sky */
    const pollLevel = subT(t, 0.1, 0.5);
    const skyGrad = ctx.createLinearGradient(0,0,0,h);
    const r = lerp(25, 55, pollLevel);
    skyGrad.addColorStop(0, `rgb(${r},${r+8},${r+35})`);
    skyGrad.addColorStop(1, `rgb(${r-10},${r},${r+18})`);
    ctx.fillStyle = skyGrad; ctx.fillRect(0,0,w,h);

    const horizon = h * 0.65;
    const stationX = w * 0.7, stationY = horizon - 20;

    /* City skyline (back layer) */
    const cityW = w * 1.4, cityX = w * 0.5 - cityW * 0.5;
    for(let i = 0; i < cityBuildings.length; i++) {
        const b = cityBuildings[i];
        const bx = cityX + (i / cityBuildings.length) * cityW + b.gap;
        const by = horizon - b.bh;
        ctx.fillStyle = '#0f1820';
        ctx.fillRect(bx, by, b.bw, b.bh);
        const winW = 4, winH = 5;
        const padX = (b.bw - b.cols * 8) / 2 + 2;
        b.windows.forEach(win => {
            const wx = bx + padX + win.wx * 8;
            const wy = by + 6 + win.wy * 12;
            ctx.fillStyle = win.warmth === 0 ? 'rgba(255,220,120,0.6)' : win.warmth === 1 ? 'rgba(180,210,255,0.4)' : 'rgba(255,240,200,0.8)';
            ctx.fillRect(wx, wy, winW, winH);
        });
    }

    /* Ground / park */
    ctx.fillStyle = '#0e1a10'; ctx.fillRect(0, horizon, w, h - horizon);

    /* Trees in park (some emit visible gas particles) */
    parkTrees.forEach((tree, ti) => {
        const tx = tree.x * w;
        const ty = horizon;
        const s = tree.size;
        // Trunk
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(tx - 3, ty - s * 0.6, 6, s * 0.6);
        // Canopy
        ctx.beginPath(); ctx.arc(tx, ty - s * 0.8, s * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${tree.hue}, 40%, 20%)`;
        ctx.fill();
        // Gas emission particles (visible with scroll)
        if (t > 0.15) {
            const gasAlpha = subT(t, 0.15, 0.5) * 0.5;
            for (let g = 0; g < 4; g++) {
                const gx = tx + Math.sin(now * 0.5 + ti + g * 2) * 15;
                const gy = ty - s - 10 - g * 12 + Math.sin(now * 0.3 + g) * 5;
                ctx.beginPath(); ctx.arc(gx, gy, 3 + g, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100, 200, 100, ${gasAlpha * (1 - g * 0.2)})`;
                ctx.fill();
            }
        }
    });

    /* Gas particles drifting toward station */
    if (t > 0.2) {
        const driftT = subT(t, 0.2, 0.7);
        smokeParts.forEach(sp => {
            const sourceX = sp.phase / 10 * w * 0.5 + w * 0.2;
            const sourceY = horizon - 30;
            const lifeT = (driftT * sp.speed + sp.phase/8) % 1;
            const px = lerp(sourceX, stationX, lifeT) + Math.sin(now + sp.phase) * 12;
            const py = lerp(sourceY, stationY - 40, lifeT) + Math.sin(now * 0.5 + sp.phase) * 8;
            const a = sp.alpha * 0.6 * Math.sin(lifeT * Math.PI) * Math.min(driftT * 3, 1);
            if (a > 0.01) {
                ctx.beginPath(); ctx.arc(px, py, sp.r * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100, 200, 120, ${a})`;
                ctx.fill();
            }
        });
    }

    /* Airsense Station (with mast, centered-right) */
    ctx.save(); ctx.translate(stationX, stationY);
    // Mast
    ctx.fillStyle = '#808080'; ctx.fillRect(-2, -90, 4, 90);
    // Base plate
    ctx.fillStyle = '#606060';
    ctx.beginPath(); ctx.roundRect(-20, -2, 40, 8, 3); ctx.fill();
    // Sensor unit
    ctx.translate(0, -70);
    ctx.beginPath(); ctx.roundRect(-22, -28, 44, 56, 6);
    ctx.fillStyle = '#1a2a3a'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,160,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    // Vents
    ctx.fillStyle = '#141e2a';
    for(let v = -12; v <= 12; v += 8) ctx.fillRect(-14, v, 28, 3);
    // LED
    ctx.beginPath(); ctx.arc(0, -18, 4, 0, Math.PI*2);
    ctx.fillStyle = '#00E5A0'; ctx.globalAlpha = 0.5+Math.sin(now*4)*0.5; ctx.fill(); ctx.globalAlpha=1;
    // Antenna
    ctx.beginPath(); ctx.moveTo(12, -28); ctx.lineTo(12, -55); ctx.strokeStyle='#808080'; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.arc(12, -57, 3, 0, Math.PI*2); ctx.fillStyle='#606060'; ctx.fill();
    ctx.restore();

    /* Callout Box */
    if (t > 0.5) {
        const valRatio = subT(t, 0.5, 0.85);
        drawCalloutBox(ctx, w, h, stationX, stationY - 70, 'AIR QUALITY', [
            { label: 'PM2.5', value: Math.round(valRatio*87).toString(), unit: 'μg/m³', color: '#FF6B6B' },
            { label: 'CO₂', value: Math.round(valRatio*450).toString(), unit: 'ppm', color: '#4DA8FF' },
            { label: 'VOC', value: Math.round(valRatio*23).toString(), unit: 'ppb', color: '#00E5A0' },
        ], subT(t, 0.5, 0.7), 'left');
    }

    const msgs = ['Plants emit gases into urban air…', 'Sensors detect volatile compounds', 'Monitoring PM2.5 and CO₂ levels', 'Alerting users to air quality changes'];
    setCaption('airsense', msgs[Math.min(Math.floor(t * msgs.length), msgs.length - 1)]);
}

/* =========================================================
   6. GOZANLINK — Greenhouse + Tomato Growth
   ========================================================= */
function drawGozan(ctx, w, h, t) {
    ctx.clearRect(0,0,w,h);
    const now = Date.now()/1000;

    /* Dark greenhouse sky */
    const skyGrad = ctx.createLinearGradient(0,0,0,h);
    skyGrad.addColorStop(0, '#0a180a'); skyGrad.addColorStop(1, '#152815');
    ctx.fillStyle = skyGrad; ctx.fillRect(0,0,w,h);

    const ghCX = w * 0.55, ghCY = h * 0.42;
    const zoom = 1 + easeInOut(subT(t, 0.1, 0.4)) * 2;

    ctx.save();
    ctx.translate(ghCX, ghCY); ctx.scale(zoom, zoom); ctx.translate(-ghCX, -ghCY);

    ctx.fillStyle = '#0a1a0a'; ctx.fillRect(0, h * 0.7, w, h * 0.3);

    /* Greenhouse structure */
    const gx = ghCX, gy = ghCY;
    ctx.beginPath(); ctx.moveTo(gx-140, gy+90); ctx.lineTo(gx-140, gy-20);
    ctx.quadraticCurveTo(gx, gy-90, gx+140, gy-20);
    ctx.lineTo(gx+140, gy+90); ctx.closePath();
    const ghGrad = ctx.createLinearGradient(gx-140, gy-90, gx+140, gy+90);
    ghGrad.addColorStop(0, 'rgba(100,180,100,0.1)'); ghGrad.addColorStop(1, 'rgba(50,120,50,0.06)');
    ctx.fillStyle = ghGrad; ctx.fill();
    ctx.strokeStyle = 'rgba(100,200,100,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();

    /* Glass panes outline */
    ctx.beginPath();
    ctx.moveTo(gx, gy - 90); ctx.lineTo(gx, gy + 90);
    ctx.moveTo(gx - 70, gy - 60); ctx.lineTo(gx - 70, gy + 90);
    ctx.moveTo(gx + 70, gy - 60); ctx.lineTo(gx + 70, gy + 90);
    ctx.strokeStyle = 'rgba(100,200,100,0.12)'; ctx.lineWidth = 0.5; ctx.stroke();

    /* Plants & Tomatoes */
    if (t > 0.15) {
        const plantAlpha = subT(t, 0.15, 0.35);
        const tomatoT = subT(t, 0.35, 0.75);
        ctx.globalAlpha = plantAlpha;
        for(let row = 0; row < 4; row++) {
            const ry = gy + 10 + row * 22;
            for(let p = 0; p < 7; p++) {
                const px = gx - 80 + p * 26;
                const stemH = 16 + Math.sin(p*2)*4;
                ctx.strokeStyle = '#2a6a2a'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(px, ry); ctx.lineTo(px, ry-stemH); ctx.stroke();
                ctx.fillStyle = `rgba(${40+row*12},${110+p*12},${40+row*8},0.85)`;
                ctx.beginPath(); ctx.ellipse(px-5, ry-stemH+3, 7, 3.5, -0.4, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(px+5, ry-stemH+1, 6, 3, 0.4, 0, Math.PI*2); ctx.fill();
                /* Tomatoes */
                if ((row+p) % 2 === 0 && tomatoT > 0) {
                    const tSize = 3 + tomatoT * 3;
                    const ripeness = Math.min(1, tomatoT * 1.5);
                    ctx.beginPath(); ctx.arc(px+3, ry-stemH+9, tSize, 0, Math.PI*2);
                    ctx.fillStyle = `rgb(${Math.floor(lerp(50,220,ripeness))},${Math.floor(lerp(120,35,ripeness))},25)`;
                    ctx.fill();
                    // Small highlight
                    ctx.beginPath(); ctx.arc(px+1, ry-stemH+7, tSize*0.3, 0, Math.PI*2);
                    ctx.fillStyle = `rgba(255,255,255,${ripeness*0.25})`; ctx.fill();
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    /* Indoor sensor unit */
    const sensorX = gx + 90, sensorY = gy + 30;
    ctx.save(); ctx.translate(sensorX, sensorY);
    ctx.fillStyle = '#E8E8E8';
    ctx.beginPath(); ctx.roundRect(-12, -16, 24, 32, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,160,0.5)'; ctx.lineWidth = 1; ctx.stroke();
    // Screen
    ctx.fillStyle = '#0a2a3a';
    ctx.fillRect(-8, -12, 16, 12);
    // LED
    ctx.beginPath(); ctx.arc(0, 10, 2.5, 0, Math.PI*2);
    ctx.fillStyle = '#00E5A0'; ctx.globalAlpha = 0.5+Math.sin(now*4)*0.5; ctx.fill(); ctx.globalAlpha=1;
    ctx.restore();

    ctx.restore(); // End zoom

    /* Callout Box */
    if (t > 0.4) {
        const envT = subT(t, 0.4, 0.8);
        const callX = (ghCX + 90) * (zoom > 1.5 ? 1 : 1) ;
        drawCalloutBox(ctx, w, h, w * 0.65, h * 0.35, 'GREENHOUSE CLIMATE', [
            { label: 'Temperature', value: `${lerp(18,24,envT).toFixed(1)}`, unit: '°C', color: '#FF6B6B' },
            { label: 'Humidity', value: `${lerp(50,65,envT).toFixed(0)}`, unit: '%', color: '#4DA8FF' },
            { label: 'CO₂', value: `${lerp(350,500,envT).toFixed(0)}`, unit: 'ppm', color: '#00E5A0' },
        ], subT(t, 0.4, 0.6), 'right');
    }

    const msgs = ['Inside the smart greenhouse…', 'Temperature and humidity optimized', 'Tomatoes ripening under ideal conditions', 'Precision climate control in action'];
    setCaption('gozan', msgs[Math.min(Math.floor(t * msgs.length), msgs.length - 1)]);
}

/* =========================================================
   7. NAVBAR + MOBILE TOGGLE
   ========================================================= */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => { navToggle.classList.toggle('active'); navLinks.classList.toggle('open'); });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { navToggle.classList.remove('active'); navLinks.classList.remove('open'); }));
}

/* =========================================================
   8. SCROLL REVEALS
   ========================================================= */
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal,.reveal-up,.reveal-left,.reveal-right').forEach(el => revealObs.observe(el));

/* =========================================================
   9. ANIMATED COUNTERS
   ========================================================= */
let countersGo = false;
const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting && !countersGo) { countersGo = true; animCounters(); } });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-number[data-count]').forEach(el => counterObs.observe(el));
function animCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(el => {
        const tgt = +el.dataset.count, start = performance.now();
        (function tick(now) {
            const p = Math.min((now - start) / 2000, 1);
            el.textContent = Math.round(tgt * (1 - Math.pow(1-p,3)));
            if (p < 1) requestAnimationFrame(tick);
        })(start);
    });
}

/* =========================================================
   10. MARQUEE HOVER
   ========================================================= */
const mq = document.querySelector('.marquee-track');
if (mq) { mq.onmouseenter = () => mq.style.animationPlayState = 'paused'; mq.onmouseleave = () => mq.style.animationPlayState = 'running'; }

/* =========================================================
   11. MASTER SCROLL + ANIMATION LOOP
   ========================================================= */
let ticking = false;
function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', scrollY > 50);
        stories.forEach(id => {
            const sec = sections[id];
            const r = sec.getBoundingClientRect();
            if (r.bottom < -innerHeight || r.top > innerHeight * 2) return;
            resizeCanvas(canvases[id]);
            const t = getStoryT(sec);
            updateProgress(id, t);
            revealFacts(id, t);
            if (id === 'explode') drawExplode(ctxs[id], canvases[id].width, canvases[id].height, t);
            else if (id === 'jayhun') drawJayhun(ctxs[id], canvases[id].width, canvases[id].height, t);
            else if (id === 'airsense') drawAirsense(ctxs[id], canvases[id].width, canvases[id].height, t);
            else if (id === 'gozan') drawGozan(ctxs[id], canvases[id].width, canvases[id].height, t);
        });
        ticking = false;
    });
}
addEventListener('scroll', onScroll, { passive: true });

function animLoop() {
    requestAnimationFrame(animLoop);
    stories.forEach(id => {
        const r = sections[id].getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        resizeCanvas(canvases[id]);
        const t = getStoryT(sections[id]);
        revealFacts(id, t);
        if (id === 'explode') drawExplode(ctxs[id], canvases[id].width, canvases[id].height, t);
        else if (id === 'jayhun') drawJayhun(ctxs[id], canvases[id].width, canvases[id].height, t);
        else if (id === 'airsense') drawAirsense(ctxs[id], canvases[id].width, canvases[id].height, t);
        else if (id === 'gozan') drawGozan(ctxs[id], canvases[id].width, canvases[id].height, t);
    });
}
animLoop();
setTimeout(() => { document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('active')); }, 200);
