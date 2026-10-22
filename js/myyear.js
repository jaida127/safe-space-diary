/**
 * MYYEAR.JS — My Year Recap 📊 (Safe Space ♡)
 * สรุปปีของคุณ: mood summary, journal stats, top tags, top songs, activity heatmap
 */

const MyYearApp = {
  currentYear: new Date().getFullYear(),

  // สีของแต่ละ mood
  moodColors: {
    happy: '#ff9eb5',
    calm: '#aad4f5',
    hopeful: '#c3aee8',
    anxious: '#ffe5a0',
    sad: '#ffb3a0',
    tired: '#d4d4d4',
    grateful: '#b5e8c8'
  },

  moodEmojis: {
    happy: '😊', calm: '😌', hopeful: '🌈',
    anxious: '😰', sad: '🥺', tired: '😴', grateful: '🙏'
  },

  init() {
    this.render();
    this.bindEvents();
  },

  // -------------------------------------------------------------------------
  // ดึงข้อมูลเฉพาะปีที่เลือก
  // -------------------------------------------------------------------------
  getYearData() {
    const year = this.currentYear;
    const journals = Storage.get('journal_entries', []).filter(j => {
      const d = j.date || (j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : null);
      return d && d.startsWith(year.toString());
    });

    const moods = Storage.get('mood_entries', []).filter(m => {
      const d = m.date || (m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : null);
      return d && d.startsWith(year.toString());
    });

    const letters = Storage.get('letters', []).filter(l => {
      return l.dateWritten && l.dateWritten.startsWith(year.toString());
    });

    return { journals, moods, letters };
  },

  // -------------------------------------------------------------------------
  // เรนเดอร์ทั้งหน้า
  // -------------------------------------------------------------------------
  render() {
    // อัปเดตปีที่แสดง
    const yearLabel = document.getElementById('year-label');
    if (yearLabel) yearLabel.textContent = `📅 ${this.currentYear}`;

    const { journals, moods, letters } = this.getYearData();
    const totalData = journals.length + moods.length + letters.length;

    const container = document.getElementById('year-content');
    if (!container) return;

    if (totalData === 0) {
      container.innerHTML = `
        <div class="year-empty">
          <div class="year-empty-icon">📝</div>
          <p>ปี ${this.currentYear} ยังไม่มีข้อมูล...<br>เริ่มเขียน Journal กันเถอะ!</p>
        </div>
      `;
      return;
    }

    // สร้าง HTML ทีละส่วน
    let html = '';
    html += this.buildMoodSummary(journals, moods);
    html += this.buildJournalStats(journals);
    html += this.buildTopTags(journals);
    html += this.buildTopSongs(journals);
    html += this.buildHeatmap(journals, moods, letters);

    container.innerHTML = html;
  },

  // -------------------------------------------------------------------------
  // 1. MOOD SUMMARY — โดนัทชาร์ต + breakdown bars
  // -------------------------------------------------------------------------
  buildMoodSummary(journals, moods) {
    // รวม mood จากทั้ง journals และ mood entries
    const moodCounts = {};
    journals.forEach(j => { if (j.mood) moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1; });
    moods.forEach(m => { if (m.mood) moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });

    const total = Object.values(moodCounts).reduce((s, v) => s + v, 0);
    if (total === 0) return '';

    // เรียงจากมากไปน้อย
    const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const topMood = sorted[0][0];

    // สร้าง conic-gradient สำหรับ donut
    let gradientParts = [];
    let cumPct = 0;
    sorted.forEach(([mood, count]) => {
      const pct = (count / total) * 100;
      const color = this.moodColors[mood] || '#ddd';
      gradientParts.push(`${color} ${cumPct}% ${cumPct + pct}%`);
      cumPct += pct;
    });
    const gradient = `conic-gradient(${gradientParts.join(', ')})`;

    // Breakdown bars
    const barsHtml = sorted.map(([mood, count]) => {
      const pct = Math.round((count / total) * 100);
      const color = this.moodColors[mood] || '#ddd';
      const emoji = this.moodEmojis[mood] || '🌷';
      return `
        <div class="mood-breakdown-item">
          <span class="mood-bar-label">${emoji} ${mood}</span>
          <div class="mood-bar-track">
            <div class="mood-bar-fill" style="width:${pct}%; background:${color};"></div>
          </div>
          <span class="mood-bar-pct">${pct}%</span>
        </div>
      `;
    }).join('');

    return `
      <div class="recap-card">
        <div class="washi-tape"></div>
        <div class="recap-card-title">🌸 Mood Summary</div>
        <div class="mood-recap-container">
          <div class="mood-donut" style="background: ${gradient};">
            <div class="mood-donut-center">
              <span class="top-emoji">${this.moodEmojis[topMood] || '🌷'}</span>
              <span class="top-label">${topMood}</span>
            </div>
          </div>
          <div class="mood-breakdown">
            ${barsHtml}
          </div>
        </div>
      </div>
    `;
  },

  // -------------------------------------------------------------------------
  // 2. JOURNAL STATS — total, avg/month, most productive month, monthly bars
  // -------------------------------------------------------------------------
  buildJournalStats(journals) {
    if (journals.length === 0) return '';

    const total = journals.length;
    const avg = (total / 12).toFixed(1);

    // นับจำนวน journal ต่อเดือน
    const monthlyCounts = new Array(12).fill(0);
    journals.forEach(j => {
      const d = j.date || (j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : null);
      if (d) {
        const month = parseInt(d.split('-')[1]) - 1;
        monthlyCounts[month]++;
      }
    });

    const maxMonth = Math.max(...monthlyCounts);
    const bestMonthIndex = monthlyCounts.indexOf(maxMonth);
    const monthNames = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

    // คำนวณจำนวนคำโดยประมาณ
    let wordCount = 0;
    journals.forEach(j => {
      const text = (j.content || '').replace(/<[^>]+>/g, '');
      wordCount += text.split(/\s+/).filter(w => w.length > 0).length;
    });

    // สร้าง monthly bar chart
    const barsHtml = monthlyCounts.map((count, i) => {
      const height = maxMonth > 0 ? Math.max((count / maxMonth) * 80, count > 0 ? 6 : 0) : 0;
      return `
        <div class="monthly-bar">
          <div class="monthly-bar-fill" style="height: ${height}px;" title="${monthNames[i]}: ${count} entries"></div>
          <span class="monthly-bar-label">${monthNames[i]}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="recap-card">
        <div class="washi-tape"></div>
        <img src="assets/stickers/star.png" class="scrapbook-sticker sticker-sm sticker-corner-tr" alt="sticker">
        <div class="recap-card-title">📖 Journal Stats</div>
        <div class="journal-stats-row">
          <div class="journal-stat-item">
            <div class="journal-stat-val">${total}</div>
            <div class="journal-stat-label">บันทึกทั้งหมด</div>
          </div>
          <div class="journal-stat-item">
            <div class="journal-stat-val">${avg}</div>
            <div class="journal-stat-label">เฉลี่ย/เดือน</div>
          </div>
          <div class="journal-stat-item">
            <div class="journal-stat-val">${monthNames[bestMonthIndex]}</div>
            <div class="journal-stat-label">เดือนที่เขียนมากสุด</div>
          </div>
          <div class="journal-stat-item">
            <div class="journal-stat-val">${wordCount.toLocaleString()}</div>
            <div class="journal-stat-label">คำที่เขียน (ประมาณ)</div>
          </div>
        </div>
        <div class="monthly-chart">${barsHtml}</div>
      </div>
    `;
  },

  // -------------------------------------------------------------------------
  // 3. TOP TAGS — tag cloud
  // -------------------------------------------------------------------------
  buildTopTags(journals) {
    const tagCounts = {};
    journals.forEach(j => {
      if (j.tags) j.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    });

    const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (sorted.length === 0) return '';

    const tagsHtml = sorted.map(([tag, count]) => `
      <span class="tag-cloud-item">#${tag} <span class="tag-count">(${count})</span></span>
    `).join('');

    return `
      <div class="recap-card">
        <div class="recap-card-title">🏷️ Top Tags</div>
        <div class="tag-cloud">${tagsHtml}</div>
      </div>
    `;
  },

  // -------------------------------------------------------------------------
  // 4. TOP SONGS — playlist card
  // -------------------------------------------------------------------------
  buildTopSongs(journals) {
    const songCounts = {};
    journals.forEach(j => {
      if (j.song && j.song.title) {
        const key = `${j.song.title}|||${j.song.artist || ''}`;
        songCounts[key] = (songCounts[key] || 0) + 1;
      }
    });

    const sorted = Object.entries(songCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (sorted.length === 0) return '';

    const listHtml = sorted.map(([key, count], i) => {
      const [title, artist] = key.split('|||');
      return `
        <li class="playlist-item">
          <span class="playlist-rank">${i + 1}</span>
          <div class="playlist-info">
            <div class="playlist-title">🎵 ${title}</div>
            ${artist ? `<div class="playlist-artist">${artist}</div>` : ''}
          </div>
          <span class="playlist-count">×${count}</span>
        </li>
      `;
    }).join('');

    return `
      <div class="recap-card">
        <img src="assets/stickers/headphones.png" class="scrapbook-sticker sticker-sm sticker-corner-tr" alt="sticker">
        <div class="recap-card-title">🎵 Most Played Songs</div>
        <ul class="playlist-list">${listHtml}</ul>
      </div>
    `;
  },

  // -------------------------------------------------------------------------
  // 5. ACTIVITY HEATMAP — year at a glance
  // -------------------------------------------------------------------------
  buildHeatmap(journals, moods, letters) {
    // รวมวันที่ทั้งหมดพร้อมนับจำนวนกิจกรรม
    const dayCounts = {};

    journals.forEach(j => {
      const d = j.date || (j.createdAt ? new Date(j.createdAt).toISOString().split('T')[0] : null);
      if (d) dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
    moods.forEach(m => {
      const d = m.date || (m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : null);
      if (d) dayCounts[d] = (dayCounts[d] || 0) + 1;
    });
    letters.forEach(l => {
      if (l.dateWritten) dayCounts[l.dateWritten] = (dayCounts[l.dateWritten] || 0) + 1;
    });

    const monthNames = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

    let monthsHtml = '';
    for (let m = 0; m < 12; m++) {
      const daysInMonth = new Date(this.currentYear, m + 1, 0).getDate();
      let daysHtml = '';
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${this.currentYear}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const count = dayCounts[dateStr] || 0;
        let level = '';
        if (count >= 4) level = 'level-4';
        else if (count >= 3) level = 'level-3';
        else if (count >= 2) level = 'level-2';
        else if (count >= 1) level = 'level-1';
        daysHtml += `<div class="heatmap-day ${level}" title="${dateStr}: ${count}"></div>`;
      }

      monthsHtml += `
        <div class="heatmap-month">
          <div class="heatmap-month-name">${monthNames[m]}</div>
          <div class="heatmap-days">${daysHtml}</div>
        </div>
      `;
    }

    return `
      <div class="recap-card">
        <div class="washi-tape"></div>
        <img src="assets/stickers/moon.png" class="scrapbook-sticker sticker-sm sticker-corner-tr" alt="sticker">
        <div class="recap-card-title">📅 Year at a Glance</div>
        <div class="heatmap-months">${monthsHtml}</div>
      </div>
    `;
  },

  // -------------------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------------------
  bindEvents() {
    const btnPrev = document.getElementById('btn-prev-year');
    const btnNext = document.getElementById('btn-next-year');

    if (btnPrev) btnPrev.addEventListener('click', () => {
      this.currentYear--;
      this.render();
    });

    if (btnNext) btnNext.addEventListener('click', () => {
      this.currentYear++;
      this.render();
    });
  }
};

// เริ่มต้นเมื่อหน้าโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => MyYearApp.init());
