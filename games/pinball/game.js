// Matter.js 模块别名
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;
const Constraint = Matter.Constraint;
const Mouse = Matter.Mouse;
const Events = Matter.Events;
const Vector = Matter.Vector;

// 游戏状态
let engine, render, runner;
let ball, launchPlatform, launchConstraint;
let score = 0;
let currentLevel = 1;
let targetScore = 100;
let isCharging = false;
let power = 0;
let launchAngle = -Math.PI / 2;
let mouseX = 0, mouseY = 0;
let launchStartX, launchStartY;
let bumpers = [];
let dominoes = [];
let windmill, windmillConstraint;
let obstacles = [];
let targetZone;
let levelComplete = false;
let springs = [];
let powerUps = [];
let powerUpInterval = null;

// 画布尺寸
let canvasWidth = 800;
let canvasHeight = 600;

// 关卡配置
const levelConfigs = {
    1: {
        name: "入门训练",
        targetScore: 100,
        bumpers: [
            { x: 400, y: 200, radius: 35 },
            { x: 300, y: 300, radius: 30 },
            { x: 500, y: 350, radius: 30 }
        ],
        hasWindmill: false,
        hasDominoes: false,
        hasDropBox: false,
        springs: [
            { x: 250, y: 530 },
            { x: 550, y: 530 }
        ],
        hasPowerUps: true
    },
    2: {
        name: "旋转挑战",
        targetScore: 200,
        bumpers: [
            { x: 350, y: 180, radius: 30 },
            { x: 450, y: 250, radius: 35 },
            { x: 300, y: 350, radius: 25 },
            { x: 550, y: 380, radius: 30 }
        ],
        hasWindmill: true,
        windmillPos: { x: 400, y: 300 },
        hasDominoes: false,
        hasDropBox: true,
        springs: [
            { x: 200, y: 520 },
            { x: 600, y: 520 }
        ],
        hasPowerUps: true
    },
    3: {
        name: "多米诺大师",
        targetScore: 350,
        bumpers: [
            { x: 200, y: 200, radius: 30 },
            { x: 600, y: 250, radius: 30 },
            { x: 400, y: 150, radius: 25 }
        ],
        hasWindmill: true,
        windmillPos: { x: 550, y: 350 },
        hasDominoes: true,
        dominoesStart: { x: 250, y: 400 },
        hasDropBox: true,
        springs: [
            { x: 150, y: 540 },
            { x: 400, y: 540 },
            { x: 650, y: 540 }
        ],
        hasPowerUps: true
    },
    4: {
        name: "弹跳迷宫",
        targetScore: 400,
        bumpers: [
            { x: 200, y: 150, radius: 28 },
            { x: 350, y: 120, radius: 32 },
            { x: 500, y: 180, radius: 25 },
            { x: 150, y: 280, radius: 30 },
            { x: 300, y: 250, radius: 35 },
            { x: 450, y: 320, radius: 28 },
            { x: 600, y: 280, radius: 32 },
            { x: 250, y: 400, radius: 25 },
            { x: 400, y: 450, radius: 30 },
            { x: 550, y: 400, radius: 28 }
        ],
        hasWindmill: false,
        hasDominoes: false,
        hasDropBox: true,
        springs: [
            { x: 150, y: 520 },
            { x: 400, y: 520 },
            { x: 650, y: 520 }
        ],
        hasPowerUps: true
    },
    5: {
        name: "漂浮群岛",
        targetScore: 500,
        bumpers: [
            { x: 250, y: 200, radius: 35 },
            { x: 550, y: 200, radius: 35 },
            { x: 400, y: 350, radius: 40 },
            { x: 200, y: 450, radius: 30 },
            { x: 600, y: 450, radius: 30 }
        ],
        hasWindmill: true,
        windmillPos: { x: 400, y: 275 },
        hasDominoes: true,
        dominoesStart: { x: 150, y: 300 },
        hasDropBox: true,
        springs: [
            { x: 200, y: 530 },
            { x: 600, y: 530 }
        ],
        hasPowerUps: true
    },
    6: {
        name: "旋转双翼",
        targetScore: 600,
        bumpers: [
            { x: 200, y: 150, radius: 28 },
            { x: 600, y: 150, radius: 28 },
            { x: 300, y: 280, radius: 32 },
            { x: 500, y: 280, radius: 32 },
            { x: 400, y: 200, radius: 38 },
            { x: 400, y: 380, radius: 30 },
            { x: 200, y: 450, radius: 25 },
            { x: 600, y: 450, radius: 25 }
        ],
        hasWindmill: true,
        windmillPos: { x: 400, y: 330 },
        hasDominoes: false,
        hasDropBox: true,
        springs: [
            { x: 100, y: 520 },
            { x: 400, y: 520 },
            { x: 700, y: 520 }
        ],
        hasPowerUps: true
    },
    7: {
        name: "时空隧道",
        targetScore: 700,
        bumpers: [
            { x: 150, y: 120, radius: 25 },
            { x: 650, y: 120, radius: 25 },
            { x: 280, y: 200, radius: 30 },
            { x: 520, y: 200, radius: 30 },
            { x: 400, y: 150, radius: 35 },
            { x: 200, y: 300, radius: 28 },
            { x: 600, y: 300, radius: 28 },
            { x: 400, y: 280, radius: 32 },
            { x: 300, y: 420, radius: 25 },
            { x: 500, y: 420, radius: 25 },
            { x: 400, y: 500, radius: 35 }
        ],
        hasWindmill: false,
        hasDominoes: true,
        dominoesStart: { x: 180, y: 380 },
        hasDropBox: true,
        springs: [
            { x: 150, y: 540 },
            { x: 650, y: 540 }
        ],
        hasPowerUps: true
    },
    8: {
        name: "爆裂组合",
        targetScore: 800,
        bumpers: [
            { x: 400, y: 150, radius: 40 },
            { x: 200, y: 250, radius: 30 },
            { x: 600, y: 250, radius: 30 },
            { x: 300, y: 350, radius: 35 },
            { x: 500, y: 350, radius: 35 },
            { x: 400, y: 450, radius: 38 }
        ],
        hasWindmill: true,
        windmillPos: { x: 400, y: 300 },
        hasDominoes: true,
        dominoesStart: { x: 220, y: 400 },
        hasDropBox: true,
        springs: [
            { x: 250, y: 520 },
            { x: 550, y: 520 }
        ],
        hasPowerUps: true
    },
    9: {
        name: "重力漩涡",
        targetScore: 900,
        bumpers: [
            { x: 400, y: 120, radius: 30 },
            { x: 250, y: 180, radius: 28 },
            { x: 550, y: 180, radius: 28 },
            { x: 180, y: 280, radius: 32 },
            { x: 620, y: 280, radius: 32 },
            { x: 320, y: 280, radius: 35 },
            { x: 480, y: 280, radius: 35 },
            { x: 250, y: 380, radius: 28 },
            { x: 550, y: 380, radius: 28 },
            { x: 400, y: 480, radius: 40 }
        ],
        hasWindmill: true,
        windmillPos: { x: 400, y: 230 },
        hasDominoes: true,
        dominoesStart: { x: 200, y: 350 },
        hasDropBox: true,
        springs: [
            { x: 100, y: 530 },
            { x: 400, y: 530 },
            { x: 700, y: 530 }
        ],
        hasPowerUps: true
    },
    10: {
        name: "终极挑战",
        targetScore: 1000,
        bumpers: [
            { x: 200, y: 100, radius: 30 },
            { x: 600, y: 100, radius: 30 },
            { x: 400, y: 150, radius: 35 },
            { x: 150, y: 220, radius: 28 },
            { x: 650, y: 220, radius: 28 },
            { x: 300, y: 200, radius: 32 },
            { x: 500, y: 200, radius: 32 },
            { x: 400, y: 280, radius: 40 },
            { x: 200, y: 320, radius: 28 },
            { x: 600, y: 320, radius: 28 },
            { x: 300, y: 380, radius: 30 },
            { x: 500, y: 380, radius: 30 },
            { x: 400, y: 450, radius: 35 },
            { x: 150, y: 480, radius: 25 },
            { x: 650, y: 480, radius: 25 }
        ],
        hasWindmill: true,
        windmillPos: { x: 400, y: 350 },
        hasDominoes: true,
        dominoesStart: { x: 170, y: 420 },
        hasDropBox: true,
        springs: [
            { x: 200, y: 520 },
            { x: 400, y: 520 },
            { x: 600, y: 520 }
        ],
        hasPowerUps: true
    }
};

// 初始化游戏
function init() {
    resizeCanvas();
    createEngine();
    createLevel(currentLevel);
    setupEventListeners();
    createBackgroundStars();
    
    runner = Runner.create();
    Runner.run(runner, engine);
    
    showLevelPopup();
}

// 调整画布大小
function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth - 40, 900);
    const maxHeight = Math.min(window.innerHeight - 200, 700);
    
    canvasWidth = Math.max(400, maxWidth);
    canvasHeight = Math.max(500, maxHeight);
}

// 创建物理引擎
function createEngine() {
    engine = Engine.create({
        gravity: { x: 0, y: 0.8 }
    });
    
    const canvas = document.getElementById('gameCanvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvasWidth,
            height: canvasHeight,
            wireframes: false,
            background: 'transparent',
            pixelRatio: window.devicePixelRatio
        }
    });
    
    Render.run(render);
}

// 创建关卡
function createLevel(level) {
    Composite.clear(engine.world, false);
    bumpers = [];
    dominoes = [];
    obstacles = [];
    springs = [];
    powerUps = [];
    
    stopPowerUpDrops();
    
    const config = levelConfigs[level];
    targetScore = config.targetScore;
    document.getElementById('target').textContent = targetScore;
    document.getElementById('level').textContent = level;
    
    createWalls();
    createLaunchArea();
    createBumpers(config.bumpers);
    
    if (config.hasWindmill) {
        createWindmill(config.windmillPos.x, config.windmillPos.y);
    }
    
    if (config.hasDominoes) {
        createDominoes(config.dominoesStart.x, config.dominoesStart.y);
    }
    
    if (config.hasDropBox) {
        createDropBox();
    }
    
    if (config.springs) {
        createSprings(config.springs);
    }
    
    if (config.hasPowerUps) {
        setTimeout(() => startPowerUpDrops(), 2000);
    }
    
    createTargetZone();
    createBall();
}

// 创建边界墙壁
function createWalls() {
    const wallOptions = {
        isStatic: true,
        render: {
            fillStyle: '#8B5CF6',
            strokeStyle: '#6D28D9',
            lineWidth: 3
        },
        friction: 0.1,
        restitution: 0.6
    };
    
    const wallThickness = 30;
    
    const walls = [
        // 底部
        Bodies.rectangle(canvasWidth / 2, canvasHeight + wallThickness / 2, canvasWidth, wallThickness, wallOptions),
        // 左边
        Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight, wallOptions),
        // 右边
        Bodies.rectangle(canvasWidth + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight, wallOptions),
        // 顶部
        Bodies.rectangle(canvasWidth / 2, -wallThickness / 2, canvasWidth, wallThickness, wallOptions)
    ];
    
    Composite.add(engine.world, walls);
    
    // 添加装饰性斜坡
    const leftRamp = Bodies.rectangle(100, canvasHeight - 100, 150, 15, {
        isStatic: true,
        angle: Math.PI / 6,
        render: {
            fillStyle: '#F472B6',
            strokeStyle: '#DB2777',
            lineWidth: 2
        },
        friction: 0.1,
        restitution: 0.7
    });
    
    const rightRamp = Bodies.rectangle(canvasWidth - 100, canvasHeight - 100, 150, 15, {
        isStatic: true,
        angle: -Math.PI / 6,
        render: {
            fillStyle: '#F472B6',
            strokeStyle: '#DB2777',
            lineWidth: 2
        },
        friction: 0.1,
        restitution: 0.7
    });
    
    Composite.add(engine.world, [leftRamp, rightRamp]);
    obstacles.push(leftRamp, rightRamp);
}

// 创建发射区域
function createLaunchArea() {
    launchStartX = 80;
    launchStartY = canvasHeight - 120;
    
    launchPlatform = Bodies.rectangle(launchStartX, launchStartY + 30, 80, 20, {
        isStatic: true,
        render: {
            fillStyle: '#10B981',
            strokeStyle: '#059669',
            lineWidth: 2
        }
    });
    
    // 发射器背景
    const launchBg = Bodies.rectangle(launchStartX, launchStartY, 60, 80, {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: 'rgba(16, 185, 129, 0.2)',
            strokeStyle: '#10B981',
            lineWidth: 2
        }
    });
    
    Composite.add(engine.world, [launchPlatform, launchBg]);
}

// 创建弹珠
function createBall() {
    ball = Bodies.circle(launchStartX, launchStartY, 18, {
        restitution: 0.9,
        friction: 0.01,
        frictionAir: 0.001,
        density: 0.002,
        render: {
            fillStyle: '#FBBF24',
            strokeStyle: '#F59E0B',
            lineWidth: 3
        },
        label: 'ball'
    });
    
    launchConstraint = Constraint.create({
        pointA: { x: launchStartX, y: launchStartY },
        bodyB: ball,
        stiffness: 0.05,
        length: 0,
        render: {
            visible: false
        }
    });
    
    Composite.add(engine.world, [ball, launchConstraint]);
}

// 创建弹跳器
function createBumpers(bumperConfigs) {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    
    bumperConfigs.forEach((config, index) => {
        const bumper = Bodies.circle(config.x, config.y, config.radius, {
            isStatic: true,
            restitution: 1.5,
            render: {
                fillStyle: colors[index % colors.length],
                strokeStyle: '#fff',
                lineWidth: 4
            },
            label: 'bumper',
            scoreValue: 10 + (index * 5)
        });
        
        bumpers.push(bumper);
        Composite.add(engine.world, bumper);
    });
}

// 创建旋转风车
function createWindmill(x, y) {
    // 中心轴
    const pivot = Bodies.circle(x, y, 10, {
        isStatic: true,
        render: {
            fillStyle: '#6366F1',
            strokeStyle: '#4338CA',
            lineWidth: 2
        }
    });
    
    // 风车叶片
    windmill = Bodies.rectangle(x, y, 160, 20, {
        render: {
            fillStyle: '#818CF8',
            strokeStyle: '#6366F1',
            lineWidth: 2
        },
        label: 'windmill',
        scoreValue: 25
    });
    
    windmillConstraint = Constraint.create({
        pointA: { x: x, y: y },
        bodyB: windmill,
        stiffness: 1,
        length: 0
    });
    
    Composite.add(engine.world, [pivot, windmill, windmillConstraint]);
    obstacles.push(windmill);
}

// 创建多米诺骨牌
function createDominoes(startX, startY) {
    const dominoWidth = 12;
    const dominoHeight = 60;
    const spacing = 25;
    const count = 8;
    
    for (let i = 0; i < count; i++) {
        const domino = Bodies.rectangle(startX + i * spacing, startY, dominoWidth, dominoHeight, {
            restitution: 0.3,
            friction: 0.8,
            render: {
                fillStyle: i === count - 1 ? '#EF4444' : '#60A5FA',
                strokeStyle: i === count - 1 ? '#DC2626' : '#3B82F6',
                lineWidth: 2
            },
            label: i === count - 1 ? 'finalDomino' : 'domino',
            scoreValue: i === count - 1 ? 50 : 5,
            chamfer: { radius: 3 }
        });
        
        dominoes.push(domino);
        Composite.add(engine.world, domino);
    }
    
    // 最后一个骨牌的目标区域
    const lastDomino = dominoes[dominoes.length - 1];
    targetZone = Bodies.rectangle(
        startX + (count - 1) * spacing + 40,
        startY,
        20,
        80,
        {
            isStatic: true,
            isSensor: true,
            render: {
                fillStyle: 'rgba(239, 68, 68, 0.3)',
                strokeStyle: '#EF4444',
                lineWidth: 2
            },
            label: 'targetTrigger'
        }
    );
    
    Composite.add(engine.world, targetZone);
}

// 创建掉落箱子
function createDropBox() {
    const boxX = canvasWidth - 150;
    const boxY = canvasHeight - 200;
    
    // 箱子框架
    const boxLeft = Bodies.rectangle(boxX - 40, boxY, 10, 80, {
        isStatic: true,
        render: { fillStyle: '#F59E0B' }
    });
    const boxRight = Bodies.rectangle(boxX + 40, boxY, 10, 80, {
        isStatic: true,
        render: { fillStyle: '#F59E0B' }
    });
    const boxBottom = Bodies.rectangle(boxX, boxY + 40, 90, 10, {
        isStatic: true,
        render: { fillStyle: '#F59E0B' }
    });
    
    // 可掉落的小球
    for (let i = 0; i < 3; i++) {
        const dropBall = Bodies.circle(boxX - 15 + i * 15, boxY - 20, 12, {
            restitution: 0.8,
            render: {
                fillStyle: '#A78BFA',
                strokeStyle: '#7C3AED',
                lineWidth: 2
            },
            label: 'dropBall',
            scoreValue: 15
        });
        obstacles.push(dropBall);
        Composite.add(engine.world, dropBall);
    }
    
    Composite.add(engine.world, [boxLeft, boxRight, boxBottom]);
}

// 创建目标区域
function createTargetZone() {
    targetZone = Bodies.rectangle(canvasWidth - 80, canvasHeight - 80, 60, 60, {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: 'rgba(16, 185, 129, 0.3)',
            strokeStyle: '#10B981',
            lineWidth: 3
        },
        label: 'targetZone',
        scoreValue: 30
    });
    
    Composite.add(engine.world, targetZone);
}

// 创建地面弹簧（粉红色长方形）
function createSprings(springConfigs) {
    const springOptions = {
        isStatic: true,
        render: {
            fillStyle: '#FF6B9D',
            strokeStyle: '#C44569',
            lineWidth: 3
        },
        label: 'spring',
        scoreValue: 20
    };

    springConfigs.forEach(config => {
        const spring = Bodies.rectangle(config.x, config.y, 60, 20, {
            ...springOptions
        });
        spring.restitution = 2.5;
        springs.push(spring);
        Composite.add(engine.world, spring);
    });
}

// 创建掉落道具
function createPowerUp(x, y) {
    const powerUpTypes = [
        { emoji: '⭐', name: 'doubleScore', score: 50, color: '#FFD700' },
        { emoji: '🚀', name: 'speedBoost', score: 30, color: '#FF6B6B' },
        { emoji: '💎', name: 'bonus', score: 40, color: '#06B6D4' },
        { emoji: '🎁', name: 'mystery', score: Math.random() > 0.5 ? 60 : 20, color: '#8B5CF6' }
    ];
    
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    const powerUp = Bodies.circle(x, y, 15, {
        isStatic: false,
        friction: 0.1,
        frictionAir: 0.02,
        restitution: 0.6,
        render: {
            fillStyle: type.color,
            strokeStyle: '#fff',
            lineWidth: 2
        },
        label: 'powerUp',
        powerUpType: type,
        emoji: type.emoji
    });
    
    powerUps.push(powerUp);
    Composite.add(engine.world, powerUp);
    
    // 创建道具标签
    const label = document.createElement('div');
    label.className = 'object-label';
    label.textContent = type.emoji;
    label.style.left = (x - 10) + 'px';
    label.style.top = (y - 10) + 'px';
    document.getElementById('game-container').appendChild(label);
    powerUp.labelElement = label;
    
    // 10秒后消失
    setTimeout(() => {
        if (powerUp && powerUp.labelElement) {
            powerUp.labelElement.remove();
            Composite.remove(engine.world, powerUp);
            powerUps = powerUps.filter(p => p !== powerUp);
        }
    }, 10000);
}

// 开始随机掉落道具
function startPowerUpDrops() {
    if (powerUpInterval) {
        clearInterval(powerUpInterval);
    }
    
    powerUpInterval = setInterval(() => {
        // 随机从天空掉落道具
        const x = 100 + Math.random() * (canvasWidth - 200);
        const y = -20; // 从画布上方开始
        createPowerUp(x, y);
    }, 3000 + Math.random() * 2000); // 每3-5秒掉落一个
}

// 停止掉落道具
function stopPowerUpDrops() {
    if (powerUpInterval) {
        clearInterval(powerUpInterval);
        powerUpInterval = null;
    }
}

// 设置事件监听
function setupEventListeners() {
    const canvas = document.getElementById('gameCanvas');
    
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    
    // 碰撞检测
    Events.on(engine, 'collisionStart', onCollision);
    
    // 窗口调整
    window.addEventListener('resize', onResize);
}

function onMouseDown(e) {
    const rect = e.target.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    const dist = Vector.magnitude(Vector.sub(ball.position, { x: mouseX, y: mouseY }));
    
    if (dist < 50 && launchConstraint) {
        isCharging = true;
        power = 0;
        document.getElementById('powerBarContainer').classList.add('visible');
    }
}

function onMouseMove(e) {
    const rect = e.target.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    if (isCharging) {
        const dx = mouseX - launchStartX;
        const dy = mouseY - launchStartY;
        launchAngle = Math.atan2(dy, dx);
        
        // 限制角度范围
        if (launchAngle > 0) launchAngle = 0;
        if (launchAngle < -Math.PI) launchAngle = -Math.PI;
    }
}

function onMouseUp(e) {
    if (isCharging) {
        launchBall();
    }
}

function onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    e.target.dispatchEvent(mouseEvent);
}

function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    e.target.dispatchEvent(mouseEvent);
}

function onTouchEnd(e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    e.target.dispatchEvent(mouseEvent);
}

// 发射弹珠
function launchBall() {
    if (!isCharging || !launchConstraint) return;
    
    isCharging = false;
    document.getElementById('powerBarContainer').classList.remove('visible');
    
    Composite.remove(engine.world, launchConstraint);
    launchConstraint = null;
    
    const velocity = power * 0.15;
    Body.setVelocity(ball, {
        x: Math.cos(launchAngle) * velocity,
        y: Math.sin(launchAngle) * velocity
    });
    
    power = 0;
    document.getElementById('powerBar').style.width = '0%';
}

// 碰撞处理
function onCollision(event) {
    event.pairs.forEach(pair => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        
        if (labels.includes('ball') && labels.includes('bumper')) {
            const bumper = pair.bodyA.label === 'bumper' ? pair.bodyA : pair.bodyB;
            addScore(bumper.scoreValue || 10, bumper.position);
            
            Body.scale(bumper, 1.15, 1.15);
            setTimeout(() => Body.scale(bumper, 1/1.15, 1/1.15), 100);
        }
        
        if (labels.includes('ball') && labels.includes('domino')) {
            const domino = pair.bodyA.label === 'domino' ? pair.bodyA : pair.bodyB;
            addScore(domino.scoreValue || 5, domino.position);
        }
        
        if (labels.includes('ball') && labels.includes('finalDomino')) {
            addScore(50, pair.bodyA.position);
            showChainBonus();
        }
        
        if (labels.includes('ball') && labels.includes('windmill')) {
            addScore(25, windmill.position);
        }
        
        if (labels.includes('ball') && labels.includes('targetZone')) {
            addScore(30, targetZone.position);
        }
        
        if (labels.includes('ball') && labels.includes('dropBall')) {
            const dropBall = pair.bodyA.label === 'dropBall' ? pair.bodyA : pair.bodyB;
            addScore(dropBall.scoreValue || 15, dropBall.position);
        }
        
        // 弹簧碰撞 - 给弹珠一个向上弹跳力
        if (labels.includes('ball') && labels.includes('spring')) {
            const spring = pair.bodyA.label === 'spring' ? pair.bodyA : pair.bodyB;
            addScore(spring.scoreValue || 20, spring.position);
            
            Body.scale(spring, 1.2, 1.2);
            setTimeout(() => Body.scale(spring, 1/1.2, 1/1.2), 150);
            
            // 弹跳效果
            Body.applyForce(ball, { x: 0, y: -0.05 }, ball.position);
            showSpringEffect(spring.position);
        }
        
        // 道具碰撞
        if (labels.includes('ball') && labels.includes('powerUp')) {
            const powerUp = pair.bodyA.label === 'powerUp' ? pair.bodyA : pair.bodyB;
            if (powerUp.labelElement) {
                powerUp.labelElement.remove();
            }
            Composite.remove(engine.world, powerUp);
            powerUps = powerUps.filter(p => p !== powerUp);
            
            applyPowerUp(powerUp.powerUpType, powerUp.position);
        }
    });
}

// 应用道具效果
function applyPowerUp(powerUpType, position) {
    let bonus = 0;
    let effectText = '';
    
    switch(powerUpType.name) {
        case 'doubleScore':
            bonus = powerUpType.score;
            effectText = '双倍得分! +' + bonus;
            break;
        case 'speedBoost':
            bonus = powerUpType.score;
            Body.applyForce(ball, { x: 0, y: -0.02 }, ball.position);
            effectText = '加速! +' + bonus;
            break;
        case 'bonus':
        case 'mystery':
            bonus = powerUpType.score;
            effectText = powerUpType.name === 'bonus' ? '奖励! +' + bonus : '神秘! +' + bonus;
            break;
    }
    
    addScore(bonus, position);
    showPowerUpEffect(effectText, position);
}

// 显示弹簧弹跳效果
function showSpringEffect(position) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '🚀 BOING!';
    popup.style.left = position.x + 'px';
    popup.style.top = position.y + 'px';
    popup.style.color = '#00D4FF';
    
    const container = document.getElementById('game-container');
    container.appendChild(popup);
    
    setTimeout(() => popup.remove(), 800);
}

// 显示道具效果
function showPowerUpEffect(text, position) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = text;
    popup.style.left = position.x + 'px';
    popup.style.top = position.y + 'px';
    popup.style.color = '#FFD700';
    popup.style.fontSize = '1.3rem';
    
    const container = document.getElementById('game-container');
    container.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1200);
}

// 添加分数
function addScore(points, position) {
    score += points;
    document.getElementById('score').textContent = score;
    
    // 创建分数弹出效果
    createScorePopup(points, position);
    
    // 检查是否达成目标
    if (score >= targetScore && !levelComplete) {
        levelComplete = true;
        setTimeout(showLevelComplete, 500);
    }
}

// 创建分数弹出效果
function createScorePopup(points, position) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + points;
    popup.style.left = position.x + 'px';
    popup.style.top = position.y + 'px';
    
    const container = document.getElementById('game-container');
    container.appendChild(popup);
    
    setTimeout(() => popup.remove(), 1000);
}

// 显示连锁奖励
function showChainBonus() {
    const bonus = 50;
    addScore(bonus, { x: canvasWidth / 2, y: canvasHeight / 2 });
    
    const popup = document.getElementById('tips');
    const originalText = popup.innerHTML;
    popup.innerHTML = '🎉 <span>连锁成功! +50奖励!</span>';
    popup.style.background = 'rgba(16, 185, 129, 0.8)';
    
    setTimeout(() => {
        popup.innerHTML = originalText;
        popup.style.background = 'rgba(0, 0, 0, 0.6)';
    }, 2000);
}

// 显示关卡完成
function showLevelComplete() {
    const popup = document.getElementById('levelPopup');
    const title = document.getElementById('popupTitle');
    const message = document.getElementById('popupMessage');
    const scoreText = document.getElementById('popupScore');
    const btn = document.getElementById('popupBtn');
    
    title.textContent = '🎉 关卡完成!';
    
    if (currentLevel < 10) {
        message.textContent = `太棒了! 你的得分: ${score}`;
        scoreText.textContent = `准备进入关卡 ${currentLevel + 1}`;
        btn.textContent = '继续挑战!';
        btn.onclick = startNextLevel;
    } else {
        title.textContent = '🏆 恭喜通关!';
        message.textContent = `你是弹珠大师! 总得分: ${score}`;
        scoreText.textContent = '所有关卡完成!';
        btn.textContent = '重新开始';
        btn.onclick = restartGame;
    }
    
    popup.classList.add('visible');
}

// 显示关卡介绍
function showLevelPopup() {
    const popup = document.getElementById('levelPopup');
    const title = document.getElementById('popupTitle');
    const message = document.getElementById('popupMessage');
    const scoreText = document.getElementById('popupScore');
    const btn = document.getElementById('popupBtn');

    const config = levelConfigs[currentLevel];

    title.textContent = `🎯 关卡 ${currentLevel}: ${config.name}`;
    message.textContent = getLevelDescription(currentLevel);
    scoreText.textContent = `目标分数: ${config.targetScore}`;
    btn.textContent = '开始游戏!';
    btn.onclick = () => {
        popup.classList.remove('visible');
        // 隐藏提示文字
        document.getElementById('tips').style.opacity = '0';
    };

    popup.classList.add('visible');
}

// 获取关卡描述
function getLevelDescription(level) {
    const descriptions = {
        1: '学习基本操作，碰撞弹跳器得分!',
        2: '挑战旋转风车，击落漂浮球!',
        3: '终极挑战! 触发多米诺连锁反应!',
        4: '穿越弹跳迷宫，寻找最佳路径!',
        5: '在漂浮的岛屿间跳跃!',
        6: '双翼旋转，双倍挑战!',
        7: '进入时空隧道，穿越重重障碍!',
        8: '爆裂组合! 多元素混合挑战!',
        9: '感受重力漩涡的威力!',
        10: '终极挑战! 展现你的真正实力!'
    };
    return descriptions[level];
}

// 开始下一关
function startNextLevel() {
    if (currentLevel < 10) {
        currentLevel++;
        score = 0;
        levelComplete = false;
        document.getElementById('score').textContent = '0';
        document.getElementById('levelPopup').classList.remove('visible');
        createLevel(currentLevel);
        setTimeout(showLevelPopup, 300);
    }
}

// 重置弹珠
function resetBall() {
    if (ball) {
        Composite.remove(engine.world, ball);
    }
    if (launchConstraint) {
        Composite.remove(engine.world, launchConstraint);
    }
    
    // 清理道具
    powerUps.forEach(p => {
        if (p.labelElement) {
            p.labelElement.remove();
        }
    });
    powerUps = [];
    
    stopPowerUpDrops();
    setTimeout(() => {
        if (levelConfigs[currentLevel].hasPowerUps) {
            startPowerUpDrops();
        }
    }, 1000);
    
    createBall();
    levelComplete = false;
}

// 重新开始游戏
function restartGame() {
    currentLevel = 1;
    score = 0;
    levelComplete = false;
    document.getElementById('score').textContent = '0';
    document.getElementById('levelPopup').classList.remove('visible');
    createLevel(1);
    setTimeout(showLevelPopup, 300);
}

// 返回首页
function goHome() {
    window.location.href = '../../index.html';
}

// 窗口调整
function onResize() {
    resizeCanvas();
    render.canvas.width = canvasWidth;
    render.canvas.height = canvasHeight;
    render.options.width = canvasWidth;
    render.options.height = canvasHeight;
}

// 创建背景星星
function createBackgroundStars() {
    const container = document.getElementById('bgDecoration');
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(star);
    }
}

// 游戏主循环 - 更新力量条
function gameLoop() {
    if (isCharging) {
        power = Math.min(power + 2, 100);
        document.getElementById('powerBar').style.width = power + '%';
        document.getElementById('powerLabel').textContent = Math.round(power) + '%';
        
        if (ball && launchConstraint) {
            const pullDist = power * 0.3;
            Body.setPosition(ball, {
                x: launchStartX - Math.cos(launchAngle) * pullDist,
                y: launchStartY - Math.sin(launchAngle) * pullDist
            });
        }
    }
    
    if (ball) {
        if (ball.position.y > canvasHeight + 50 ||
            ball.position.x < -50 ||
            ball.position.x > canvasWidth + 50) {
            resetBall();
        }
        
        // 更新道具标签位置
        powerUps.forEach(p => {
            if (p.labelElement) {
                p.labelElement.style.left = (p.position.x - 10) + 'px';
                p.labelElement.style.top = (p.position.y - 10) + 'px';
            }
        });
    }
    
    requestAnimationFrame(gameLoop);
}

// 调试函数：跳转到指定关卡（用于测试）
window.jumpToLevel = function(level) {
    if (level >= 1 && level <= 10) {
        currentLevel = level;
        score = 0;
        levelComplete = false;
        document.getElementById('score').textContent = '0';
        if(document.getElementById('levelPopup')) {
            document.getElementById('levelPopup').classList.remove('visible');
        }
        createLevel(level);
        setTimeout(showLevelPopup, 300);
        console.log(`跳转到关卡 ${level}`);
    }
};

console.log('提示：使用 jumpToLevel(n) 跳转到关卡 n (1-10)');


// 初始化并启动游戏
window.onload = function() {
    init();
    gameLoop();
};
