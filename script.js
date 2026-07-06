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

  /* ---- 舞い散る花びら ---- */
  const petals = document.getElementById("petals");
  for (let i = 0; i < 16; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.style.setProperty("--x", Math.random() * 100 + "vw");
    p.style.setProperty("--size", 8 + Math.random() * 8 + "px");
    p.style.setProperty("--dur", 9 + Math.random() * 9 + "s");
    p.style.setProperty("--delay", Math.random() * 12 + "s");
    p.style.setProperty("--sway", (Math.random() * 30 - 15) + "vw");
    petals.appendChild(p);
  }

  render(today);
})();
