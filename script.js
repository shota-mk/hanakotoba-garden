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
  // 漫画のペン画風・白インクの線画
  const INK = "#f5f3ef";

  const ROSE_SVG =
    '<svg class="rose-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<g fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    // 外周の花びら（波打つ輪郭）
    '<path d="M50 8 A 21 21 0 0 1 76 20 A 21 21 0 0 1 91 46 A 21 21 0 0 1 80 74 A 21 21 0 0 1 52 91 A 21 21 0 0 1 24 78 A 21 21 0 0 1 9 50 A 21 21 0 0 1 21 23 A 21 21 0 0 1 50 8 Z" fill="#0a0a0a"/>' +
    // 中間の花びら
    '<path d="M50 20 A 15 15 0 0 1 70 29 A 15 15 0 0 1 79 50 A 15 15 0 0 1 69 71 A 15 15 0 0 1 48 79 A 15 15 0 0 1 28 69 A 15 15 0 0 1 21 48 A 15 15 0 0 1 31 28 A 15 15 0 0 1 50 20 Z"/>' +
    // 渦を巻く中心
    '<path d="M50 50 m-6 0 a6 6 0 1 1 6 6 a10 10 0 1 0 -10 -10 a14 14 0 1 1 14 14 a19 19 0 1 0 -19 -19"/>' +
    // 花びらの折り返し線
    '<path d="M76 20 Q 66 30 62 26 M91 46 Q 79 50 78 44 M80 74 Q 70 66 74 62 M24 78 Q 32 68 36 72 M9 50 Q 21 46 22 52 M21 23 Q 30 32 26 36"/>' +
    // 葉
    '<path d="M14 82 Q 2 94 8 99 Q 20 97 22 86 Q 19 80 14 82 Z" fill="#0a0a0a"/>' +
    '<path d="M14 82 L 8 99 M12 90 L 17 88 M10 95 L 15 93" stroke-width="1.4"/>' +
    '<path d="M86 84 Q 99 92 96 99 Q 84 99 80 89 Q 82 83 86 84 Z" fill="#0a0a0a"/>' +
    '<path d="M86 84 L 96 99 M89 90 L 85 93 M93 95 L 89 97" stroke-width="1.4"/>' +
    '</g></svg>';

  const LILY_SVG =
    '<svg class="lily-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<g stroke="' + INK + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    [0, 60, 120, 180, 240, 300].map(function (deg, i) {
      // 白塗りと黒抜きの花びらを交互に
      const fill = i % 2 === 0 ? INK : "#0a0a0a";
      return '<path d="M50 50 C 41 32, 43 12, 50 4 C 57 12, 59 32, 50 50 Z" fill="' + fill + '" transform="rotate(' + deg + ' 50 50)"/>' +
        '<path d="M50 46 L 50 12" fill="none" stroke-width="1.2" transform="rotate(' + deg + ' 50 50)"/>';
    }).join("") +
    '<g fill="none" stroke-width="1.6">' +
    '<path d="M50 50 Q 44 40 41 33 M50 50 Q 56 40 59 33 M50 50 L 50 31"/>' +
    '</g>' +
    '<ellipse cx="41" cy="31" rx="3" ry="2" fill="' + INK + '"/>' +
    '<ellipse cx="59" cy="31" rx="3" ry="2" fill="' + INK + '"/>' +
    '<ellipse cx="50" cy="29" rx="3" ry="2" fill="' + INK + '"/>' +
    '</g></svg>';

  const SPLAT_SVG =
    '<svg class="splat-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<g fill="' + INK + '">' +
    '<path d="M50 38 Q 62 30 70 40 Q 82 38 78 52 Q 88 60 74 66 Q 74 78 60 72 Q 50 84 44 70 Q 30 74 34 60 Q 22 54 34 46 Q 32 34 44 40 Q 46 34 50 38 Z"/>' +
    '<circle cx="22" cy="30" r="3.2"/><circle cx="80" cy="24" r="2.4"/><circle cx="88" cy="74" r="3"/>' +
    '<circle cx="16" cy="66" r="2"/><circle cx="66" cy="12" r="1.8"/><circle cx="30" cy="86" r="2.6"/>' +
    '<path d="M70 40 L 84 28 L 76 42 Z"/><path d="M34 60 L 16 58 L 32 66 Z"/>' +
    '</g></svg>';

  const flora = document.getElementById("floraBg");
  const blooms = [];
  for (let i = 0; i < 6; i++) blooms.push(ROSE_SVG);
  for (let i = 0; i < 5; i++) blooms.push(LILY_SVG);
  for (let i = 0; i < 4; i++) blooms.push(SPLAT_SVG);
  blooms.forEach(function (svg) {
    const wrap = document.createElement("div");
    wrap.innerHTML = svg;
    const el = wrap.firstChild;
    const isSplat = el.classList.contains("splat-svg");
    const size = (isSplat ? 40 : 60) + Math.random() * (isSplat ? 60 : 100);
    el.style.width = size + "px";
    el.style.height = size + "px";
    // 中央の文章を避けて左右の帯に散らす
    const leftBand = Math.random() < 0.5;
    el.style.left = (leftBand ? Math.random() * 20 : 80 + Math.random() * 16) + "vw";
    el.style.top = Math.random() * 92 + "vh";
    el.style.opacity = (isSplat ? 0.1 + Math.random() * 0.12 : 0.28 + Math.random() * 0.3).toFixed(2);
    el.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
    flora.appendChild(el);
  });

  render(today);
})();
