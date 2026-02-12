# MyGames 开发规则

> 每个开发者必须遵守这些规则，确保代码质量和游戏稳定性

---

## 1. 目录结构规则

### 1.1 每个游戏独立目录

```
games/
├── number-match/        # 数字消消乐
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   └── README.md        # 可选：游戏说明
├── memory-flip/         # 记忆翻翻乐
│   ├── index.html
│   ├── style.css
│   └── game.js
└── [新游戏名]/          # 新游戏
    ├── index.html
    ├── style.css
    └── game.js
```

### 1.2 文件命名规范

| 文件 | 用途 | 必须 |
|------|------|------|
| `index.html` | 页面结构 | ✅ |
| `style.css` | 样式（自包含） | ✅ |
| `game.js` | 游戏逻辑 | ✅ |
| `README.md` | 游戏说明 | 可选 |

---

## 2. 隔离性规则

### 2.1 样式隔离

- **每个游戏的 CSS 必须自包含**，不依赖外部公共样式
- 使用唯一的类名前缀或特定的父选择器

```css
/* ✅ 正确：使用游戏特定的父选择器 */
.memory-flip .card { ... }
.number-match .cell { ... }

/* ❌ 错误：通用类名可能冲突 */
.card { ... }
.cell { ... }
```

### 2.2 JavaScript 隔离

- **使用 IIFE 或 Class 封装**，避免全局变量污染
- 游戏实例挂载到 `window.game`（方便调试）

```javascript
// ✅ 正确：Class 封装
class MemoryFlipGame {
    constructor() { ... }
}
window.game = new MemoryFlipGame();

// ❌ 错误：全局变量
let score = 0;
let cards = [];
```

### 2.3 DOM ID 隔离

- **每个游戏的 DOM ID 必须唯一**
- 使用游戏前缀避免冲突

```html
<!-- ✅ 正确 -->
<div id="memory-flip-board">
<div id="number-match-board">

<!-- ❌ 错误：可能冲突 -->
<div id="game-board">
```

---

## 3. 修改规则

### 3.1 修改前检查

```bash
# 检查修改是否影响其他游戏
git status
git diff

# 确保只修改目标游戏的文件
```

### 3.2 禁止跨游戏修改

| 操作 | 允许 | 说明 |
|------|------|------|
| 修改 `games/A/` 内的文件 | ✅ | 只影响游戏 A |
| 修改 `index.html`（主页） | ⚠️ | 需谨慎，影响入口 |
| 修改 `styles.css`（主页样式） | ⚠️ | 需谨慎，影响主页 |
| 修改其他游戏的文件 | ❌ | 严禁 |

### 3.3 修改后验证

1. **验证当前游戏**：运行并测试完整流程
2. **验证其他游戏**：打开其他游戏页面，确认无报错
3. **验证主页**：确认游戏入口正常

---

## 4. 测试规则

### 4.1 每个游戏必须有测试

```
games/
├── number-match/
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   └── test.spec.js    # 测试文件（可选但推荐）
```

### 4.2 测试清单（必须全部通过）

开发完成后，必须手动或自动测试以下内容：

#### 功能测试

| 测试项 | 检查点 |
|--------|--------|
| **页面加载** | 无 JS 错误，无 404 资源 |
| **核心玩法** | 游戏可以正常进行 |
| **计分系统** | 分数正确计算 |
| **胜利判定** | 游戏结束逻辑正确 |
| **重新开始** | 可以重置游戏 |

#### 兼容性测试

| 测试项 | 检查点 |
|--------|--------|
| **Chrome** | 正常运行 |
| **Safari** | 正常运行 |
| **移动端** | 触摸操作正常 |
| **不同屏幕尺寸** | 响应式布局正常 |

#### 隔离性测试

| 测试项 | 检查点 |
|--------|--------|
| **其他游戏** | 打开其他游戏，确认无报错 |
| **主页** | 游戏入口可点击 |
| **浏览器后退** | 从游戏返回主页正常 |

### 4.3 测试命令

```bash
# 启动本地服务器
npx serve

# 手动测试
# 1. 打开 http://localhost:3000/games/[游戏名]/
# 2. 执行测试清单中的所有项
# 3. 检查浏览器控制台无错误
```

---

## 5. 开发流程

### 5.1 新游戏开发流程

```
1. 创建目录
   mkdir games/[新游戏名]

2. 创建文件
   - index.html
   - style.css
   - game.js

3. 实现游戏
   - 遵循现有代码风格
   - 自包含样式和逻辑

4. 本地测试
   - 启动服务器
   - 执行测试清单

5. 更新主页
   - 在 index.html 添加游戏入口卡片

6. 验证隔离性
   - 测试其他游戏正常

7. 提交代码
```

### 5.2 Bug 修复流程

```
1. 定位问题
   - 检查浏览器控制台错误
   - 确认是哪个游戏的问题

2. 修改代码
   - 只修改目标游戏的文件
   - 不修改其他游戏

3. 验证修复
   - 测试问题已解决
   - 测试其他游戏正常

4. 提交代码
   - commit 信息清晰描述问题
```

---

## 6. 代码风格

### 6.1 CSS

```css
/* 使用 CSS 变量 */
:root {
    --primary: #FF6B6B;
    --transition: all 0.3s ease;
}

/* 响应式断点 */
@media (min-width: 768px) { }
@media (max-height: 600px) { }

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) { }

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) { }
```

### 6.2 JavaScript

```javascript
/* 游戏名 - 游戏逻辑 */

class GameName {
    constructor() {
        this.score = 0;
        this.initElements();
        this.bindEvents();
        this.startNewGame();
    }

    initElements() {
        this.boardEl = document.getElementById('board');
        // 使用 this.xxxEl 命名 DOM 引用
    }

    bindEvents() {
        // 使用箭头函数保持 this 绑定
        this.btn.addEventListener('click', () => this.handleClick());
    }

    // ... 其他方法
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameName();
});
```

---

## 7. 检查清单

开发完成后，确认以下所有项：

- [ ] 游戏在独立目录中
- [ ] CSS 自包含，无外部依赖
- [ ] JS 使用 Class 封装
- [ ] 页面加载无错误
- [ ] 核心玩法正常
- [ ] 移动端触摸正常
- [ ] 其他游戏未受影响
- [ ] 主页入口正确
- [ ] 浏览器后退正常

---

## 8. 常见问题

### Q: 如何确保修改不影响其他游戏？

A: 
1. 只修改目标游戏目录下的文件
2. 不修改公共文件（主页除外）
3. 修改后打开其他游戏验证

### Q: 发现其他游戏有问题怎么办？

A: 
1. 不要在当前开发中顺便修复
2. 记录问题，单独处理
3. 避免"顺手修改"引入新问题

### Q: 如何测试移动端？

A: 
1. Chrome DevTools → 设备模拟
2. 真机测试：手机浏览器打开本地 IP

---

**遵守这些规则，确保每个游戏都是独立、稳定、可维护的！**
