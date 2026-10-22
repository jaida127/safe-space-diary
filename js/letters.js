/**
 * LETTERS.JS — Dear Future Me 💌 (Safe Space ♡)
 * ระบบจดหมายถึงตัวเองในอนาคต: เขียน, อ่าน, ล็อค/ปลดล็อค, โปรด, ลบ
 */

const LettersApp = {
  letters: [],
  activeFilter: 'all', // all | unlocked | locked | favorite

  // เริ่มต้นระบบ
  init() {
    this.loadLetters();
    this.renderLetters();
    this.bindEvents();
  },

  // โหลดจดหมายจาก localStorage
  loadLetters() {
    this.letters = Storage.get('letters', [
      // ตัวอย่างจดหมายที่ล็อก (เปิดอ่านได้ปีหน้า)
      {
        id: 'letter_sample_1',
        subject: 'ถึงตัวเองในวันที่เข้มแข็งขึ้น',
        content: 'สวัสดีตัวเองในอนาคต ♡\n\nวันนี้ฉันเขียนจดหมายนี้ตอนที่กำลังรู้สึกดีมาก อยากให้รู้ว่าทุกอย่างจะโอเคนะ ไม่ว่าจะเจออะไรในอนาคต ขอให้จำไว้ว่าวันนี้เรามีความสุข\n\nรักเสมอ,\nตัวเองในวันที่ 19 ตุลาคม 2026',
        mood: 'hopeful',
        moodEmoji: '🌈',
        moodLabel: 'Hopeful',
        dateWritten: '2026-10-19',
        unlockDate: '2027-01-01',
        isImmediate: false,
        isFavorite: false,
        createdAt: Date.now()
      },
      // ตัวอย่างจดหมายที่เปิดอ่านได้เลย
      {
        id: 'letter_sample_2',
        subject: 'สิ่งเล็กๆ ที่ทำให้ยิ้มได้วันนี้',
        content: 'วันนี้ได้กินขนมปังที่ชอบ ☁️\nเห็นแมวข้างทางน่ารักมาก\nฟ้าสวยมากตอนเย็น สีส้มอมชมพู\n\nบันทึกไว้เพื่อเตือนตัวเองว่า ความสุขเล็กๆ มันมีอยู่ทุกวันนะ 🌷',
        mood: 'happy',
        moodEmoji: '😊',
        moodLabel: 'Happy',
        dateWritten: '2026-10-18',
        unlockDate: null,
        isImmediate: true,
        isFavorite: true,
        createdAt: Date.now() - 86400000
      }
    ]);
  },

  // บันทึกจดหมายลง localStorage
  saveLetters() {
    Storage.set('letters', this.letters);
  },

  // ตรวจสอบว่าจดหมายปลดล็อกแล้วหรือยัง
  isUnlocked(letter) {
    if (letter.isImmediate) return true;
    if (!letter.unlockDate) return true;
    return new Date() >= new Date(letter.unlockDate);
  },

  // กรองจดหมายตาม filter
  getFilteredLetters() {
    const now = new Date();
    return this.letters.filter(letter => {
      switch (this.activeFilter) {
        case 'unlocked':
          return this.isUnlocked(letter);
        case 'locked':
          return !this.isUnlocked(letter);
        case 'favorite':
          return letter.isFavorite;
        default:
          return true;
      }
    }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },

  // -------------------------------------------------------------------------
  // เรนเดอร์ซองจดหมายทั้งหมด
  // -------------------------------------------------------------------------
  renderLetters() {
    const grid = document.getElementById('letters-grid');
    const emptyState = document.getElementById('letters-empty');
    if (!grid) return;

    const filtered = this.getFilteredLetters();

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = filtered.map(letter => {
      const unlocked = this.isUnlocked(letter);
      const dateStr = new Date(letter.dateWritten).toLocaleDateString('th-TH', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
      const unlockStr = letter.unlockDate
        ? new Date(letter.unlockDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;

      return `
        <div class="envelope-card ${unlocked ? 'unlocked' : 'locked'}" data-id="${letter.id}">
          <div class="envelope-flap"></div>
          <div class="envelope-stamp">${letter.moodEmoji || '💌'}</div>
          ${letter.isFavorite ? '<span class="envelope-fav">♥</span>' : ''}
          <div class="envelope-body">
            <div class="envelope-subject">${letter.subject || 'ไม่มีหัวข้อ'}</div>
            <div class="envelope-meta">
              <span class="envelope-date-badge">✏️ ${dateStr}</span>
              <span class="envelope-mood-badge">${letter.moodEmoji} ${letter.moodLabel}</span>
            </div>
            <div class="envelope-lines">
              <div class="envelope-line"></div>
              <div class="envelope-line"></div>
              <div class="envelope-line"></div>
            </div>
          </div>
          ${!unlocked && unlockStr ? `
            <div class="envelope-lock-badge">🔒 เปิดได้ ${unlockStr}</div>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  // -------------------------------------------------------------------------
  // เปิด Modal เขียนจดหมายใหม่
  // -------------------------------------------------------------------------
  openWriteModal() {
    const modal = document.getElementById('write-letter-modal');
    if (!modal) return;

    // รีเซ็ตฟอร์ม
    document.getElementById('letter-subject').value = '';
    document.getElementById('letter-content').value = '';
    document.getElementById('letter-unlock-date').value = '';
    document.getElementById('letter-immediate').checked = false;
    document.getElementById('letter-unlock-date').disabled = false;

    // รีเซ็ต mood
    document.querySelectorAll('#write-letter-modal .letter-mood-option').forEach(el => {
      el.classList.remove('selected');
    });
    this.selectedMood = null;

    modal.classList.add('active');
  },

  closeWriteModal() {
    const modal = document.getElementById('write-letter-modal');
    if (modal) modal.classList.remove('active');
  },

  // -------------------------------------------------------------------------
  // บันทึกจดหมาย
  // -------------------------------------------------------------------------
  saveLetter() {
    const subject = document.getElementById('letter-subject').value.trim();
    const content = document.getElementById('letter-content').value.trim();
    const unlockDate = document.getElementById('letter-unlock-date').value;
    const isImmediate = document.getElementById('letter-immediate').checked;

    // ตรวจสอบข้อมูล
    if (!subject) {
      showToast('กรุณาใส่หัวข้อจดหมายค่ะ 💌', '📝');
      return;
    }
    if (!content) {
      showToast('กรุณาเขียนเนื้อหาจดหมายค่ะ ✏️', '📝');
      return;
    }
    if (!isImmediate && !unlockDate) {
      showToast('กรุณาเลือกวันเปิดอ่าน หรือติ๊ก "เปิดอ่านได้เลย" ค่ะ 📅', '📅');
      return;
    }

    const mood = this.selectedMood || { mood: 'calm', emoji: '😌', label: 'Calm' };

    const newLetter = {
      id: 'letter_' + Date.now(),
      subject,
      content,
      mood: mood.mood,
      moodEmoji: mood.emoji,
      moodLabel: mood.label,
      dateWritten: new Date().toISOString().split('T')[0],
      unlockDate: isImmediate ? null : unlockDate,
      isImmediate,
      isFavorite: false,
      createdAt: Date.now()
    };

    this.letters.push(newLetter);
    this.saveLetters();
    this.renderLetters();
    this.closeWriteModal();
    showToast('ส่งจดหมายถึงตัวเองในอนาคตแล้ว ♡', '💌');
  },

  // -------------------------------------------------------------------------
  // เปิดอ่านจดหมาย
  // -------------------------------------------------------------------------
  openReadModal(letterId) {
    const letter = this.letters.find(l => l.id === letterId);
    if (!letter) return;

    // ถ้ายังล็อกอยู่ แจ้งเตือน
    if (!this.isUnlocked(letter)) {
      const unlockStr = new Date(letter.unlockDate).toLocaleDateString('th-TH', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      showToast(`จดหมายนี้จะเปิดได้ ${unlockStr} ค่ะ 🔒`, '🔒');
      return;
    }

    const modal = document.getElementById('read-letter-modal');
    const contentArea = document.getElementById('read-letter-content');
    if (!modal || !contentArea) return;

    const dateStr = new Date(letter.dateWritten).toLocaleDateString('th-TH', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    contentArea.innerHTML = `
      <div class="read-letter-date">เขียนเมื่อ ${dateStr}</div>
      <div class="read-letter-subject">${letter.subject}</div>
      <div class="read-letter-mood">${letter.moodEmoji} ${letter.moodLabel}</div>
      <div class="read-letter-body">${letter.content}</div>
      <div class="read-letter-actions">
        <button class="btn-fav ${letter.isFavorite ? 'is-fav' : ''}" data-id="${letter.id}">
          ${letter.isFavorite ? '♥ โปรดแล้ว' : '♡ ทำเป็นโปรด'}
        </button>
        <button class="btn-delete-letter" data-id="${letter.id}">
          🗑 ลบจดหมาย
        </button>
      </div>
    `;

    modal.classList.add('active');
  },

  closeReadModal() {
    const modal = document.getElementById('read-letter-modal');
    if (modal) modal.classList.remove('active');
  },

  // สลับโปรด
  toggleFavorite(letterId) {
    const letter = this.letters.find(l => l.id === letterId);
    if (!letter) return;
    letter.isFavorite = !letter.isFavorite;
    this.saveLetters();
    this.renderLetters();
    // อัปเดตปุ่มใน modal
    const btn = document.querySelector('.btn-fav[data-id="' + letterId + '"]');
    if (btn) {
      btn.classList.toggle('is-fav');
      btn.textContent = letter.isFavorite ? '♥ โปรดแล้ว' : '♡ ทำเป็นโปรด';
    }
    showToast(letter.isFavorite ? 'เพิ่มเป็นโปรดแล้ว ♥' : 'ยกเลิกโปรดแล้ว', '💌');
  },

  // ลบจดหมาย (พร้อมยืนยัน)
  deleteLetter(letterId) {
    if (!confirm('ต้องการลบจดหมายนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    this.letters = this.letters.filter(l => l.id !== letterId);
    this.saveLetters();
    this.renderLetters();
    this.closeReadModal();
    showToast('ลบจดหมายแล้ว', '🗑');
  },

  // -------------------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------------------
  bindEvents() {
    // ปุ่มเขียนจดหมายใหม่
    const btnWrite = document.getElementById('btn-write-letter');
    if (btnWrite) btnWrite.addEventListener('click', () => this.openWriteModal());

    // ปิด Modal เขียน
    const btnCloseWrite = document.getElementById('btn-close-write');
    if (btnCloseWrite) btnCloseWrite.addEventListener('click', () => this.closeWriteModal());

    // ปิด Modal อ่าน
    const btnCloseRead = document.getElementById('btn-close-read-letter');
    if (btnCloseRead) btnCloseRead.addEventListener('click', () => this.closeReadModal());

    // ปิดเมื่อคลิกพื้นหลัง
    document.querySelectorAll('.letter-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });
    });

    // ปุ่มบันทึกจดหมาย
    const btnSave = document.getElementById('btn-save-letter');
    if (btnSave) btnSave.addEventListener('click', () => this.saveLetter());

    // ปุ่มยกเลิก
    const btnCancel = document.getElementById('btn-cancel-letter');
    if (btnCancel) btnCancel.addEventListener('click', () => this.closeWriteModal());

    // Checkbox "เปิดอ่านได้เลย" — ซ่อน/แสดง date picker
    const immediateCheck = document.getElementById('letter-immediate');
    if (immediateCheck) {
      immediateCheck.addEventListener('change', () => {
        const datePicker = document.getElementById('letter-unlock-date');
        if (datePicker) datePicker.disabled = immediateCheck.checked;
      });
    }

    // Mood picker
    document.querySelectorAll('#write-letter-modal .letter-mood-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#write-letter-modal .letter-mood-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMood = {
          mood: btn.dataset.mood,
          emoji: btn.dataset.emoji,
          label: btn.dataset.label
        };
      });
    });

    // Filter tabs
    document.querySelectorAll('.letters-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.letters-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.renderLetters();
      });
    });

    // คลิกซองจดหมาย (event delegation)
    const grid = document.getElementById('letters-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.envelope-card');
        if (card) this.openReadModal(card.dataset.id);
      });
    }

    // ปุ่มใน Read modal (event delegation)
    const readContent = document.getElementById('read-letter-content');
    if (readContent) {
      readContent.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.btn-fav');
        if (favBtn) this.toggleFavorite(favBtn.dataset.id);

        const delBtn = e.target.closest('.btn-delete-letter');
        if (delBtn) this.deleteLetter(delBtn.dataset.id);
      });
    }
  }
};

// เริ่มต้นเมื่อหน้าโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => LettersApp.init());
