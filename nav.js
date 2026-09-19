// 共通ヘッダー・サイドナビゲーション・モバイルナビゲーション
// v7.1: アカウント導線を追加

document.addEventListener("DOMContentLoaded", () => {
  const currentPage = document.body.dataset.page || "home";
  const header = document.getElementById("site-header");
  const items = [
    ["index.html", "⌂", "ホーム", "home"],
    ["study.html", "▦", "単元一覧", "study"],
    ["practice.html", "✓", "問題演習", "practice"],
    ["review.html", "↻", "復習", "review"],
    ["records.html", "▥", "学習記録", "records"],
    ["test.html", "★", "テスト", "test"]
  ];
  const accountItem = ["auth.html", "◎", "アカウント", "account"];
  if (header) {
    header.className = "site-header";
    header.innerHTML = `
      <div class="header-inner">
        <a href="index.html" class="logo"><span class="logo-mark">⚗</span><span>化学基礎ラボ</span></a>
        <div class="sidebar-caption">大学受験・共通テスト</div>
        <nav class="nav-links" aria-label="メインナビゲーション">
          ${items.map(([href, icon, label, page]) => `<a href="${href}" class="${currentPage === page ? "active" : ""}"><span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span></a>`).join("")}
          <a href="auth.html" class="${currentPage === 'account' ? 'active' : ''}" id="account-nav"><span class="nav-icon" aria-hidden="true">◎</span><span>アカウント</span></a>
        </nav>
        <div class="sidebar-bottom"><button class="theme-btn" id="theme-toggle-btn" aria-label="テーマ切替">☾ ダーク</button></div>
      </div>`;
  }
  const mobileNav = document.getElementById("mobile-tabbar");
  if (mobileNav) {
    mobileNav.innerHTML = [...items, accountItem].map(([href, icon, label, page]) => `<a href="${href}" class="${currentPage === page ? "active" : ""}"><span>${icon}</span><span>${label}</span></a>`).join("");
  }
  const themeBtn = document.getElementById("theme-toggle-btn");
  const currentTheme = localStorage.getItem("kagaku_lab_theme") || "light";
  if (currentTheme === "dark") { document.documentElement.setAttribute("data-theme", "dark"); if (themeBtn) themeBtn.textContent = "☀ ライト"; }
  if (themeBtn) themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) { document.documentElement.removeAttribute("data-theme"); localStorage.setItem("kagaku_lab_theme", "light"); themeBtn.textContent = "☾ ダーク"; }
    else { document.documentElement.setAttribute("data-theme", "dark"); localStorage.setItem("kagaku_lab_theme", "dark"); themeBtn.textContent = "☀ ライト"; }
  });
  document.addEventListener('kagaku-auth-change', e => {
    const label = header?.querySelector('#account-nav span:last-child');
    if (label) label.textContent = e.detail.user ? 'アカウント' : 'ログイン';
  });
});
