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
        hasDropBox: false
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
        hasDropBox: true
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
        hasDropBox: true
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
            
            // 弹跳效果 - 使用 scale 方法
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
    });
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
    
    if (currentLevel < 3) {
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
    };
    
    popup.classList.add('visible');
}

// 获取关卡描述
function getLevelDescription(level) {
    const descriptions = {
        1: '学习基本操作，碰撞弹跳器得分!',
        2: '挑战旋转风车，击落漂浮球!',
        3: '终极挑战! 触发多米诺连锁反应!'
    };
    return descriptions[level];
}

// 开始下一关
function startNextLevel() {
    if (currentLevel < 3) {
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
        
        // 更新弹珠位置预览
        if (ball && launchConstraint) {
            const pullDist = power * 0.3;
            Body.setPosition(ball, {
                x: launchStartX - Math.cos(launchAngle) * pullDist,
                y: launchStartY - Math.sin(launchAngle) * pullDist
            });
        }
    }
    
    // 检查弹珠是否出界
    if (ball) {
        if (ball.position.y > canvasHeight + 50 ||
            ball.position.x < -50 ||
            ball.position.x > canvasWidth + 50) {
            resetBall();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// 初始化并启动游戏
window.onload = function() {
    init();
    gameLoop();
};
