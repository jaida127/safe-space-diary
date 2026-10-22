/**
 * CALENDAR.JS - Safe Space ♡
 * จัดการระบบปฏิทินรายวัน แสดงอารมณ์ เพลง และบันทึก Journal
 */

const CalendarApp = {
  currentDate: new Date(),
  selectedDate: null,

  init() {
    this.bindEvents();
    this.renderCalendar();
  },

  bindEvents() {
    const prevBtn = document.getElementById('btn-prev-month');
    const nextBtn = document.getElementById('btn-next-month');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
      });
    }
  },

  goToToday() {
    this.currentDate = new Date();
    this.renderCalendar();
  },

  formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // ชื่อเดือน
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthNamesThai = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const labelEl = document.getElementById('cal-month-label');
    if (labelEl) {
      labelEl.innerHTML = `
        <span class="cal-month-title">${monthNames[month]}</span>
        <span class="cal-year-badge">${year} · ${monthNamesThai[month]}</span>
      `;
    }

    const gridEl = document.getElementById('cal-grid');
    if (!gridEl) return;

    // คำนวณวันแรกของเดือนและจำนวนวัน
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // ดึงข้อมูล Journal ทั้งหมด
    const entries = Storage.get('journal_entries', []);
    const todayKey = this.formatDateKey(new Date());

    let html = '';

    // วันของเดือนก่อนหน้า (Padding)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      html += `
        <div class="cal-day-cell other-month">
          <div class="cal-day-header">
            <span class="cal-day-num">${dayNum}</span>
          </div>
        </div>
      `;
    }

    // วันในเดือนปัจจุบัน
    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(year, month, day);
      const dateKey = this.formatDateKey(cellDate);
      const isToday = (dateKey === todayKey);

      // ดึง Mood ของวันนั้น (จาก storage mood หรือจาก journal entry)
      const storedMood = Storage.get(`mood_${dateKey}`, null);
      const dayEntries = entries.filter(e => e.date === dateKey);

      let moodBadgeHtml = '';
      if (storedMood && storedMood.mood) {
        const moodEmojiMap = {
          happy: '😊', calm: '😌', loved: '🥰', peaceful: '🤍',
          tired: '😴', emotional: '🥹', sad: '😔', frustrated: '😤'
        };
        const emoji = moodEmojiMap[storedMood.mood] || '🌷';
        moodBadgeHtml = `<span class="cal-mood-pill"><span>${emoji}</span><span>${storedMood.mood}</span></span>`;
      } else if (dayEntries.length > 0 && dayEntries[0].moodEmoji) {
        moodBadgeHtml = `<span class="cal-mood-pill"><span>${dayEntries[0].moodEmoji}</span><span>${dayEntries[0].mood || ''}</span></span>`;
      }

      // ดึง Journal / Photos indicator
      let entryIndicatorHtml = '';
      if (dayEntries.length > 0) {
        const hasPhoto = dayEntries.some(e => e.photos && e.photos.length > 0);
        entryIndicatorHtml = `
          <div class="cal-entry-dot-row">
            <span>📖 ${dayEntries.length}</span>
            ${hasPhoto ? '<span>📸</span>' : ''}
          </div>
        `;
      }

      html += `
        <div class="cal-day-cell ${isToday ? 'is-today' : ''}" onclick="CalendarApp.openDayDetail('${dateKey}')">
          <div class="cal-day-header">
            <span class="cal-day-num">${day}</span>
            ${isToday ? '<span style="font-size:0.7rem; color:var(--accent);">♡</span>' : ''}
          </div>
          <div class="cal-day-badges">
            ${moodBadgeHtml}
            ${entryIndicatorHtml}
          </div>
        </div>
      `;
    }

    gridEl.innerHTML = html;
  },

  openDayDetail(dateKey) {
    this.selectedDate = dateKey;
    const overlay = document.getElementById('day-detail-overlay');
    if (!overlay) return;

    const dateObj = new Date(dateKey + 'T00:00:00');
    const dateFormatted = dateObj.toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const dateHeaderEl = document.getElementById('dd-date');
    if (dateHeaderEl) {
      dateHeaderEl.innerHTML = `📅 ${dateFormatted}`;
    }

    // 1. ตรวจสอบ Mood
    const storedMood = Storage.get(`mood_${dateKey}`, null);
    const moodSection = document.getElementById('dd-mood-section');
    const moodDisplay = document.getElementById('dd-mood-display');

    if (storedMood && storedMood.mood) {
      const moodEmojiMap = {
        happy: '😊 Happy', calm: '😌 Calm', loved: '🥰 Loved', peaceful: '🤍 Peaceful',
        tired: '😴 Tired', emotional: '🥹 Emotional', sad: '😔 Sad', frustrated: '😤 Frustrated'
      };
      moodSection.style.display = 'block';
      moodDisplay.innerHTML = `
        <div class="dd-mood-card">
          <div class="dd-mood-name">${moodEmojiMap[storedMood.mood] || storedMood.mood}</div>
          ${storedMood.note ? `<div class="dd-mood-note">“${storedMood.note}”</div>` : ''}
        </div>
      `;
    } else {
      moodSection.style.display = 'none';
    }

    // 2. ตรวจสอบ เพลง
    const storedSong = Storage.get(`song_${dateKey}`, null);
    const songSection = document.getElementById('dd-song-section');
    const songDisplay = document.getElementById('dd-song-display');

    if (storedSong && storedSong.title) {
      songSection.style.display = 'block';
      songDisplay.innerHTML = `
        <div class="dd-song-card">
          <span>🎧</span>
          <strong>${storedSong.title}</strong>
          ${storedSong.artist ? `<span>— ${storedSong.artist}</span>` : ''}
          ${storedSong.feeling ? `<span style="color:var(--text-muted); font-size:0.8rem;">(${storedSong.feeling})</span>` : ''}
        </div>
      `;
    } else {
      songSection.style.display = 'none';
    }

    // 3. ตรวจสอบ Journal
    const entries = Storage.get('journal_entries', []);
    const dayEntries = entries.filter(e => e.date === dateKey);
    const journalSection = document.getElementById('dd-journal-section');
    const journalList = document.getElementById('dd-journal-list');
    const emptyState = document.getElementById('dd-empty');

    if (dayEntries.length > 0) {
      journalSection.style.display = 'block';
      journalList.innerHTML = dayEntries.map(e => `
        <div class="dd-journal-card">
          <div class="dd-journal-title">${e.title || 'Untitled'}</div>
          <div class="dd-journal-snippet">${e.snippet || ''}</div>
          <a href="journal.html" class="btn btn-sm btn-outline" style="font-size:0.8rem;">📖 เปิดอ่านใน Journal</a>
        </div>
      `).join('');
    } else {
      journalSection.style.display = 'none';
    }

    // หากไม่มีอะไรบันทึกเลย
    if (!storedMood && !storedSong && dayEntries.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }

    overlay.style.display = 'flex';
  },

  closeDayDetail(event, forceClose = false) {
    if (forceClose || (event && event.target && event.target.id === 'day-detail-overlay')) {
      const overlay = document.getElementById('day-detail-overlay');
      if (overlay) overlay.style.display = 'none';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CalendarApp.init();
});
