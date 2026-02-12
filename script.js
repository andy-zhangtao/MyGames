/**
 * 小游戏乐园 - 主脚本文件
 * 负责首页交互逻辑
 */

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initGameCards();
    initAnimations();
    updateGameCount();
});

/**
 * 初始化游戏卡片交互
 */
function initGameCards() {
    const cards = document.querySelectorAll('.game-card:not(.coming-soon)');
    
    cards.forEach(card => {
        // 点击涟漪效果
        card.addEventListener('click', function(e) {
            createRipple(e, this);
        });

        // 键盘无障碍支持
        card.setAttribute('tabindex', '0');
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

/**
 * 创建点击涟漪效果
 */
function createRipple(event, element) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(108, 99, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple-effect 0.6s ease-out;
        pointer-events: none;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// 添加涟漪动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-effect {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * 初始化滚动动画
 */
function initAnimations() {
    // 使用 Intersection Observer 实现滚动显示动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // 观察所有游戏卡片
    document.querySelectorAll('.game-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

/**
 * 添加可见类样式
 */
const visibleStyle = document.createElement('style');
visibleStyle.textContent = `
    .game-card.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(visibleStyle);

/**
 * 更新游戏数量显示
 */
function updateGameCount() {
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    const countElement = document.getElementById('game-count');
    if (countElement) {
        animateNumber(countElement, 0, gameCards.length, 1000);
    }
}

/**
 * 数字动画效果
 */
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用 easeOutQuart 缓动函数
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + range * easeProgress);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * 预加载游戏页面（可选）
 * 当用户悬停在卡片上时预加载对应游戏
 */
function initPreload() {
    const cards = document.querySelectorAll('.game-card:not(.coming-soon)');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // 创建预加载链接
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'prefetch';
                preloadLink.href = href;
                document.head.appendChild(preloadLink);
            }
        }, { once: true }); // 只执行一次
    });
}

// 如果支持 prefetch，启用预加载
if ('connection' in navigator && navigator.connection.saveData === false) {
    initPreload();
}

/**
 * 主题切换（预留功能）
 * 未来可以添加深色模式支持
 */
window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};

// 检查保存的主题偏好
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

/**
 * 工具函数：节流
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 工具函数：防抖
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 控制台欢迎信息
console.log('%c🎮 欢迎来到小游戏乐园！', 'font-size: 24px; font-weight: bold; color: #6C63FF;');
console.log('%c这个项目为小朋友们制作 💖', 'font-size: 14px; color: #FF6B9D;');
