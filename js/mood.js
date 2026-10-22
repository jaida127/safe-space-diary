/**
 * MOOD.JS - Safe Space ♡
 * จัดการระบบ Mood Tracker สถิติอารมณ์ และข้อคิดกำลังใจแสนอบอุ่น
 */

const MoodApp = {
  selectedMood: null,

  init() {
    this.renderStats();
    this.renderMatrix();
    this.renderBreakdown();
    this.renderInsights();
    this.initQuickCheckin();
  },

  getAllMoodRecords() {
    const records = [];
    const keys = Object.keys(localStorage);

    // 1. ดึงจาก safespace_mood_YYYY-MM-DD
    keys.forEach(k => {
      if (k.startsWith('safespace_mood_')) {
        const dateKey = k.replace('safespace_mood_', '');
        try {
          const data = JSON.parse(localStorage.getItem(k));
          if (data && data.mood) {
            records.push({
              date: dateKey,
              mood: data.mood,
              note: data.note || '',
              source: 'checkin'
            });
          }
        } catch (e) {}
      }
    });

    // 2. ดึงจาก Journal entries เพิ่มเติม (ถ้ายังไม่มีในวันนั้น)
    const entries = Storage.get('journal_entries', []);
    entries.forEach(e => {
      if (e.date && e.mood && !records.some(r => r.date === e.date)) {
        records.push({
          date: e.date,
          mood: e.mood,
          note: e.title || '',
          source: 'journal'
        });
      }
    });

    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  renderStats() {
    const records = this.getAllMoodRecords();
    const totalDaysEl = document.getElementById('stat-total-days');
    const topMoodEl = document.getElementById('stat-top-mood');
    const streakEl = document.getElementById('stat-streak');

    if (totalDaysEl) {
      totalDaysEl.textContent = records.length;
    }

    if (records.length === 0) {
      if (topMoodEl) topMoodEl.textContent = '—';
      if (streakEl) streakEl.textContent = 'เริ่มก้าวแรกกัน ♡';
      return;
    }

    // คำนวณ Mood ที่บันทึกบ่อยสุด
    const counts = {};
    records.forEach(r => {
      counts[r.mood] = (counts[r.mood] || 0) + 1;
    });

    let topMood = '';
    let maxCount = 0;
    Object.keys(counts).forEach(m => {
      if (counts[m] > maxCount) {
        maxCount = counts[m];
        topMood = m;
      }
    });

    const moodEmojiMap = {
      happy: '😊 Happy',
      calm: '😌 Calm',
      loved: '🥰 Loved',
      peaceful: '🤍 Peaceful',
      tired: '😴 Tired',
      emotional: '🥹 Emotional',
      sad: '😔 Sad',
      frustrated: '😤 Frustrated'
    };

    if (topMoodEl) {
      topMoodEl.textContent = moodEmojiMap[topMood] || topMood;
    }

    if (streakEl) {
      streakEl.textContent = `${records.length} วันที่ได้ดูแลใจ`;
    }
  },

  renderMatrix() {
    const grid = document.getElementById('mood-matrix-grid');
    if (!grid) return;

    const records = this.getAllMoodRecords();
    const recordMap = {};
    records.forEach(r => { recordMap[r.date] = r; });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const moodEmojiMap = {
      happy: '😊', calm: '😌', loved: '🥰', peaceful: '🤍',
      tired: '😴', emotional: '🥹', sad: '😔', frustrated: '😤'
    };

    let html = '';
    for (let day = 1; day <= totalDays; day++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${mStr}-${dStr}`;
      const record = recordMap[dateKey];

      const emoji = record ? (moodEmojiMap[record.mood] || '🌷') : '·';
      const tooltip = record ? `${dateKey}: ${record.mood}` : `${dateKey}: ยังไม่ได้บันทึก`;

      html += `
        <div class="matrix-cell" title="${tooltip}">
          <span class="matrix-day-num">${day}</span>
          <span class="matrix-mood-emoji">${emoji}</span>
        </div>
      `;
    }

    grid.innerHTML = html;
  },

  renderBreakdown() {
    const container = document.getElementById('mood-breakdown-list');
    if (!container) return;

    const records = this.getAllMoodRecords();
    const total = records.length || 1;

    const moodDefs = [
      { id: 'happy', name: 'Happy (มีความสุข)', emoji: '😊', color: '#ff9eb5' },
      { id: 'calm', name: 'Calm (สงบ สบายใจ)', emoji: '😌', color: '#aad4f5' },
      { id: 'loved', name: 'Loved (ใจฟู มีความรัก)', emoji: '🥰', color: '#ffb3c6' },
      { id: 'peaceful', name: 'Peaceful (สงบสุข)', emoji: '🤍', color: '#d4e2d4' },
      { id: 'tired', name: 'Tired (เหนื่อยล้า)', emoji: '😴', color: '#c5d3e8' },
      { id: 'emotional', name: 'Emotional (อ่อนไหว)', emoji: '🥹', color: '#e8c5e5' },
      { id: 'sad', name: 'Sad (เศร้า หมอง)', emoji: '😔', color: '#b8c0d9' },
      { id: 'frustrated', name: 'Frustrated (หงุดหงิด)', emoji: '😤', color: '#ffd3b6' }
    ];

    const counts = {};
    records.forEach(r => {
      counts[r.mood] = (counts[r.mood] || 0) + 1;
    });

    container.innerHTML = moodDefs.map(def => {
      const count = counts[def.id] || 0;
      const pct = records.length > 0 ? Math.round((count / total) * 100) : 0;

      return `
        <div class="breakdown-item">
          <div class="breakdown-header">
            <span>${def.emoji} ${def.name}</span>
            <span><strong>${count}</strong> วัน (${pct}%)</span>
          </div>
          <div class="breakdown-bar-track">
            <div class="breakdown-bar-fill" style="width: ${pct}%; background: ${def.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderInsights() {
    const textEl = document.getElementById('gentle-insight-text');
    if (!textEl) return;

    const records = this.getAllMoodRecords();
    if (records.length === 0) {
      textEl.innerHTML = `
        ยินดีต้อนรับสู่มุมสำรวจใจนะคะ ♡ ยังไม่มีบันทึกอารมณ์เลย 
        วันนี้ลองกดเลือกความรู้สึกสักหนึ่งอย่างดูนะ ทุกอารมณ์ของคุณล้วนมีความหมายเสมอค่ะ ✨
      `;
      return;
    }

    const counts = {};
    records.forEach(r => { counts[r.mood] = (counts[r.mood] || 0) + 1; });

    let dominant = 'calm';
    let max = 0;
    Object.keys(counts).forEach(k => {
      if (counts[k] > max) { max = counts[k]; dominant = k; }
    });

    const messages = {
      happy: 'ช่วงนี้รอยยิ้มของคุณสดใสมากเลยนะคะ ✨ ขอให้เก็บบรรยากาศความสุขเล็กๆ เหล่านี้ไว้ในใจ เป็นพลังในวันถัดๆ ไปนะ ♡',
      calm: 'จิตใจของคุณดูผ่อนคลายและสงบนิ่งดีจังเลย 🌿 ความเรียบง่ายแบบนี้คือของขวัญล้ำค่าที่สุดของวันค่ะ',
      loved: 'หัวใจของคุณกำลังอบอุ่นและเต็มไปด้วยความรักนะ 🥰 อย่าลืมมอบความรักและความใจดีนี้คืนให้กับตัวเองด้วยนะคะ',
      peaceful: 'ความเงียบสงบในใจเป็นพื้นที่ที่ปลอดภัยเสมอ 🤍 หายใจเข้าลึกๆ แล้วค่อยๆ ดื่มด่ำกับช่วงเวลานี้นะคะ',
      tired: 'ช่วงนี้ดูเหมือนคุณจะใช้พลังงานไปเยอะมากเลย 😴 อย่ากดดันตัวเองนะ พักผ่อน ทานของอร่อยๆ แล้วค่อยเริ่มใหม่ค่ะ',
      emotional: 'หัวใจที่อ่อนไหวคือสัญญาณว่าคุณเป็นคนที่รับรู้ความรู้สึกได้อย่างลึกซึ้ง 🥹 ไม่เป็นไรเลยนะที่จะรู้สึกแบบนี้ กอดใจตัวเองแน่นๆ นะคะ',
      sad: 'ช่วงเวลานี้อาจจะดูยากและหน่วงไปบ้าง 😔 แต่มันจะไม่คงอยู่ตลอดไปนะ ค่อยๆ เดินไปทีละนิด คุณเก่งมากแล้วที่ผ่านมาถึงตรงนี้ได้ ♡',
      frustrated: 'มีเรื่องกวนใจและไม่เป็นไปตามหวังใช่ไหมคะ 😤 ปล่อยมันลงชั่วคราวนะ ดื่มน้ำเย็นๆ สักแก้ว แล้วใจจะค่อยๆ เบาลงค่ะ'
    };

    textEl.innerHTML = messages[dominant] || messages.calm;
  },

  initQuickCheckin() {
    const choices = document.querySelectorAll('.mood-btn-choice');
    const noteInput = document.getElementById('mood-quick-note');
    const saveBtn = document.getElementById('btn-save-quick-mood');

    const todayKey = new Date().toISOString().split('T')[0];
    const existing = Storage.get(`mood_${todayKey}`, null);

    if (existing) {
      this.selectedMood = existing.mood;
      choices.forEach(btn => {
        if (btn.dataset.mood === existing.mood) {
          btn.classList.add('active');
        }
      });
      if (noteInput && existing.note) {
        noteInput.value = existing.note;
      }
    }

    choices.forEach(btn => {
      btn.addEventListener('click', () => {
        choices.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedMood = btn.dataset.mood;
      });
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (!this.selectedMood) {
          showToast('กรุณาเลือกอารมณ์ก่อนบันทึกนะคะ ♡', '🌷');
          return;
        }

        const note = noteInput ? noteInput.value.trim() : '';
        Storage.set(`mood_${todayKey}`, {
          mood: this.selectedMood,
          note: note,
          date: todayKey
        });

        showToast('บันทึกอารมณ์วันนี้เรียบร้อยแล้วค่ะ ✨', '♡');
        this.renderStats();
        this.renderMatrix();
        this.renderBreakdown();
        this.renderInsights();
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MoodApp.init();
});
