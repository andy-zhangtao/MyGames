# 🎮 MyGames - 儿童游戏集合

一个面向 3-12 岁小朋友的在线游戏集合网站首页。

## 🌟 特性

- 🎨 **现代设计** - 柔和渐变色彩、圆角卡片、可爱图标
- 📱 **响应式布局** - 完美适配手机、平板、桌面设备
- ✨ **流畅动画** - 精心设计的悬停效果和过渡动画
- 🧩 **易于扩展** - 清晰的代码结构，方便添加新游戏

## 🚀 快速开始

1. 克隆仓库
```bash
git clone https://github.com/your-username/MyGames.git
```

2. 打开 `index.html` 即可预览

或者直接部署到 GitHub Pages！

## 📁 项目结构

```
MyGames/
├── index.html      # 主页
├── styles.css      # 样式文件
├── script.js       # 交互脚本
├── .gitignore      # Git 忽略规则
└── README.md       # 项目说明
```

## 🎯 添加新游戏

在 `index.html` 的游戏网格区域添加新的卡片：

```html
<div class="game-card" data-game="your-game-id">
    <div class="game-icon">🎯</div>
    <h3 class="game-title">游戏名称</h3>
    <p class="game-desc">简短的游戏描述</p>
</div>
```

## 🎨 自定义样式

在 `styles.css` 中修改 CSS 变量即可快速定制主题：

```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* ... */
}
```

## 📜 开源协议

MIT License

---

Made with ❤️ for kids
