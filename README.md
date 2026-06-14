<img width="1983" height="793" alt="03b55510-2407-4ef1-8ed4-36e571f37be9" src="https://github.com/user-attachments/assets/5da22caf-e903-473c-833e-008ff56a39ee" />

# LinkGo - 极简高效的浏览器书签管理工具

> **v2.2** — 增强编辑、动态右键菜单、快捷键逻辑优化及增强中国大陆加载体验。

LinkGo 是一个基于 Chrome Extension Manifest V3 开发的浏览器插件，采用类似 Raycast 的交互逻辑，提供极简、高效的网页书签管理体验。

<img width="2570" height="1368" alt="image" src="https://github.com/user-attachments/assets/8f0fdf0a-1849-4cb3-a23d-ef579c04bf47" />



## ✨ 核心特性

- **🚀 快速唤起** - `Alt + L` 快捷键瞬间打开搜索面板
- **🔍 模糊搜索** - 基于 Fuse.js 的智能模糊匹配，支持拼写容错
- **⚡ 一键保存** - `Alt + Shift + L` 快速保存当前页面
- **🏷️ 标签归类** - 支持 `#标签` 语法自动归类到子文件夹，自定义书签标题
- **📂 分类标签栏** - 搜索框顶部展示所有分类，一键筛选指定分类下的书签
- **✏️ 书签编辑** - 鼠标悬停可修改书签名称和分类
- **🖱️ 右键菜单** - 右键网页可快速保存到指定分类
- **🎨 精美 UI** - 暗色主题 + 毛玻璃效果，视觉体验极佳
- **🔒 样式隔离** - Shadow DOM 技术确保与网页零冲突

## 📦 下载与安装

### 方式一：下载 Release 安装（推荐）

1. 前往 [LinkGo Releases](https://github.com/ufohonglei/linkgo/releases/) 下载最新版本的 `LinkGo.zip`
2. 解压 `LinkGo.zip`
3. 打开 Chrome 浏览器，地址栏输入 `chrome://extensions/`
4. 开启右上角"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的 `LinkGo` 文件夹完成安装

> 下载页面：[LinkGo Releases](https://github.com/ufohonglei/linkgo/releases/)

### 方式二：源码安装

1. 下载或克隆本项目代码到本地
2. 打开 Chrome 浏览器，地址栏输入 `chrome://extensions/`
3. 开启右上角"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹完成安装

### 方式三：Chrome 应用商店（待上架）

> 即将上架 Chrome Web Store，敬请期待

## ⌨️ 快捷键

| 功能 | Windows | Mac |
|------|---------------|-----|
| 打开/关闭搜索框 | `Alt + L` | `Option + L` |
| 快速保存当前页 | `Alt + Shift + L` | `Option + Shift + L` |

> 快捷键可在 `chrome://extensions/shortcuts` 中自定义

## 📖 使用指南

### 🔍 搜索书签

1. 按 `Alt + L` 打开搜索面板
2. 输入关键词进行模糊搜索
3. 使用 `↑↓` 方向键选择书签
4. 按 `Enter` 直接在**新标签页**打开（默认行为）
5. 按 `Ctrl/Cmd + Enter` 同理在新标签页打开
6. 按 `ESC` 关闭搜索框

### 💾 保存书签

#### 方式一：快速保存
- 按 `Alt + Shift + L` 直接将当前页面保存到"未分类"文件夹

#### 方式二：命令模式保存
1. 按 `Alt + L` 打开搜索框
2. 输入 `+ 标题 #标签`（例如：`+ 常用文档 #工作`）
3. 按 `Enter` 保存
4. 使用 `#标签` 会自动创建子文件夹并归类

### ✏️ 编辑书签

- 鼠标悬停在书签上，点击右侧出现的 ✏️ 图标
- 在编辑弹窗中可以同时修改：
  - **书签名称** - 输入新的标题
  - **分类** - 输入新的分类名称（留空则归类到"未分类"）
- 点击"保存"按钮确认修改

### 🗑️ 删除书签

- **单个删除**：鼠标悬停在书签上，点击右侧出现的 🗑️ 图标
- **全部清空**：点击底部栏"清空"按钮，确认后删除所有收藏

### 📂 分类标签栏

当书签有多个分类时，搜索框上方自动显示分类标签栏：
- 点击"全部"查看所有书签
- 点击某个分类名称，只显示该分类下的书签
- 每个标签旁显示该分类的书签数量

### 🖱️ 右键菜单

在任意网页右键，选择"✨ 一键存入 LinkGo"：
- 📁 保存到"未分类"
- 💼 保存到"工作"
- 📚 保存到"学习"
- 📖 保存到"稍后阅读"

## 🏗️ 项目结构

```
LinkGo/
├── manifest.json              # 插件配置（Manifest V3）
├── background.js              # Service Worker 入口
├── background/
│   ├── bookmarks.js           # 书签增删改查、缓存管理
│   └── messages.js            # 消息处理（content ↔ background）
├── content/
│   ├── inject.js              # 内容脚本入口（Shadow DOM 初始化）
│   ├── style.css              # 样式备份
│   └── modules/
│       ├── styles.js          # Shadow DOM 内联样式
│       ├── ui.js              # UI 渲染、面板、教程弹窗
│       ├── search.js          # 搜索、分类筛选、键盘导航
│       ├── handlers.js        # 保存/编辑/删除/清空操作
│       └── toast.js           # Toast 通知
├── lib/
│   └── fuse.js                # Fuse.js 模糊搜索库
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## 🛠️ 技术栈

- **Manifest V3** - Chrome 扩展最新规范
- **Shadow DOM** - 样式隔离，零污染
- **Fuse.js** - 轻量级模糊搜索库
- **原生 JavaScript** - 无框架依赖，极致性能

## 📋 更新日志

### v2.2.0
- ✅ 增强书签编辑：支持同时修改书签名称和分类
- ✅ 优化编辑体验：使用自定义弹窗替代原生 prompt

### v2.1.0
- ✅ 优化分类标签栏与书签操作体验

### v2.0.0
- ✅ 模块化重构：将单一大文件拆分为职责清晰的多模块结构
- ✅ 新增分类标签栏：搜索框顶部展示所有分类，支持一键筛选
- ✅ 新增书签编辑：悬停点击编辑图标可修改书签名称
- ✅ 新增自定义标题：命令模式支持 `+ 自定义标题 #标签` 格式
- ✅ 优化教程弹窗：改为自定义 HTML 弹窗，完整展示所有使用说明

### v1.0.0
- ✅ 基础书签搜索与保存
- ✅ 命令模式 `+ #标签` 保存
- ✅ 右键菜单快速保存
- ✅ Toast 通知提示

## 🔧 开发计划

- [ ] 导入/导出书签
- [ ] 自定义主题
- [ ] 更多快捷键配置

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

## 👤 作者联系

如有问题或建议，欢迎联系作者：

- 💬 微信：lihonglei

## ☕ 支持项目

如果这个项目对你有帮助，可以请作者喝杯咖啡：

| 微信赞赏  |
|---------|
<img width="828" height="1124" alt="8763cdd9430fe17d669889bf2ad4e591" src="https://github.com/user-attachments/assets/32ea0765-990e-42e9-91ad-93a183a78c0a" />

> 您的支持是我持续开发的动力！❤️

## 🙏 致谢

- [Fuse.js](https://fusejs.io/) - 强大的模糊搜索库
- [Feather Icons](https://feathericons.com/) - 优雅的 SVG 图标

---

Made with ❤️ by LinkGo Team
