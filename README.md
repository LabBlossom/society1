# 社区活动地图（GitHub Pages 可用）

这是一个可直接部署的网站前端（可后续接 Python 后端），实现：

- 首页：**中国地图可点省份**（ECharts）+ 省份按钮（全国省份全量）
- 省页：省份非遗风格背景图 + 省地图放大居中 + **城市按钮可点**
- 城市页：六大板块（非遗文化、少数民族文化、便民读书、旅游资料、志愿者报名、剧院演出）
- 右上角：注册/登录，支持手机号与联系方式

## 运行方式（本地）

你有两种方式：

1) 仅前端演示（静态）  
- 直接双击 `index.html`（已改为非模块脚本，可直接打开）  
- 推荐用 VSCode/Live Server 或任意 http server

2) Python 后端模式（Flask，支持注册/登录/报名统计 API）  
- `pip install -r backend/requirements.txt`  
- `python backend/app.py`  
- 浏览器打开 `http://127.0.0.1:8000/`

## 部署到 GitHub Pages

1. 新建一个仓库，把这些文件全部提交上去
2. 进入 GitHub 仓库 Settings → Pages
3. Source 选择 `Deploy from a branch`，Branch 选择 `main` + `/root`
4. 保存后等待生成 Pages 地址

## 如何替换图片（含你要的“找图并插入”）

当前每个省份默认使用自动图片源（Unsplash 关键词），你可以直接替换为你选定的图片：

- 在 `src/data.js` 中给省份/城市改 `heroImage` 为你的图片 URL
- 或把图片放到 `assets/`，再把 `heroImage` 改成本地路径

## 如何改省/市/板块数据

编辑 `src/data.js` 的 `DB`：

- `provinces[]`：省（`id`、`mapName`、`name`、`cities[]`）
- `cities[]`：市（`id`、`name`、`categories[]`）
- `categories[]`：六大板块数据（标题、描述、统计）

## 省内地图（可选）

首页用的是 ECharts 的 `china.js`，可以直接点省份。

省页会尝试按需加载省级地图脚本（从 jsDelivr），映射在：

- `src/app.js` → `ECHARTS_PROVINCE_MAP_JS`

如果加载失败，会自动降级为右侧城市按钮列表（功能不受影响）。

