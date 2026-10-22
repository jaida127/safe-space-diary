/**
 * GARDEN.JS — My Little Garden 🌱 (Safe Space ♡)
 * สวนเล็กๆ ที่เติบโตตามกิจกรรมของผู้ใช้: เขียน journal, check-in mood, เขียนจดหมาย
 * มี streak tracker และ milestones
 */

const GardenApp = {
  // ข้อมูลกิจกรรมทั้งหมด
  stats: {
    totalJournals: 0,
    totalMoods: 0,
    totalLetters: 0,
    totalPhotos: 0,
    totalActiveDays: 0,
    currentStreak: 0,
    bestStreak: 0,
    gardenLevel: 1
  },

  // Milestone ทั้งหมด
  milestonesDef: [
    { id: 'm5',   count: 5,   label: 'ปลูกดอกไม้ 5 ดอก 🌸', emoji: '🌸' },
    { id: 'm10',  count: 10,  label: 'สวนเริ่มเบ่งบาน 🌷', emoji: '🌷' },
    { id: 'm25',  count: 25,  label: 'สวนสวยมาก! 🌻', emoji: '🌻' },
    { id: 'm50',  count: 50,  label: 'สวนอุดมสมบูรณ์ 🌺', emoji: '🌺' },
    { id: 'm100', count: 100, label: 'สวนมหัศจรรย์ ✨🏡', emoji: '🏡' }
  ],

  // เริ่มต้นระบบ
  init() {
    this.calculateStats();
    this.renderGarden();
    this.renderStreak();
    this.renderActivityStats();
    this.renderMilestones();
  },

  // -------------------------------------------------------------------------
  // คำนวณสถิติจากข้อมูลทั้งหมดใน localStorage
  // -------------------------------------------------------------------------
  calculateStats() {
    // ดึงข้อมูลจาก Storage
    const journals = Storage.get('journal_entries', []);
    const moods = Storage.get('mood_entries', []);
    const letters = Storage.get('letters', []);
    const moments = Storage.get('moments', []);

    this.stats.totalJournals = journals.length;
    this.stats.totalMoods = moods.length;
    this.stats.totalLetters = letters.length;

    // นับรูปภาพทั้งหมด (จาก journals + moments)
    let photoCount = 0;
    journals.forEach(j => { if (j.photos) photoCount += j.photos.length; });
    photoCount += moments.length;
    this.stats.totalPhotos = photoCount;

    // รวบรวมวันที่มีกิจกรรม (unique dates)
    const activeDatesSet = new Set();

    journals.forEach(j => {
      if (j.date) activeDatesSet.add(j.date);
      else if (j.createdAt) activeDatesSet.add(new Date(j.createdAt).toISOString().split('T')[0]);
    });

    moods.forEach(m => {
      if (m.date) activeDatesSet.add(m.date);
      else if (m.createdAt) activeDatesSet.add(new Date(m.createdAt).toISOString().split('T')[0]);
    });

    letters.forEach(l => {
      if (l.dateWritten) activeDatesSet.add(l.dateWritten);
    });

    this.stats.totalActiveDays = activeDatesSet.size;

    // คำนวณ Streak
    this.calculateStreak(activeDatesSet);

    // คำนวณ Garden Level
    const totalActivity = this.stats.totalJournals + this.stats.totalMoods + this.stats.totalLetters;
    if (totalActivity >= 100) this.stats.gardenLevel = 5;
    else if (totalActivity >= 50) this.stats.gardenLevel = 4;
    else if (totalActivity >= 25) this.stats.gardenLevel = 3;
    else if (totalActivity >= 10) this.stats.gardenLevel = 2;
    else this.stats.gardenLevel = 1;
  },

  // คำนวณ Streak (วันติดต่อกันที่มีกิจกรรม)
  calculateStreak(activeDatesSet) {
    if (activeDatesSet.size === 0) {
      this.stats.currentStreak = 0;
      this.stats.bestStreak = 0;
      return;
    }

    // เรียงวันที่จากเก่าสุดไปใหม่สุด
    const sortedDates = [...activeDatesSet].sort();

    // คำนวณ best streak
    let bestStreak = 1;
    let currentRun = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentRun++;
        bestStreak = Math.max(bestStreak, currentRun);
      } else {
        currentRun = 1;
      }
    }

    this.stats.bestStreak = bestStreak;

    // คำนวณ current streak (นับจากวันนี้ย้อนกลับ)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // เช็คว่าวันล่าสุดที่มีกิจกรรมเป็นวันนี้หรือเมื่อวาน
    const lastDate = sortedDates[sortedDates.length - 1];
    if (lastDate !== today && lastDate !== yesterday) {
      this.stats.currentStreak = 0;
      return;
    }

    // นับย้อนกลับจากวันล่าสุด
    let streak = 1;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const curr = new Date(sortedDates[i + 1]);
      const prev = new Date(sortedDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    this.stats.currentStreak = streak;
  },

  // -------------------------------------------------------------------------
  // เรนเดอร์สวน (ต้นไม้/ดอกไม้)
  // -------------------------------------------------------------------------
  renderGarden() {
    const ground = document.getElementById('garden-ground');
    const levelBadge = document.getElementById('garden-level');
    if (!ground) return;

    // อัปเดต Level
    if (levelBadge) {
      levelBadge.textContent = `🌱 Level ${this.stats.gardenLevel} Garden`;
    }

    const totalActivity = this.stats.totalJournals + this.stats.totalMoods + this.stats.totalLetters;

    // ถ้าไม่มีกิจกรรมเลย แสดง empty state
    if (totalActivity === 0) {
      ground.innerHTML = `
        <div class="garden-empty-msg">
          <div class="empty-icon">🌱</div>
          <p>สวนของคุณยังว่างเปล่า...<br>เริ่มเขียน Journal เพื่อปลูกดอกไม้แรกกันเถอะ!</p>
        </div>
      `;
      return;
    }

    // สร้างต้นไม้ตามประเภทกิจกรรม
    const plants = [];

    // Journal → ดอกไม้
    const flowerEmojis = ['🌸', '🌼', '🌷', '🌺', '💐', '🌻'];
    for (let i = 0; i < Math.min(this.stats.totalJournals, 30); i++) {
      plants.push(flowerEmojis[i % flowerEmojis.length]);
    }

    // Mood check-in → ใบไม้
    const leafEmojis = ['🌿', '🍀', '🍃', '☘️'];
    for (let i = 0; i < Math.min(this.stats.totalMoods, 20); i++) {
      plants.push(leafEmojis[i % leafEmojis.length]);
    }

    // Letters → ทิวลิป
    const letterEmojis = ['🌷', '💮', '🪻'];
    for (let i = 0; i < Math.min(this.stats.totalLetters, 10); i++) {
      plants.push(letterEmojis[i % letterEmojis.length]);
    }

    // จำกัดจำนวนไม่ให้รกเกินไป
    const visiblePlants = plants.slice(0, 40);

    ground.innerHTML = visiblePlants.map((emoji, i) => `
      <div class="garden-plant" style="animation-delay: ${(i * 0.3) % 4}s;">
        <span class="plant-emoji">${emoji}</span>
        <span class="plant-dot"></span>
      </div>
    `).join('');
  },

  // -------------------------------------------------------------------------
  // เรนเดอร์ Streak
  // -------------------------------------------------------------------------
  renderStreak() {
    const streakCard = document.getElementById('streak-card');
    const streakNum = document.getElementById('streak-number');
    const bestStreakEl = document.getElementById('best-streak');
    const activeDaysEl = document.getElementById('active-days');

    if (streakNum) streakNum.textContent = this.stats.currentStreak;
    if (bestStreakEl) bestStreakEl.textContent = this.stats.bestStreak;
    if (activeDaysEl) activeDaysEl.textContent = this.stats.totalActiveDays;

    // เพิ่ม glow ถ้ามี streak
    if (streakCard && this.stats.currentStreak > 0) {
      streakCard.classList.add('has-streak');
    }
  },

  // -------------------------------------------------------------------------
  // เรนเดอร์ Activity Stats
  // -------------------------------------------------------------------------
  renderActivityStats() {
    const el = (id) => document.getElementById(id);
    if (el('stat-journals')) el('stat-journals').textContent = this.stats.totalJournals;
    if (el('stat-moods')) el('stat-moods').textContent = this.stats.totalMoods;
    if (el('stat-letters')) el('stat-letters').textContent = this.stats.totalLetters;
    if (el('stat-photos')) el('stat-photos').textContent = this.stats.totalPhotos;
  },

  // -------------------------------------------------------------------------
  // เรนเดอร์ Milestones
  // -------------------------------------------------------------------------
  renderMilestones() {
    const container = document.getElementById('milestones-list');
    if (!container) return;

    const totalActivity = this.stats.totalJournals + this.stats.totalMoods + this.stats.totalLetters;

    container.innerHTML = this.milestonesDef.map(m => {
      const achieved = totalActivity >= m.count;
      return `
        <div class="milestone-item ${achieved ? 'achieved' : 'locked'}">
          <span>${achieved ? m.emoji : '🔒'}</span>
          <span>${m.label}</span>
          ${achieved ? '<span>✓</span>' : `<span>(${totalActivity}/${m.count})</span>`}
        </div>
      `;
    }).join('');
  }
};

// เริ่มต้นเมื่อหน้าโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => GardenApp.init());
