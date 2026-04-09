const { ASSETS, DB, getCityById, getProvinceById } = window.AppData;

const APP = document.getElementById("app");

const AUTH_KEY = "community_map_auth_v2";

function readAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  syncAuthUI();
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  syncAuthUI();
}

function isLoggedIn() {
  return !!readAuth()?.phone;
}

function syncAuthUI() {
  const auth = readAuth();
  const userEl = document.getElementById("authUser");
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const btnLogout = document.getElementById("btnLogout");

  if (auth?.username) {
    userEl.hidden = false;
    userEl.textContent = `你好，${auth.username || auth.phone}`;
    btnLogin.hidden = true;
    btnRegister.hidden = true;
    btnLogout.hidden = false;
  } else {
    userEl.hidden = true;
    userEl.textContent = "";
    btnLogin.hidden = false;
    btnRegister.hidden = false;
    btnLogout.hidden = true;
  }
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setPage(html) {
  APP.innerHTML = html;
}

function parseHash() {
  const raw = window.location.hash || "#/";
  const path = raw.replace(/^#/, "");
  const parts = path.split("/").filter(Boolean);
  return { raw, path, parts };
}

function goto(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

function heroStyle(url) {
  return `style="--hero:url('${esc(url)}')"`;
}

function renderHero({ title, desc, imageUrl, actionsHtml = "" }) {
  const safeUrl = imageUrl || ASSETS.homeHero;
  return `
    <section class="hero" ${heroStyle(safeUrl)}>
      <div class="heroOverlay">
        <div class="pill">地图可点省份 · 省内地图也可点击</div>
        <div class="heroTitle">${esc(title)}</div>
        <div class="heroDesc">${esc(desc)}</div>
        <div class="heroActions">${actionsHtml}</div>
      </div>
    </section>
  `;
}

function mountHeroBackgrounds() {
  // 将 .hero::before 的背景图用 CSS 变量注入
  const styleId = "__hero_dynamic_style__";
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }
  style.textContent = `
    .hero{ }
    .hero::before{ background-image: var(--hero); }
  `;
}

function openModal({ title, bodyHtml, footerHtml = "" }) {
  closeModal();
  const overlay = document.createElement("div");
  overlay.className = "modalOverlay";
  overlay.id = "__modal__";
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modalHeader">
        <div class="modalTitle">${esc(title)}</div>
        <button class="btn btnSmall btnGhost" data-action="close">关闭</button>
      </div>
      <div class="modalBody">
        ${bodyHtml}
        ${footerHtml ? `<div style="margin-top:12px">${footerHtml}</div>` : ""}
      </div>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.dataset?.action === "close") closeModal();
    if (t === overlay) closeModal();
  });
  document.body.appendChild(overlay);
}

function closeModal() {
  document.getElementById("__modal__")?.remove();
}

function isPhoneValid(phone) {
  return /^1\d{10}$/.test(phone);
}

function openAuthModal(mode) {
  const isLogin = mode === "login";
  openModal({
    title: isLogin ? "登录" : "注册",
    bodyHtml: `
      <div id="authMsg"></div>
      <form id="authForm" class="formGrid">
        <div class="field">
          <label>用户名</label>
          <input name="username" placeholder="请输入用户名" autocomplete="username" required />
        </div>
        <div class="field">
          <label>手机号（必填）</label>
          <input name="phone" placeholder="请输入 11 位手机号" autocomplete="tel" required />
        </div>
        <div class="field">
          <label>密码</label>
          <input name="password" type="password" placeholder="请输入密码" autocomplete="${
            isLogin ? "current-password" : "new-password"
          }" required />
        </div>
        <div class="field">
          <label>邮箱 / 微信 / 其他联系方式（选填）</label>
          <input name="contact" placeholder="例如：name@email.com 或 微信号" autocomplete="email" />
        </div>
        <div class="field">
          <label>联系地址（选填）</label>
          <input name="address" placeholder="例如：XX 省 XX 市 XX 区" autocomplete="street-address" />
        </div>
        <div class="hint">
          演示版账号信息保存在浏览器 <code>localStorage</code>。你后续接 Python 后端时，这些字段可直接复用。
        </div>
        <button class="btn btnPrimary" type="submit">${
          isLogin ? "登录" : "创建账号"
        }</button>
      </form>
    `,
  });

  const form = document.getElementById("authForm");
  const msg = document.getElementById("authMsg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const username = String(fd.get("username") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const password = String(fd.get("password") || "").trim();
    const contact = String(fd.get("contact") || "").trim();
    const address = String(fd.get("address") || "").trim();

    if (!username || !password || !phone) {
      msg.innerHTML = `<div class="error">请填写用户名、手机号、密码。</div>`;
      return;
    }
    if (!isPhoneValid(phone)) {
      msg.innerHTML = `<div class="error">手机号格式不正确，请输入 11 位中国大陆手机号。</div>`;
      return;
    }

    writeAuth({ username, phone, password, contact, address, ts: Date.now() });
    msg.innerHTML = `<div class="success">${
      isLogin ? "登录成功" : "注册成功"
    }，现在可以报名活动了。</div>`;
    setTimeout(() => closeModal(), 450);
  });
}

function provinceButtonsHtml() {
  const chips = DB.provinces
    .map(
      (p) => `
        <button class="chipBtn" data-goto="#/province/${esc(p.id)}">
          ${esc(p.name)}
        </button>
      `,
    )
    .join("");
  return `<div class="chips">${chips}</div>`;
}

function renderAbout() {
  setPage(`
    ${renderHero({
      title: "项目说明",
      desc: "这是一个可直接部署到 GitHub Pages 的纯静态网站。你可以在 src/data.js 中维护省市与活动数据，并替换 assets/ 下的背景图与封面图。",
      imageUrl: ASSETS.homeHero,
      actionsHtml: `<button class="btn btnPrimary" data-goto="#/">返回首页</button>`,
    })}
    <div style="height:14px"></div>
    <section class="panel">
      <div class="panelHeader">
        <div>
          <div class="panelTitle">你可以改哪些地方</div>
          <div class="panelSub">省、市、活动、报名人数、图片路径</div>
        </div>
      </div>
      <div class="panelBody">
        <div class="list">
          <div class="card">
            <div class="cardTitle">数据（全国省份已补全）</div>
            <div class="cardMeta">编辑 <code>src/data.js</code> 的 <code>DB</code>，可继续扩展城市列表。</div>
          </div>
          <div class="card">
            <div class="cardTitle">图片</div>
            <div class="cardMeta">目前用自动照片源（Unsplash 关键词），你可替换为自己挑选的非遗照片 URL 或本地图片路径。</div>
          </div>
          <div class="card">
            <div class="cardTitle">地图</div>
            <div class="cardMeta">首页与省页均支持地图点击，省份和城市按钮也可点击。</div>
          </div>
        </div>
      </div>
    </section>
  `);
}

function renderHome() {
  setPage(`
    ${renderHero({
      title: "从地图开始发现社区活动",
      desc: "点击中国地图任一省份后进入省详情：背景为该省非遗风格图；再点击城市后看到 6 个功能板块。",
      imageUrl: ASSETS.homeHero,
      actionsHtml: `
        <button class="btn btnPrimary" data-goto="#/about">如何替换图片与数据</button>
        <button class="btn btnGhost" data-action="scrollToMap">去地图</button>
      `,
    })}

    <div style="height:14px"></div>

    <div class="grid2" id="homeMap">
      <section class="panel">
        <div class="panelHeader">
          <div>
            <div class="panelTitle">中国地图（全国省份全量可点）</div>
            <div class="panelSub">点击省份后进入省详情页</div>
          </div>
          <div class="pill">提示：你也可用右侧按钮进入</div>
        </div>
        <div class="panelBody">
          <div id="chinaMap" class="mapBox"></div>
        </div>
      </section>

      <section class="panel">
        <div class="panelHeader">
          <div>
            <div class="panelTitle">省份按钮（可点）</div>
            <div class="panelSub">和地图同样功能，便于移动端</div>
          </div>
        </div>
        <div class="panelBody">
          ${provinceButtonsHtml()}
          <div style="height:12px"></div>
          <div class="hint">
            若你想要“点地图的省份后，省份后面可写社区活动/往届活动名称”，可在省详情页的头图区域自定义展示（已预留）。
          </div>
        </div>
      </section>
    </div>
  `);

  // 地图渲染
  initChinaMap();

  // 事件：滚动到地图
  APP.querySelector('[data-action="scrollToMap"]')?.addEventListener("click", () => {
    document.getElementById("homeMap")?.scrollIntoView({ behavior: "smooth" });
  });
}

function initChinaMap() {
  const el = document.getElementById("chinaMap");
  if (!el) return;
  const chart = echarts.init(el);
  const option = {
    backgroundColor: "transparent",
    tooltip: { trigger: "item" },
    series: [
      {
        type: "map",
        map: "china",
        roam: true,
        emphasis: { label: { show: true, color: "#ffffff" } },
        label: { show: false, color: "rgba(255,255,255,0.75)" },
        itemStyle: {
          areaColor: "rgba(255,255,255,0.08)",
          borderColor: "rgba(255,255,255,0.18)",
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: "rgba(124,58,237,0.35)",
            borderColor: "rgba(255,255,255,0.32)",
          },
          label: { show: true },
        },
        select: {
          itemStyle: {
            areaColor: "rgba(34,197,94,0.28)",
          },
          label: { show: true },
        },
        data: [],
      },
    ],
  };
  chart.setOption(option);

  // 点击省份 → 优先 mapName 匹配
  chart.on("click", (params) => {
    const provinceName = String(params?.name || "").trim();
    const found = DB.provinces.find((p) => p.mapName === provinceName || p.name === provinceName);
    if (found) {
      goto(`#/province/${found.id}`);
      return;
    }
    // 找不到就给提示（例如 DB 中没配置该省）
    openModal({
      title: "未配置该省数据",
      bodyHtml: `
        <div class="hint">
          你点击的是：<code>${esc(provinceName)}</code><br/>
          目前 <code>src/data.js</code> 里没有配置这个省的数据。你可以新增一个省对象并设置 <code>id/name/cities</code>。
        </div>
      `,
      footerHtml: `<button class="btn btnPrimary" data-action="close">知道了</button>`,
    });
  });

  // 响应式
  window.addEventListener("resize", () => chart.resize());
}

const ECHARTS_PROVINCE_MAP_JS = Object.fromEntries(
  DB.provinces.map((p) => [p.mapName, `https://fastly.jsdelivr.net/npm/echarts@5/map/js/province/${p.id}.js`]),
);

function loadScriptOnce(url) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-dynamic="${CSS.escape(url)}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.dataset.dynamic = url;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(s);
  });
}

function renderProvince(provinceId) {
  const p = getProvinceById(provinceId);
  if (!p) {
    setPage(`
      ${renderHero({
        title: "未找到该省",
        desc: "请检查 src/data.js 是否配置了该省的 id。",
        imageUrl: ASSETS.provinceHeroFallback,
        actionsHtml: `<button class="btn btnPrimary" data-goto="#/">回首页</button>`,
      })}
    `);
    return;
  }

  const heroImg = p.heroImage || ASSETS.provinceHeroFallback;
  const cities = p.cities
    .map(
      (c) => `
        <button class="chipBtn" data-goto="#/province/${esc(p.id)}/city/${esc(c.id)}">
          ${esc(c.name)}
        </button>
      `,
    )
    .join("");

  setPage(`
    ${renderHero({
      title: `${p.name} · 非遗与社区活动`,
      desc: "该页背景为当前省份的非遗风格图片，地图将放大居中显示；你可以点击省内地图或城市按钮继续进入。",
      imageUrl: heroImg,
      actionsHtml: `
        <button class="btn btnGhost" data-goto="#/">返回首页</button>
        <button class="btn btnPrimary" data-action="scrollToCities">去城市</button>
      `,
    })}

    <div style="height:14px"></div>

    <div class="grid2">
      <section class="panel">
        <div class="panelHeader">
          <div>
            <div class="panelTitle">${esc(p.name)}地图（放大居中，可点击）</div>
            <div class="panelSub">若省级地图脚本无法加载，会自动降级为“城市按钮列表”</div>
          </div>
          <div class="pill">省级地图：ECharts</div>
        </div>
        <div class="panelBody">
          <div id="provinceMap" class="mapBox"></div>
          <div id="provinceMapHint" class="hint" style="margin-top:10px"></div>
        </div>
      </section>

      <section class="panel" id="cityButtons">
        <div class="panelHeader">
          <div>
            <div class="panelTitle">城市（可点）</div>
            <div class="panelSub">进入城市后查看活动推荐</div>
          </div>
        </div>
        <div class="panelBody">
          <div class="chips">${cities}</div>
        </div>
      </section>
    </div>
  `);

  APP.querySelector('[data-action="scrollToCities"]')?.addEventListener("click", () => {
    document.getElementById("cityButtons")?.scrollIntoView({ behavior: "smooth" });
  });

  initProvinceMap(p);
}

async function initProvinceMap(province) {
  const el = document.getElementById("provinceMap");
  const hint = document.getElementById("provinceMapHint");
  if (!el || !hint) return;

  const scriptUrl = ECHARTS_PROVINCE_MAP_JS[province.mapName];
  if (!scriptUrl) {
    hint.innerHTML = `未配置 <code>${esc(province.mapName)}</code> 的省级地图脚本，已保留城市按钮入口。`;
    el.style.display = "none";
    return;
  }

  try {
    await loadScriptOnce(scriptUrl);
  } catch {
    hint.innerHTML = `省级地图脚本加载失败，已降级为城市按钮列表（不影响功能）。`;
    el.style.display = "none";
    return;
  }

  hint.innerHTML = `提示：你也可以直接点右侧城市按钮进入。`;
  const chart = echarts.init(el);
  const mapName = province.mapName;

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "item" },
    series: [
      {
        type: "map",
        map: mapName,
        roam: true,
        zoom: 1.25,
        label: { show: false, color: "rgba(255,255,255,0.78)" },
        itemStyle: {
          areaColor: "rgba(255,255,255,0.07)",
          borderColor: "rgba(255,255,255,0.16)",
        },
        emphasis: {
          label: { show: true },
          itemStyle: { areaColor: "rgba(124,58,237,0.30)" },
        },
      },
    ],
  });

  chart.on("click", (params) => {
    const name = String(params?.name || "").trim();
    // 省内地图点到的是地级市/区县，演示版：尝试匹配城市中文名
    const city = province.cities.find((c) => c.name.includes(name) || name.includes(c.name));
    if (city) goto(`#/province/${province.id}/city/${city.id}`);
  });

  window.addEventListener("resize", () => chart.resize());
}

function renderCity(provinceId, cityId) {
  const p = getProvinceById(provinceId);
  const c = getCityById(provinceId, cityId);
  if (!p || !c) {
    setPage(`
      ${renderHero({
        title: "未找到该城市",
        desc: "请检查 src/data.js 是否配置了该城市的 id。",
        imageUrl: ASSETS.cityHeroFallback,
        actionsHtml: `<button class="btn btnPrimary" data-goto="#/">回首页</button>`,
      })}
    `);
    return;
  }

  const heroImg = c.heroImage || ASSETS.cityHeroFallback;
  const list = c.categories
    .map((a) => {
      const quota = `${a.stats.signed}/${a.stats.total}`;
      return `
        <div class="card">
          <div class="cardTop">
            <div>
              <div class="cardTitle">${esc(a.title)}</div>
              <div class="cardMeta">${esc(a.desc)}</div>
              <div class="cardMeta">统计：${esc(quota)}</div>
            </div>
            <div class="pill">推荐</div>
          </div>
          <div class="cardActions">
            <button class="btn btnPrimary" data-action="openCategory" data-category="${esc(a.id)}">进入板块</button>
            <button class="btn btnGhost" data-action="quickSignup" data-category="${esc(a.id)}">报名/登记</button>
          </div>
        </div>
      `;
    })
    .join("");

  setPage(`
    ${renderHero({
      title: `${c.name} · 六大功能板块`,
      desc: "你要求的六个板块都已配置：非遗文化、少数民族文化、便民读书、旅游资料、志愿者报名、剧院演出。",
      imageUrl: heroImg,
      actionsHtml: `
        <button class="btn btnGhost" data-goto="#/province/${esc(p.id)}">返回${esc(
          p.name,
        )}</button>
        <button class="btn btnPrimary" data-goto="#/">回首页</button>
      `,
    })}

    <div style="height:14px"></div>

    <section class="panel">
      <div class="panelHeader">
        <div>
          <div class="panelTitle">六大功能板块</div>
          <div class="panelSub">用于统计、报名、管理社区活动（可继续接入 Python 后端）</div>
        </div>
        <div class="pill">${esc(c.categories.length)} 个板块</div>
      </div>
      <div class="panelBody">
        <div class="list">${list || `<div class="hint">暂无板块数据，你可以在 <code>src/data.js</code> 给该城市添加 categories。</div>`}</div>
      </div>
    </section>
  `);

  APP.querySelectorAll('[data-action="openCategory"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = btn.getAttribute("data-category");
      const category = c.categories.find((it) => it.id === categoryId);
      if (!category) return;
      openModal({
        title: `${category.title} · ${c.name}`,
        bodyHtml: `
          <div class="cardMeta" style="line-height:1.7">${esc(category.desc)}</div>
          <div style="height:10px"></div>
          <div class="pill">统计：${esc(category.stats.signed)}/${esc(category.stats.total)}</div>
        `,
        footerHtml: `<button class="btn btnPrimary" data-action="close">关闭</button>`,
      });
    });
  });

  APP.querySelectorAll('[data-action="quickSignup"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const categoryId = btn.getAttribute("data-category");
      const category = c.categories.find((it) => it.id === categoryId);
      if (!isLoggedIn()) {
        openModal({
          title: "需要登录才能报名",
          bodyHtml: `<div class="hint">你可以先浏览活动，但报名需要登录/注册。</div>`,
          footerHtml: `
            <button class="btn btnPrimary" data-action="login">去登录</button>
            <button class="btn btnGhost" data-action="register">去注册</button>
          `,
        });
        const m = document.getElementById("__modal__");
        m?.addEventListener("click", (e) => {
          const t = e.target;
          if (t?.dataset?.action === "login") openAuthModal("login");
          if (t?.dataset?.action === "register") openAuthModal("register");
        });
        return;
      }
      openModal({
        title: "登记成功（演示）",
        bodyHtml: `<div class="success">你已提交：${esc(category?.title || "板块")} 报名信息。</div>`,
        footerHtml: `<button class="btn btnPrimary" data-action="close">完成</button>`,
      });
    });
  });
}

function router() {
  mountHeroBackgrounds();
  syncAuthUI();
  const { parts } = parseHash();

  // routes:
  // /                 home
  // /about            about
  // /province/:pid
  // /province/:pid/city/:cid
  // /province/:pid/city/:cid
  if (parts.length === 0) {
    renderHome();
    return;
  }
  if (parts[0] === "about") {
    renderAbout();
    return;
  }
  if (parts[0] === "province" && parts[1]) {
    const pid = parts[1];
    if (parts[2] === "city" && parts[3]) {
      const cid = parts[3];
      renderCity(pid, cid);
      return;
    }
    renderProvince(pid);
    return;
  }

  // fallback
  renderHome();
}

function wireGlobalClicks() {
  // data-goto 跳转
  document.body.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const to = t.getAttribute("data-goto");
    if (to) {
      goto(to.replace(/^#/, "#"));
      return;
    }
  });

  // 顶部登录/注册/退出
  document.getElementById("btnLogin")?.addEventListener("click", () => openAuthModal("login"));
  document
    .getElementById("btnRegister")
    ?.addEventListener("click", () => openAuthModal("register"));
  document.getElementById("btnLogout")?.addEventListener("click", () => clearAuth());
}

// boot
wireGlobalClicks();
window.addEventListener("hashchange", router);
router();

