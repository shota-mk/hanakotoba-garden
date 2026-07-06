(function () {
  const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];
  const MAX_RESULTS = 20;

  function keyOf(date) {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return m + "-" + d;
  }

  function replay() {
    const main = document.querySelector(".sanctuary");
    main.style.animation = "none";
    void main.offsetWidth; // reflow で再生をリセット
    main.style.animation = "";
  }

  function render(date) {
    const entry = window.HANAKOTOBA[keyOf(date)];
    if (!entry) return;

    document.getElementById("dateLine").textContent =
      date.getFullYear() + "年 " + (date.getMonth() + 1) + "月 " + date.getDate() + "日（" + WEEKDAYS[date.getDay()] + "）";
    document.getElementById("flowerName").textContent = entry.flower;
    document.getElementById("flowerMeaning").textContent = entry.meaning;
    document.getElementById("flowerMessage").textContent = entry.message;
    replay();
  }

  function setPicker(date) {
    picker.value = date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  /* ---- 日付から探す ---- */
  const picker = document.getElementById("datePick");
  const today = new Date();
  setPicker(today);

  picker.addEventListener("change", function () {
    if (!picker.value) return;
    const [y, m, d] = picker.value.split("-").map(Number);
    render(new Date(y, m - 1, d));
  });

  document.getElementById("todayBtn").addEventListener("click", function () {
    const now = new Date();
    setPicker(now);
    render(now);
  });

  /* ---- 花から探す ---- */
  const searchInput = document.getElementById("flowerSearch");
  const resultsList = document.getElementById("searchResults");
  const datalist = document.getElementById("flowerList");

  // 入力補完用に花の名前一覧を作る
  const uniqueFlowers = new Set();
  Object.values(window.HANAKOTOBA).forEach(function (e) { uniqueFlowers.add(e.flower); });
  Array.from(uniqueFlowers).sort().forEach(function (name) {
    const opt = document.createElement("option");
    opt.value = name;
    datalist.appendChild(opt);
  });

  // ひらがな→カタカナに揃えて、ゆるく一致させる
  function normalize(s) {
    return s.replace(/[ぁ-ん]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) + 0x60);
    }).toLowerCase();
  }

  function search(query) {
    resultsList.innerHTML = "";
    const q = normalize(query.trim());
    if (!q) return;

    const hits = [];
    Object.keys(window.HANAKOTOBA).sort().forEach(function (key) {
      const e = window.HANAKOTOBA[key];
      if (normalize(e.flower).includes(q) || normalize(e.meaning).includes(q)) {
        hits.push({ key: key, entry: e });
      }
    });

    if (hits.length === 0) {
      const li = document.createElement("li");
      li.className = "search-note";
      li.textContent = "見つかりませんでした。別の言葉でお試しください。";
      resultsList.appendChild(li);
      return;
    }

    hits.slice(0, MAX_RESULTS).forEach(function (hit) {
      const [m, d] = hit.key.split("-").map(Number);
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML =
        '<span class="r-date">' + m + "月" + d + "日</span>" + hit.entry.flower +
        '<span class="r-meaning">' + hit.entry.meaning + "</span>";
      btn.addEventListener("click", function () {
        const date = new Date(today.getFullYear(), m - 1, d);
        setPicker(date);
        render(date);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      li.appendChild(btn);
      resultsList.appendChild(li);
    });

    if (hits.length > MAX_RESULTS) {
      const li = document.createElement("li");
      li.className = "search-note";
      li.textContent = "ほか " + (hits.length - MAX_RESULTS) + " 件。言葉を足すと絞り込めます。";
      resultsList.appendChild(li);
    }
  }

  searchInput.addEventListener("input", function () { search(searchInput.value); });

  /* ---- 舞い散る花びら（深紅の薔薇と白百合） ---- */
  const petals = document.getElementById("petals");
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("span");
    p.className = "petal " + (i % 3 === 0 ? "lily" : "rose");
    p.style.setProperty("--x", Math.random() * 100 + "vw");
    p.style.setProperty("--size", 8 + Math.random() * 9 + "px");
    p.style.setProperty("--dur", 9 + Math.random() * 9 + "s");
    p.style.setProperty("--delay", Math.random() * 12 + "s");
    p.style.setProperty("--sway", (Math.random() * 30 - 15) + "vw");
    petals.appendChild(p);
  }

  /* ---- 背景に散る薔薇と百合 ---- */
  const ROSE_SVG =
    '<svg class="rose-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<g>' +
    '<ellipse cx="50" cy="26" rx="15" ry="21" fill="#7d1024" transform="rotate(0 50 50)"/>' +
    '<ellipse cx="50" cy="26" rx="15" ry="21" fill="#8f1229" transform="rotate(72 50 50)"/>' +
    '<ellipse cx="50" cy="26" rx="15" ry="21" fill="#7d1024" transform="rotate(144 50 50)"/>' +
    '<ellipse cx="50" cy="26" rx="15" ry="21" fill="#8f1229" transform="rotate(216 50 50)"/>' +
    '<ellipse cx="50" cy="26" rx="15" ry="21" fill="#96142c" transform="rotate(288 50 50)"/>' +
    '<circle cx="50" cy="50" r="20" fill="#a51834"/>' +
    '<path d="M50 50 m-14 0 a14 14 0 1 1 14 14 a10 10 0 1 0 -10 -10 a7 7 0 1 1 7 7" ' +
    'fill="none" stroke="#d94a63" stroke-width="2.5" stroke-linecap="round"/>' +
    '</g></svg>';

  const LILY_SVG =
    '<svg class="lily-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<g>' +
    [0, 60, 120, 180, 240, 300].map(function (deg, i) {
      const fill = i % 2 === 0 ? "#f4efe6" : "#e6ddcc";
      return '<path d="M50 50 C 42 30, 44 12, 50 4 C 56 12, 58 30, 50 50 Z" fill="' + fill + '" transform="rotate(' + deg + ' 50 50)"/>';
    }).join("") +
    '<circle cx="50" cy="50" r="4.5" fill="#d9b23c"/>' +
    '<g stroke="#d9b23c" stroke-width="1.6" stroke-linecap="round">' +
    '<line x1="50" y1="50" x2="42" y2="36"/><line x1="50" y1="50" x2="58" y2="36"/><line x1="50" y1="50" x2="50" y2="33"/>' +
    '</g>' +
    '<circle cx="42" cy="36" r="2.4" fill="#b4471f"/><circle cx="58" cy="36" r="2.4" fill="#b4471f"/><circle cx="50" cy="33" r="2.4" fill="#b4471f"/>' +
    '</g></svg>';

  const flora = document.getElementById("floraBg");
  const blooms = [];
  for (let i = 0; i < 14; i++) blooms.push(i % 2 === 0 ? ROSE_SVG : LILY_SVG);
  blooms.forEach(function (svg, i) {
    const wrap = document.createElement("div");
    wrap.innerHTML = svg;
    const el = wrap.firstChild;
    const size = 55 + Math.random() * 95;
    el.style.width = size + "px";
    el.style.height = size + "px";
    // 中央の文章を避けて左右の帯に散らす
    const leftBand = Math.random() < 0.5;
    el.style.left = (leftBand ? Math.random() * 22 : 78 + Math.random() * 18) + "vw";
    el.style.top = Math.random() * 92 + "vh";
    el.style.opacity = (0.16 + Math.random() * 0.2).toFixed(2);
    el.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
    flora.appendChild(el);
  });

  render(today);
})();
