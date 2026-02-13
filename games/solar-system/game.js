/**
 * 太阳系探索游戏
 * 使用 Three.js 实现交互式 3D 太阳系模拟
 * 包含开普勒定律模拟、教学缩放比例、沉浸式动效
 */

let scene, camera, renderer, controls;
let sun;
let planets = {};
let orbits = {};
let labels = {};
let selectedPlanet = null;
let isOrbitVisible = true;
let isLabelsVisible = true;
let timeSpeed = 1;
let planetScale = 1;
let orbitScale = 1;

let clock = new THREE.Clock();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// 行星数据（教学缩放比例）
// 真实比例无法在屏幕显示，这里使用教学优化的比例
const planetData = {
    mercury: {
        name: '水星',
        subtitle: '太阳系最小的行星',
        emoji: '☿',
        color: 0x8c7853,
        orbitColor: 0xffa500,
        size: 0.38,
        distance: 6,
        period: 88,
        rotationPeriod: 58.6,
        facts: {
            '直径': '4,879 km',
            '距太阳': '5,790 万 km',
            '公转周期': '88 天',
            '自转周期': '58.6 天',
            '表面温度': '-180 ~ 430°C',
            '卫星数量': '0'
        }
    },
    venus: {
        name: '金星',
        subtitle: '太阳系最热的行星',
        emoji: '♀',
        color: 0xe6c87a,
        orbitColor: 0xffd700,
        size: 0.95,
        distance: 8,
        period: 225,
        rotationPeriod: -243,
        facts: {
            '直径': '12,104 km',
            '距太阳': '1.08 亿 km',
            '公转周期': '225 天',
            '自转周期': '243 天（逆行）',
            '表面温度': '462°C',
            '卫星数量': '0'
        }
    },
    earth: {
        name: '地球',
        subtitle: '我们的家园',
        emoji: '🌍',
        color: 0x6b93d6,
        orbitColor: 0x00ff7f,
        size: 1,
        distance: 11,
        period: 365,
        rotationPeriod: 1,
        facts: {
            '直径': '12,742 km',
            '距太阳': '1.5 亿 km',
            '公转周期': '365 天',
            '自转周期': '1 天',
            '表面温度': '-88 ~ 58°C',
            '卫星数量': '1（月球）'
        }
    },
    mars: {
        name: '火星',
        subtitle: '红色星球',
        emoji: '♂',
        color: 0xc1440e,
        orbitColor: 0xff4500,
        size: 0.53,
        distance: 14,
        period: 687,
        rotationPeriod: 1.03,
        facts: {
            '直径': '6,779 km',
            '距太阳': '2.28 亿 km',
            '公转周期': '687 天',
            '自转周期': '24.6 小时',
            '表面温度': '-140 ~ 20°C',
            '卫星数量': '2'
        }
    },
    jupiter: {
        name: '木星',
        subtitle: '太阳系最大的行星',
        emoji: '♃',
        color: 0xd8ca9d,
        orbitColor: 0xcd853f,
        size: 3.5,
        distance: 20,
        period: 4333,
        rotationPeriod: 0.41,
        facts: {
            '直径': '139,820 km',
            '距太阳': '7.78 亿 km',
            '公转周期': '12 年',
            '自转周期': '9.9 小时',
            '表面温度': '-110°C',
            '卫星数量': '79'
        }
    },
    saturn: {
        name: '土星',
        subtitle: '拥有美丽的光环',
        emoji: '♄',
        color: 0xead6b8,
        orbitColor: 0xdaa520,
        size: 3,
        distance: 26,
        period: 10759,
        rotationPeriod: 0.45,
        hasRing: true,
        facts: {
            '直径': '116,460 km',
            '距太阳': '14.3 亿 km',
            '公转周期': '29 年',
            '自转周期': '10.7 小时',
            '表面温度': '-140°C',
            '卫星数量': '82'
        }
    },
    uranus: {
        name: '天王星',
        subtitle: '躺着旋转的行星',
        emoji: '⛢',
        color: 0xd1e7e7,
        orbitColor: 0x40e0d0,
        size: 2,
        distance: 31,
        period: 30687,
        rotationPeriod: -0.72,
        facts: {
            '直径': '50,724 km',
            '距太阳': '28.7 亿 km',
            '公转周期': '84 年',
            '自转周期': '17.2 小时（逆行）',
            '表面温度': '-195°C',
            '卫星数量': '27'
        }
    },
    neptune: {
        name: '海王星',
        subtitle: '太阳系最远的行星',
        emoji: '♆',
        color: 0x5b5ddf,
        orbitColor: 0x4169e1,
        size: 2,
        distance: 36,
        period: 60190,
        rotationPeriod: 0.67,
        facts: {
            '直径': '49,244 km',
            '距太阳': '45 亿 km',
            '公转周期': '165 年',
            '自转周期': '16.1 小时',
            '表面温度': '-200°C',
            '卫星数量': '14'
        }
    }
};

// 彗星数据
const cometData = {
    'halley': {
        name: '哈雷彗星',
        subtitle: '最著名的短周期彗星',
        emoji: '☄️',
        period: 76,
        semiMajorAxis: 17.8,
        eccentricity: 0.967,
        inclination: 162,
        orbitColor: 0x88ccff,
        facts: {
            '发现时间': '公元前240年',
            '公转周期': '76年',
            '轨道偏心率': '0.967 (高偏心率)',
            '近日点距离': '0.586 AU',
            '远日点距离': '35.1 AU',
            '最近回归': '2061年',
            '彗核直径': '约11 km',
            '彗尾长度': '可达1亿 km'
        }
    },
    'hale-bopp': {
        name: '海尔-波普彗星',
        subtitle: '1997年大彗星',
        emoji: '☄️',
        period: 2533,
        semiMajorAxis: 25,
        eccentricity: 0.995,
        inclination: 89,
        orbitColor: 0xffaaff,
        facts: {
            '发现时间': '1995年7月23日',
            '公转周期': '2533年',
            '轨道偏心率': '0.995 (极高)',
            '近日点距离': '0.914 AU',
            '远日点距离': '370 AU',
            '最近回归': '4534年',
            '彗核直径': '约60 km',
            '观测时长': '18个月'
        }
    },
    'hyakutake': {
        name: '百武彗星',
        subtitle: '1996年亮彗星',
        emoji: '☄️',
        period: 17000,
        semiMajorAxis: 40,
        eccentricity: 0.9999,
        inclination: 125,
        orbitColor: 0x00ffff,
        facts: {
            '发现时间': '1996年1月30日',
            '公转周期': '约17000年',
            '轨道偏心率': '0.9999 (接近抛物线)',
            '近日点距离': '0.23 AU',
            '远日点距离': '约3500 AU',
            '上次回归': '公元前16800年',
            '下次回归': '公元18996年',
            '彗尾长度': '超过5亿 km'
        }
    }
};

let meteors = [];
let isMeteorShowerMode = false;

// 星座数据
const constellationData = {
    'perseids': {
        name: '英仙座流星雨',
        emoji: '🌌',
        origin: '英仙座',
        peak: '8月13日',
        description: '每年8月最壮观的流星雨',
        stars: [
            { x: -30, y: 0, z: -20 },
            { x: -25, y: 0, z: -15 },
            { x: -20, y: 0, z: -10 },
            { x: -35, y: 0, z: -25 },
            { x: -28, y: 0, z: -18 },
            { x: -22, y: 0, z: -12 },
            { x: -33, y: 0, z: -22 },
            { x: -26, y: 0, z: -16 }
        ]
    },
    'gemini': {
        name: '双子座流星雨',
        emoji: '✨',
        origin: '双子座',
        peak: '12月14日',
        description: '双子座北河三星',
        stars: [
            { x: 25, y: 0, z: 18 },
            { x: 30, y: 0, z: 22 },
            { x: 35, y: 0, z: 15 },
            { x: 28, y: 0, z: 20 },
            { x: 32, y: 0, z: 17 }
        ]
    },
    'leonids': {
        name: '狮子座流星雨',
        emoji: '🦁',
        origin: '狮子座',
        peak: '11月18日',
        description: '每年11月速度最快的流星雨',
        stars: [
            { x: -15, y: 0, z: -10 },
            { x: -10, y: 0, z: -5 },
            { x: -18, y: 0, z: -8 },
            { x: -12, y: 0, z: -6 }
        ]
    },
    'orionids': {
        name: '猎户座流星雨',
        emoji: '🏹',
        origin: '猎户座',
        peak: '10月21日',
        description: '猎户座流星雨',
        stars: [
            { x: 20, y: 0, z: 15 },
            { x: 25, y: 0, z: 20 },
            { x: 18, y: 0, z: 12 },
            { x: 22, y: 0, z: 18 },
            { x: 16, y: 0, z: 10 },
            { x: 28, y: 0, z: 22 }
        ]
    }
};

// 彗星系统
let comets = {};
let currentComet = null;
let isCometMode = false;
let cometTrail = null;
let cometTrailPoints = [];

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(30, 20, 40);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 创建轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 200;

    // 创建星空背景
    createStarField();

    // 创建太阳
    createSun();

    // 创建行星
    Object.keys(planetData).forEach(key => {
        createPlanet(key, planetData[key]);
    });

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    // 事件监听
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);

    // 初始化UI
    initUI();

    // 开始动画循环
    animate();
}

// 创建星空背景
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 0.8
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 添加闪烁星星动画
    stars.userData = {
        originalPositions: starVertices.slice(),
        phase: Math.random() * Math.PI * 2
    };
}

// 创建太阳
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(4, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffdd00,
        transparent: true,
        opacity: 1
    });

    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // 太阳光晕效果
    const glowGeometry = new THREE.SphereGeometry(4.5, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(sunGlow);

    // 太阳点光源
    const sunLight = new THREE.PointLight(0xffffff, 2, 300);
    sun.add(sunLight);

    // 太阳动画数据
    sun.userData = {
        pulsePhase: 0,
        rotationSpeed: 0.001
    };
}

// 创建行星
function createPlanet(key, data) {
    const scaledSize = data.size * planetScale;
    const scaledDistance = data.distance * orbitScale;

    // 行星几何体
    const geometry = new THREE.SphereGeometry(scaledSize, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: data.color,
        shininess: 10
    });

    const planet = new THREE.Mesh(geometry, material);

    // 初始位置
    const angle = Math.random() * Math.PI * 2;
    planet.position.x = Math.cos(angle) * scaledDistance;
    planet.position.z = Math.sin(angle) * scaledDistance;

    planet.userData = {
        key: key,
        data: data,
        angle: angle,
        rotationSpeed: data.rotationPeriod > 0 ? 0.02 / Math.abs(data.rotationPeriod) : -0.02 / Math.abs(data.rotationPeriod),
        orbitSpeed: (2 * Math.PI) / (data.period * 0.1),
        baseSize: data.size,
        baseDistance: data.distance
    };

    scene.add(planet);
    planets[key] = planet;

    // 创建土星光环
    if (data.hasRing) {
        const ringGeometry = new THREE.RingGeometry(scaledSize * 1.4, scaledSize * 2, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xc9b896,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2.2;
        planet.add(ring);
    }

    // 创建轨道线
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitVertices = [];

    for (let i = 0; i <= 128; i++) {
        const theta = (i / 128) * Math.PI * 2;
        orbitVertices.push(
            Math.cos(theta) * scaledDistance,
            0,
            Math.sin(theta) * scaledDistance
        );
    }

    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitVertices, 3));

    const orbitMaterial = new THREE.LineBasicMaterial({
        color: data.orbitColor,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
    });

    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);
    orbits[key] = orbit;
}

    // 创建彗星
function createComet(key, data) {
    const cometGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const cometMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.95
    });

    const comet = new THREE.Mesh(cometGeometry, cometMaterial);

    console.log('Creating comet:', key, data);

    // 彗核光晕
    const glowGeometry = new THREE.SphereGeometry(0.7, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: data.orbitColor || 0x88ccff,
        transparent: true,
        opacity: 0.4
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    comet.add(glow);

    // 彗尾（粒子系统）
    const tailGeometry = new THREE.BufferGeometry();
    const tailMaterial = new THREE.PointsMaterial({
        color: data.orbitColor || 0x88ccff,
        size: 1.2,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });

    const tailCount = 150;
    const tailPositions = new Float32Array(tailCount * 3);
    const tailSizes = new Float32Array(tailCount);

    for (let i = 0; i < tailCount; i++) {
        tailPositions[i * 3] = 0;
        tailPositions[i * 3 + 1] = 0;
        tailPositions[i * 3 + 2] = 0;
        tailSizes[i] = 1.0;
    }

    tailGeometry.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));
    tailGeometry.setAttribute('size', new THREE.BufferAttribute(tailSizes, 1));
    const tail = new THREE.Points(tailGeometry, tailMaterial);
    comet.add(tail);

    // 轨道倾角旋转
    const inclination = data.inclination * (Math.PI / 180);

    comet.userData = {
        key: key,
        data: data,
        angle: Math.PI,
        tail: tail,
        inclination: inclination,
        semiMajorAxis: data.semiMajorAxis,
        eccentricity: data.eccentricity,
        completed: false,
        progress: 0,
        trailHistory: []
    };

    scene.add(comet);
    comets[key] = comet;

    // 创建彗星轨迹线
    createCometTrail(comet, data);

    // 立即设置彗星初始位置
    updateComet(comet);
}

// 创建彗星轨迹
function createCometTrail(comet, data) {
    const trailGeometry = new THREE.BufferGeometry();
    const trailVertices = [];

    const a = data.semiMajorAxis;
    const e = data.eccentricity;
    const c = a * e;

    for (let i = 0; i <= 300; i++) {
        const theta = (i / 300) * Math.PI * 2;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        const x = r * Math.cos(theta) - c;
        const y = 0;
        const z = r * Math.sin(theta);

        // 应用轨道倾角
        const trailInclination = data.inclination * (Math.PI / 180);
        const xRot = x * Math.cos(trailInclination) - z * Math.sin(trailInclination);
        const zRot = x * Math.sin(trailInclination) + z * Math.cos(trailInclination);

        trailVertices.push(xRot, y, zRot);
    }

    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailVertices, 3));

    // 创建带alpha通道的颜色数组
    const colors = new Float32Array(trailVertices.length * 3);
    const orbitColor = data.orbitColor || 0x88ccff;

    for (let i = 0; i < colors.length / 3; i++) {
        colors[i * 3] = ((orbitColor >> 16) & 0xff) / 255;
        colors[i * 3 + 1] = ((orbitColor >> 8) & 0xff) / 255;
        colors[i * 3 + 2] = ((orbitColor >> 0) & 0xff) / 255;
    }

    trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const trailMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        linewidth: 2
    });

    const trail = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trail);
    cometTrail = trail;

    // 高亮轨道效果
    trail.userData = {
        colors: colors,
        originalOpacity: 0.4,
        isHighlighted: true
    };
}

    // 创建流星雨
function createMeteorShower(showerKey) {
    const data = constellationData[showerKey];

    // 清除现有流星雨
    clearMeteorShower();

    // 创建星座连线
    createConstellation(data);

    // 调整相机位置以观察星座
    camera.position.set(0, 50, 100);
    controls.target.set(0, 0, 0);

    // 开始流星雨
    isMeteorShowerMode = true;

    // 显示流星雨信息
    showMeteorShowerInfo(showerKey);
}

// 创建流星雨（从initUI调用）
function startMeteorShower(showerKey) {
    const data = constellationData[showerKey];
    if (!data) {
        console.error('Invalid shower key:', showerKey);
        return;
    }

    console.log('Starting meteor shower:', showerKey);

    // 清除现有流星雨
    clearMeteorShower();

    // 创建星座连线
    createConstellation(data);

    // 调整相机位置以观察星座
    camera.position.set(0, 50, 100);
    controls.target.set(0, 0, 0);

    // 初始化流星雨 - 创建10颗初始流星
    for (let i = 0; i < 10; i++) {
        createMeteorForShower();
    }

    // 开始流星雨
    isMeteorShowerMode = true;

    // 显示流星雨信息
    showMeteorShowerInfo(showerKey);
}

// 创建星座
function createConstellation(data) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];

    data.stars.forEach(star => {
        positions.push(star.x, star.y, star.z);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.6,
        linewidth: 1.5
    });

    const lines = new THREE.Line(geometry, material);
    scene.add(lines);
    constellationLines = lines;

    // 添加星座星星
    const starGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const starMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffaa,
        transparent: true,
        opacity: 0.9
    });

    data.stars.forEach(star => {
        const starMesh = new THREE.Mesh(starGeometry, starMaterial);
        starMesh.position.set(star.x, star.y, star.z);
        scene.add(starMesh);
        meteorShowerMeteors.push(starMesh);
    });
}

// 清除流星雨
function clearMeteorShower() {
    meteorShowerMeteors.forEach(meteor => {
        scene.remove(meteor);
    });
    meteorShowerMeteors = [];

    if (constellationLines) {
        scene.remove(constellationLines);
        constellationLines = null;
    }
}

// 更新流星雨
function updateMeteorShower() {
    if (!isMeteorShowerMode) return;

    // 更新现有流星
    meteorShowerMeteors.forEach((meteor, index) => {
        meteor.position.add(meteor.userData.velocity);

        // 移除过远的流星
        if (meteor.position.length() > 150) {
            scene.remove(meteor);
            meteorShowerMeteors.splice(index, 1);
        }

        meteor.userData.life -= 0.01 * timeSpeed;

        if (meteor.userData.life <= 0) {
            scene.remove(meteor);
            meteorShowerMeteors.splice(index, 1);
        }
    });
}

    // 为流星雨创建流星
function createMeteorForShower() {
    console.log('Creating shower meteor');

    const geometry = new THREE.SphereGeometry(0.3, 8, 8);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffdd44,
        transparent: true,
        opacity: 1
    });

    const meteor = new THREE.Mesh(geometry, material);

    // 从星座方向飞来
    const origin = constellationData[Object.keys(constellationData)[Math.floor(Math.random() * Object.keys(constellationData).length)]].stars[0];
    const direction = new THREE.Vector3(0, -0.3, -0.5).normalize();

    meteor.position.set(
        origin.x + (Math.random() - 0.5) * 10,
        origin.y + (Math.random() - 0.5) * 5,
        origin.z + (Math.random() - 0.5) * 10
    );

    meteor.userData = {
        velocity: direction.multiplyScalar(0.3 + Math.random() * 0.2),
        life: 1
    };

    scene.add(meteor);
    meteorShowerMeteors.push(meteor);

    console.log('Meteor created, total:', meteorShowerMeteors.length);
}

// 显示流星雨信息
function showMeteorShowerInfo(key) {
    const data = constellationData[key];
    const infoPanel = document.getElementById('showerInfo');

    document.getElementById('showerName').textContent = `${data.emoji} ${data.name}`;
    document.getElementById('showerSubtitle').textContent = `${data.origin} • ${data.peak}达到峰值`;

    const factsDiv = document.getElementById('showerFacts');
    factsDiv.innerHTML = '';

    const factsHTML = `
        <div class="fact">
            <span class="fact-label">峰值日期</span>
            <span class="fact-value">${data.peak}</span>
        </div>
        <div class="fact">
            <span class="fact-label">描述</span>
            <span class="fact-value">${data.description}</span>
        </div>
    `;
    factsDiv.innerHTML = factsHTML;

    infoPanel.style.display = 'block';
    infoPanel.classList.add('visible');
}

// 创建流星
function createMeteor() {
    if (meteors.length > 5) return;

    const meteorGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const meteorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);

    const startX = (Math.random() - 0.5) * 100;
    const startY = (Math.random() - 0.5) * 100 + 50;
    const startZ = (Math.random() - 0.5) * 100;

    meteor.position.set(startX, startY, startZ);
    meteor.userData = {
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            -Math.random() * 0.5 - 0.2,
            (Math.random() - 0.5) * 0.5
        ),
        life: 1,
        trail: []
    };

    scene.add(meteor);
    meteors.push(meteor);
}

// 更新流星
function updateMeteors() {
    for (let i = meteors.length - 1; i >= 0; i--) {
        const meteor = meteors[i];

        meteor.position.add(meteor.userData.velocity);
        meteor.userData.life -= 0.02;

        if (meteor.userData.life <= 0) {
            scene.remove(meteor);
            meteors.splice(i, 1);
        }
    }

    if (Math.random() < 0.01 * timeSpeed) {
        createMeteor();
    }
}

// 更新彗星
function updateComet(comet) {
    const data = comet.userData.data;
    const a = comet.userData.semiMajorAxis;
    const e = comet.userData.eccentricity;
    const c = a * e;

    // 计算当前距离太阳的距离
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(comet.userData.angle));

    // 根据开普勒第二定律：速度与距离成反比
    // v = sqrt(GM * (2/r - 1/a))，简化为 v ∝ 1/√r
    const distanceFactor = Math.max(0.1, r);
    const speed = 0.03 * timeSpeed / Math.sqrt(distanceFactor);
    comet.userData.angle += speed;
    comet.userData.progress = (comet.userData.angle - Math.PI) / (Math.PI * 2);

    // 计算椭圆轨道上的位置
    const x = r * Math.cos(comet.userData.angle) - c;
    const z = r * Math.sin(comet.userData.angle);

    // 应用轨道倾角
    const inclination = data.inclination * (Math.PI / 180);
    const xRot = x * Math.cos(inclination) - z * Math.sin(inclination);
    const zRot = x * Math.sin(inclination) + z * Math.cos(inclination);

    comet.position.set(xRot, 0, zRot);

    // 更新彗尾（更真实的效果）
    const tailPositions = comet.userData.tail.geometry.attributes.position.array;
    const tailSizes = comet.userData.tail.geometry.attributes.size.array;
    const tailCount = 150;

    const positionArray = [];

    for (let i = 0; i < tailCount; i++) {
        const life = (tailCount - i) / tailCount;
        const offset = life * 4;

        // 记录当前位置
        const currentX = tailPositions[i * 3];
        const currentY = tailPositions[i * 3 + 1];
        const currentZ = tailPositions[i * 3 + 2];

        // 如果没有历史位置，使用当前位置
        if (currentX === 0 && currentY === 0 && currentZ === 0) {
            tailPositions[i * 3] = xRot;
            tailPositions[i * 3 + 1] = 0;
            tailPositions[i * 3 + 2] = zRot;
        } else {
            // 拖尾效果：粒子逐渐远离彗核
            const directionFromSun = new THREE.Vector3(xRot, 0, zRot).normalize();
            const scatter = (Math.random() - 0.5) * life * 1.5;
            const scatterY = (Math.random() - 0.5) * life * 1.5;

            tailPositions[i * 3] = xRot - directionFromSun.x * offset + scatter;
            tailPositions[i * 3 + 1] = scatterY;
            tailPositions[i * 3 + 2] = zRot - directionFromSun.z * offset + scatter;

            // 粒子大小随距离变小
            tailSizes[i] = 1.5 * life + 0.3;
        }

        positionArray.push(xRot, 0, zRot);
    }

    comet.userData.tail.geometry.attributes.position.needsUpdate = true;
    comet.userData.tail.geometry.attributes.size.needsUpdate = true;

    // 高亮彗星经过的轨道部分
    highlightOrbitTrail(positionArray);

    // 更新位置显示
    const positionDisplay = document.getElementById('cometPosition');
    if (positionDisplay) {
        const distanceAU = Math.abs(r / a).toFixed(3);
        const speedLabel = speed > 0.02 ? '快速' : (speed > 0.01 ? '正常' : '缓慢');
        positionDisplay.innerHTML = `距离太阳: ${distanceAU} AU<br><span style="font-size: 0.8em; color: #666;">${speedLabel}接近中</span>`;
    }

    // 检查是否完成一圈
    if (comet.userData.angle > Math.PI * 3 && !comet.userData.completed) {
        comet.userData.completed = true;
    }
}

// 高亮轨道
function highlightOrbitTrail(positionArray) {
    if (!cometTrail) return;

    const positions = cometTrail.geometry.attributes.position.array;
    const colors = cometTrail.geometry.attributes.color.array;

    for (let i = 0; i < positions.length; i += 3) {
        const px = positions[i];
        const py = positions[i + 1];
        const pz = positions[i + 2];

        let isNearPath = false;

        for (let j = 0; j < positionArray.length; j += 3) {
            const cx = positionArray[j];
            const cy = positionArray[j + 1];
            const cz = positionArray[j + 2];

            const dist = Math.sqrt(Math.pow(px - cx, 2) + Math.pow(py - cy, 2) + Math.pow(pz - cz, 2));

            if (dist < 3) {
                isNearPath = true;
                break;
            }
        }

        // 如果在路径附近，高亮
        if (isNearPath) {
            colors[i] = 1;
            colors[i + 1] = 1;
            colors[i + 2] = 1;
        } else {
            colors[i] = 0.2;
            colors[i + 1] = 0.2;
            colors[i + 2] = 0.2;
        }
    }

    cometTrail.geometry.attributes.color.needsUpdate = true;
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // 太阳动画
    if (sun) {
        sun.userData.pulsePhase += delta * timeSpeed;
        const pulse = 1 + Math.sin(sun.userData.pulsePhase * 2) * 0.05;
        sun.scale.set(pulse, pulse, pulse);
        sun.rotation.y += sun.userData.rotationSpeed * timeSpeed;
    }

    // 行星动画
    Object.values(planets).forEach(planet => {
        // 公转
        planet.userData.angle += planet.userData.orbitSpeed * delta * timeSpeed;

        const currentDistance = planet.userData.baseDistance * orbitScale;
        planet.position.x = Math.cos(planet.userData.angle) * currentDistance;
        planet.position.z = Math.sin(planet.userData.angle) * currentDistance;

        // 自转
        planet.rotation.y += planet.userData.rotationSpeed * timeSpeed;

        // 悬浮动画
        planet.position.y = Math.sin(clock.getElapsedTime() * 0.5 + planet.userData.angle) * 0.3;
    });

    // 更新流星
    updateMeteors();

    // 更新流星雨
    if (isMeteorShowerMode) {
        updateMeteorShower();
    }

    // 更新彗星
    if (currentComet) {
        updateComet(currentComet);
    }

    // 更新控制器
    controls.update();

    // 渲染
    renderer.render(scene, camera);
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 鼠标移动
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// 鼠标点击
function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);

    const planetMeshes = Object.values(planets);
    const intersects = raycaster.intersectObjects(planetMeshes);

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        const planetKey = clickedPlanet.userData.key;
        showPlanetInfo(planetKey);
        focusOnPlanet(planetKey);
    }
}

// 显示行星信息
function showPlanetInfo(key) {
    const data = planetData[key];
    const infoPanel = document.getElementById('planetInfo');

    document.getElementById('planetName').textContent = `${data.emoji} ${data.name}`;
    document.getElementById('planetSubtitle').textContent = data.subtitle;

    const factsDiv = document.getElementById('planetFacts');
    factsDiv.innerHTML = '';

    Object.entries(data.facts).forEach(([label, value]) => {
        const factDiv = document.createElement('div');
        factDiv.className = 'fact';
        factDiv.innerHTML = `
            <span class="fact-label">${label}</span>
            <span class="fact-value">${value}</span>
        `;
        factsDiv.appendChild(factDiv);
    });

    infoPanel.classList.add('visible');
}

// 显示彗星信息
function showCometInfo(key) {
    const data = cometData[key];
    const infoPanel = document.getElementById('cometInfo');

    document.getElementById('cometName').textContent = `${data.emoji} ${data.name}`;
    document.getElementById('cometSubtitle').textContent = data.subtitle;

    const factsDiv = document.getElementById('cometFacts');
    factsDiv.innerHTML = '';

    Object.entries(data.facts).forEach(([label, value]) => {
        const factDiv = document.createElement('div');
        factDiv.className = 'fact';
        factDiv.innerHTML = `
            <span class="fact-label">${label}</span>
            <span class="fact-value">${value}</span>
        `;
        factsDiv.appendChild(factDiv);
    });

    infoPanel.classList.add('visible');
}

// 聚焦到行星
function focusOnPlanet(key) {
    const planet = planets[key];
    if (!planet) return;

    const targetPosition = planet.position.clone();
    const offset = 10;

    new TWEEN.Tween(camera.position)
        .to({
            x: targetPosition.x + offset,
            y: targetPosition.y + offset / 2,
            z: targetPosition.z + offset
        }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
}

// 初始化UI
function initUI() {
    const timeSlider = document.getElementById('timeSpeed');
    const sizeSlider = document.getElementById('planetSize');
    const distanceSlider = document.getElementById('orbitDistance');
    const toggleOrbitsBtn = document.getElementById('toggleOrbits');
    const toggleLabelsBtn = document.getElementById('toggleLabels');
    const closeInfoBtn = document.getElementById('closeInfo');
    const closeCometInfoBtn = document.getElementById('closeCometInfo');

    closeCometInfoBtn.addEventListener('click', () => {
        document.getElementById('cometInfo').classList.remove('visible');
    });

    timeSlider.addEventListener('input', (e) => {
        timeSpeed = parseFloat(e.target.value);
        document.getElementById('timeValue').textContent = timeSpeed.toFixed(1) + 'x';
    });

    sizeSlider.addEventListener('input', (e) => {
        planetScale = parseFloat(e.target.value);
        document.getElementById('sizeValue').textContent = planetScale.toFixed(1) + 'x';
        updatePlanetSizes();
    });

    distanceSlider.addEventListener('input', (e) => {
        orbitScale = parseFloat(e.target.value);
        document.getElementById('distanceValue').textContent = orbitScale.toFixed(1) + 'x';
        updateOrbitDistances();
    });

    toggleOrbitsBtn.addEventListener('click', () => {
        isOrbitVisible = !isOrbitVisible;
        Object.values(orbits).forEach(orbit => {
            orbit.visible = isOrbitVisible;
        });
        toggleOrbitsBtn.classList.toggle('active', !isOrbitVisible);
    });

    toggleLabelsBtn.addEventListener('click', () => {
        isLabelsVisible = !isLabelsVisible;
        toggleLabelsBtn.classList.toggle('active', !isLabelsVisible);
    });

    const planetButtonsContainer = document.getElementById('planetButtons');

    planetButtonsContainer.querySelectorAll('[data-planet]').forEach(btn => {
        const planetKey = btn.getAttribute('data-planet');
        if (planetKey && planets[planetKey]) {
            btn.addEventListener('click', () => {
                showPlanetInfo(planetKey);
                focusOnPlanet(planetKey);
            });
        }
    });

    // 彗星模式按钮
    const cometModeBtn = document.getElementById('cometModeBtn');
    const cometButtons = document.getElementById('cometButtons');

    cometModeBtn.addEventListener('click', () => {
        isCometMode = !isCometMode;
        cometButtons.style.display = isCometMode ? 'grid' : 'none';
        cometModeBtn.textContent = isCometMode ? '关闭彗星演示' : '开启彗星演示';
        cometModeBtn.classList.toggle('active', isCometMode);

        if (!isCometMode) {
            Object.keys(comets).forEach(key => {
                if (comets[key]) {
                    scene.remove(comets[key]);
                    delete comets[key];
                }
            });
            currentComet = null;
            resetCameraToSolarSystem();
        }
    });

    cometButtons.querySelectorAll('[data-comet]').forEach(btn => {
        const cometKey = btn.getAttribute('data-comet');
        if (cometKey && cometData[cometKey]) {
            btn.addEventListener('click', () => {
                // 清除现有彗星
                Object.keys(comets).forEach(key => {
                    if (comets[key]) {
                        scene.remove(comets[key]);
                        delete comets[key];
                    }
                });
                // 创建新彗星
                createComet(cometKey, cometData[cometKey]);
                // 设置当前彗星
                currentComet = comets[cometKey];
                console.log('Comet created:', cometKey, currentComet);
                // 移动相机以便观察彗星轨道
                new TWEEN.Tween(camera.position)
                    .to({
                        x: 40,
                        y: 30,
                        z: 50
                    }, 1000)
                    .easing(TWEEN.Easing.Cubic.Out)
                    .start();
                // 显示彗星信息
                showCometInfo(cometKey);
            });
        }
    });
}

// 重置相机到太阳系视图
function resetCameraToSolarSystem() {
    new TWEEN.Tween(camera.position)
        .to({
            x: 30,
            y: 20,
            z: 40
        }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    controls.target.set(0, 0, 0);
}

// 更新行星大小
function updatePlanetSizes() {
    Object.values(planets).forEach(planet => {
        const baseSize = planet.userData.baseSize;
        const newSize = baseSize * planetScale;

        planet.geometry.dispose();
        planet.geometry = new THREE.SphereGeometry(newSize, 32, 32);
    });
}

// 更新轨道距离
function updateOrbitDistances() {
    Object.entries(orbits).forEach(([key, orbit]) => {
        const scaledDistance = planetData[key].distance * orbitScale;

        const orbitVertices = [];
        for (let i = 0; i <= 128; i++) {
            const theta = (i / 128) * Math.PI * 2;
            orbitVertices.push(
                Math.cos(theta) * scaledDistance,
                0,
                Math.sin(theta) * scaledDistance
            );
        }

        orbit.geometry.dispose();
        orbit.geometry = new THREE.BufferGeometry();
        orbit.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(orbitVertices, 3)
        );
    });
}

// TWEEN 简单实现
const TWEEN = {
    Tween: class {
        constructor(target) {
            this.target = target;
            this.toValues = {};
            this.duration = 1000;
            this.easingFunction = t => t;
            this.startTime = 0;
            this.startValues = {};
            this.isAnimating = false;
        }

        to(values, duration) {
            this.toValues = values;
            this.duration = duration;
            return this;
        }

        easing(func) {
            this.easingFunction = func;
            return this;
        }

        start() {
            this.startValues = {};
            Object.keys(this.toValues).forEach(key => {
                this.startValues[key] = this.target[key];
            });
            this.startTime = performance.now();
            this.isAnimating = true;
            this.animate();
            return this;
        }

        animate() {
            if (!this.isAnimating) return;

            const elapsed = performance.now() - this.startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            const easedProgress = this.easingFunction(progress);

            Object.keys(this.toValues).forEach(key => {
                this.target[key] = this.startValues[key] +
                    (this.toValues[key] - this.startValues[key]) * easedProgress;
            });

            if (progress < 1) {
                requestAnimationFrame(() => this.animate());
            } else {
                this.isAnimating = false;
            }
        }
    },
    Easing: {
        Cubic: {
            Out: t => 1 - Math.pow(1 - t, 3)
        }
    }
};

// 启动
init();
