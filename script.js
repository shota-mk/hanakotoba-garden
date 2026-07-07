(function () {
  const WEEKDAYS_EN = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const MONTHS_EN = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const MAX_RESULTS = 20;

  const hero = document.getElementById("hero");
  const picker = document.getElementById("datePick");
  const today = new Date();

  function keyOf(date) {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return m + "-" + d;
  }

  // うるう年基準の通し番号（No.xxx / 366）
  function dayIndex(date) {
    const cum = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    return cum[date.getMonth()] + date.getDate();
  }

  function render(date, animate) {
    const entry = window.HANAKOTOBA[keyOf(date)];
    if (!entry) return;

    const fill = function () {
      document.getElementById("dateEn").textContent = MONTHS_EN[date.getMonth()];
      document.getElementById("dateNum").textContent = String(date.getDate()).padStart(2, "0");
      document.getElementById("dateMeta").textContent = WEEKDAYS_EN[date.getDay()] + " — " + date.getFullYear();
      const idx = dayIndex(date);
      document.getElementById("specimen").textContent = "No." + String(idx).padStart(3, "0") + " / 366";
      document.getElementById("yearDot").style.left = "calc(" + ((idx / 366) * 100).toFixed(1) + "% - 3px)";
      document.getElementById("flowerName").textContent = entry.flower;
      document.getElementById("flowerMeaning").textContent = entry.meaning;
      document.getElementById("flowerMessage").textContent = entry.message;

      // マーキー（同じ帯を2セット並べて無限に流す）
      const unit = entry.flower + '<span class="sep">✳</span>' +
        entry.meaning + '<span class="sep">✳</span>' +
        'HANAKOTOBA DAILY<span class="sep">✳</span>';
      document.getElementById("marqueeTrack").innerHTML =
        "<span>" + unit.repeat(4) + "</span><span>" + unit.repeat(4) + "</span>";
    };

    if (animate) {
      hero.classList.add("is-fading");
      setTimeout(function () {
        fill();
        hero.classList.remove("is-fading");
      }, 460);
    } else {
      fill();
    }
  }

  function setPicker(date) {
    picker.value = date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  /* ---- 日付から ---- */
  setPicker(today);
  picker.addEventListener("change", function () {
    if (!picker.value) return;
    const [y, m, d] = picker.value.split("-").map(Number);
    render(new Date(y, m - 1, d), true);
  });
  document.getElementById("todayBtn").addEventListener("click", function () {
    const now = new Date();
    setPicker(now);
    render(now, true);
  });

  /* ---- 花・花言葉から ---- */
  const searchInput = document.getElementById("flowerSearch");
  const resultsList = document.getElementById("searchResults");
  const datalist = document.getElementById("flowerList");

  const uniqueFlowers = new Set();
  Object.values(window.HANAKOTOBA).forEach(function (e) { uniqueFlowers.add(e.flower); });
  Array.from(uniqueFlowers).sort().forEach(function (name) {
    const opt = document.createElement("option");
    opt.value = name;
    datalist.appendChild(opt);
  });

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
      li.textContent = "NOT FOUND — 別の言葉でお試しください";
      resultsList.appendChild(li);
      return;
    }

    hits.slice(0, MAX_RESULTS).forEach(function (hit) {
      const [m, d] = hit.key.split("-").map(Number);
      const date = new Date(today.getFullYear(), m - 1, d);
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML =
        '<span class="r-no">No.' + String(dayIndex(date)).padStart(3, "0") + "</span>" +
        '<span class="r-date">' + m + "月" + d + "日</span>" +
        '<span class="r-flower">' + hit.entry.flower + "</span>" +
        '<span class="r-meaning">' + hit.entry.meaning + "</span>";
      btn.addEventListener("click", function () {
        setPicker(date);
        render(date, true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      li.appendChild(btn);
      resultsList.appendChild(li);
    });

    if (hits.length > MAX_RESULTS) {
      const li = document.createElement("li");
      li.className = "search-note";
      li.textContent = "+ " + (hits.length - MAX_RESULTS) + " MORE — 言葉を足すと絞り込めます";
      resultsList.appendChild(li);
    }
  }

  searchInput.addEventListener("input", function () { search(searchInput.value); });

  render(today, false);
})();
