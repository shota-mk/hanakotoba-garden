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

  // 彫刻風・茎の長い一輪の薔薇
  const STEM_ROSE_SVG =
    '<svg class="stem-rose-svg" viewBox="0 0 120 260" xmlns="http://www.w3.org/2000/svg">' +
    '<g fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    // 花：外側の波打つ花びら
    '<path d="M60 16 A 13 13 0 0 1 76 24 A 13 13 0 0 1 85 40 A 13 13 0 0 1 78 57 A 13 13 0 0 1 61 67 A 13 13 0 0 1 44 59 A 13 13 0 0 1 35 42 A 13 13 0 0 1 43 25 A 13 13 0 0 1 60 16 Z" fill="#0a0a0a"/>' +
    // 花：中間の花びら
    '<path d="M60 25 A 9 9 0 0 1 72 31 A 9 9 0 0 1 77 43 A 9 9 0 0 1 71 55 A 9 9 0 0 1 59 60 A 9 9 0 0 1 47 54 A 9 9 0 0 1 43 42 A 9 9 0 0 1 49 30 A 9 9 0 0 1 60 25 Z"/>' +
    // 花：渦を巻く中心
    '<path d="M60 42 m-4 0 a4 4 0 1 1 4 4 a7 7 0 1 0 -7 -7 a10 10 0 1 1 10 10" stroke-width="1.7"/>' +
    // 花びらの折り返し
    '<path d="M76 24 Q 69 31 66 28 M85 40 Q 76 43 76 39 M78 57 Q 71 52 74 49 M44 59 Q 49 52 52 55" stroke-width="1.5"/>' +
    // がく
    '<path d="M52 64 Q 45 76 38 84 Q 49 79 55 70 Z" fill="#0a0a0a"/>' +
    '<path d="M68 64 Q 75 76 82 84 Q 71 79 65 70 Z" fill="#0a0a0a"/>' +
    '<path d="M60 67 Q 59 78 56 86 Q 64 78 63 69 Z" fill="#0a0a0a"/>' +
    // 茎
    '<path d="M60 68 C 56 104, 66 146, 58 200 C 55 224, 61 242, 58 256" stroke-width="2.6"/>' +
    // とげ
    '<path d="M59 104 L 51 99 L 60 112 Z" fill="' + INK + '" stroke-width="1"/>' +
    '<path d="M62 152 L 70 148 L 62 160 Z" fill="' + INK + '" stroke-width="1"/>' +
    // 左の葉
    '<path d="M59 126 Q 46 122 34 127 M34 127 Q 18 122 8 133 Q 17 147 32 142 Q 38 134 34 127 Z"/>' +
    '<path d="M33 129 L 12 136 M28 131 L 26 139 M21 132 L 19 138" stroke-width="1.4"/>' +
    // 右の葉
    '<path d="M61 168 Q 74 165 86 170 M86 170 Q 102 166 112 177 Q 102 190 88 184 Q 82 176 86 170 Z"/>' +
    '<path d="M87 172 L 108 180 M92 174 L 94 182 M99 176 L 101 182" stroke-width="1.4"/>' +
    // 左下の葉
    '<path d="M58 206 Q 47 204 37 210 M37 210 Q 23 207 14 218 Q 24 230 37 224 Q 42 216 37 210 Z"/>' +
    '<path d="M36 212 L 18 221 M31 214 L 30 221" stroke-width="1.4"/>' +
    '</g></svg>';

  const flora = document.getElementById("floraBg");

  // 左右に大きく一輪ずつ、彫刻のように配置
  [
    { left: "1vw",  top: "16vh", h: 52, rot: -7 },
    { left: "86vw", top: "38vh", h: 56, rot: 8 }
  ].forEach(function (pos) {
    const wrap = document.createElement("div");
    wrap.innerHTML = STEM_ROSE_SVG;
    const el = wrap.firstChild;
    el.style.height = pos.h + "vh";
    el.style.width = (pos.h * 120 / 260) + "vh";
    el.style.left = pos.left;
    el.style.top = pos.top;
    el.style.opacity = "0.55";
    el.style.zIndex = "2";
    el.style.transform = "rotate(" + pos.rot + "deg)";
    flora.appendChild(el);
  });

  const blooms = [];
  for (let i = 0; i < 4; i++) blooms.push(ROSE_SVG);
  for (let i = 0; i < 4; i++) blooms.push(LILY_SVG);
  for (let i = 0; i < 4; i++) blooms.push(SPLAT_SVG);
  blooms.forEach(function (svg) {
    const wrap = document.createElement("div");
    wrap.innerHTML = svg;
    const el = wrap.firstChild;
    const isSplat = el.classList.contains("splat-svg");
    const size = (isSplat ? 36 : 44) + Math.random() * (isSplat ? 46 : 66);
    el.style.width = size + "px";
    el.style.height = size + "px";
    // 中央の文章を避けて画面の端に細く散らす
    const leftBand = Math.random() < 0.5;
    el.style.left = (leftBand ? Math.random() * 10 : 90 + Math.random() * 8) + "vw";
    el.style.top = Math.random() * 92 + "vh";
    el.style.opacity = (isSplat ? 0.08 + Math.random() * 0.1 : 0.16 + Math.random() * 0.18).toFixed(2);
    el.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
    flora.appendChild(el);
  });

  render(today);
})();
