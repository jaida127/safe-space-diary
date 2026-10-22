/**
 * SETTINGS.JS — Settings ⚙️ (Safe Space ♡)
 * จัดการการตั้งค่าทั้งหมด: ธีม, ชื่อเล่น, ฟอนต์, สำรอง/กู้คืนข้อมูล, ล้างข้อมูล
 */

const SettingsApp = {
  // ข้อมูลชุดธีมทั้ง 7 และสี Swatches
  themesData: [
    { id: 'pink-polka', name: 'Pink Polka', emoji: '🎀', swatches: ['#FF7B9A', '#FFE8ED', '#FF527B'] },
    { id: 'baby-blue', name: 'Baby Blue', emoji: '🩵', swatches: ['#5EA8D8', '#E1EFF9', '#3F92C7'] },
    { id: 'lavender', name: 'Lavender', emoji: '💜', swatches: ['#A282D8', '#EFE8FA', '#8B64C9'] },
    { id: 'pistachio', name: 'Pistachio', emoji: '🍃', swatches: ['#76A97D', '#E2F0E5', '#578F5E'] },
    { id: 'strawberry', name: 'Strawberry', emoji: '🍓', swatches: ['#F25C74', '#FDE7EC', '#D83854'] },
    { id: 'cocoa', name: 'Cocoa', emoji: '🍫', swatches: ['#9C7053', '#F3ECE7', '#7B5238'] },
    { id: 'midnight', name: 'Midnight', emoji: '🌙', swatches: ['#A294F9', '#1A1829', '#6C5CE7'] }
  ],

  init() {
    this.renderThemeCards();
    this.initNickname();
    this.initFontSettings();
    this.bindEvents();
  },

  // -------------------------------------------------------------------------
  // 1. THEME SELECTION
  // -------------------------------------------------------------------------
  renderThemeCards() {
    const grid = document.getElementById('theme-grid');
    if (!grid) return;

    const currentTheme = Storage.get('theme', 'pink-polka');

    grid.innerHTML = this.themesData.map(t => {
      const isActive = t.id === currentTheme;
      const swatchesHtml = t.swatches.map(c => `<span class="theme-swatch" style="background:${c}"></span>`).join('');
      return `
        <div class="theme-card ${isActive ? 'active' : ''}" data-theme="${t.id}">
          <div class="theme-card-check">✓</div>
          <div class="theme-card-emoji">${t.emoji}</div>
          <div class="theme-card-name">${t.name}</div>
          <div class="theme-swatches">${swatchesHtml}</div>
        </div>
      `;
    }).join('');
  },

  updateActiveThemeCard(themeId) {
    document.querySelectorAll('.theme-card').forEach(card => {
      if (card.dataset.theme === themeId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  },

  // -------------------------------------------------------------------------
  // 2. PROFILE / NICKNAME
  // -------------------------------------------------------------------------
  initNickname() {
    const input = document.getElementById('nickname-input');
    const preview = document.getElementById('nickname-preview-text');
    const savedName = Storage.get('user_nickname', '');

    if (input) input.value = savedName;
    this.updateNicknamePreview(savedName);

    if (input) {
      input.addEventListener('input', (e) => {
        this.updateNicknamePreview(e.target.value.trim());
      });
    }
  },

  updateNicknamePreview(name) {
    const preview = document.getElementById('nickname-preview-text');
    if (!preview) return;
    if (name) {
      preview.textContent = `สวัสดี, ${name} ♡ ขอให้เป็นวันที่แสนอบอุ่นนะ`;
    } else {
      preview.textContent = `สวัสดี, เธอ ♡ ขอให้เป็นวันที่แสนอบอุ่นนะ (ยังไม่ได้ตั้งชื่อ)`;
    }
  },

  saveNickname() {
    const input = document.getElementById('nickname-input');
    if (!input) return;
    const name = input.value.trim();
    Storage.set('user_nickname', name);
    this.updateNicknamePreview(name);
    showToast(name ? `บันทึกชื่อ "${name}" เรียบร้อยค่ะ ♡` : 'รีเซ็ตชื่อเรียบร้อยค่ะ ♡', '✨');
  },

  // -------------------------------------------------------------------------
  // 3. FONT SELECTION
  // -------------------------------------------------------------------------
  initFontSettings() {
    const currentFont = Storage.get('user_font', 'default');
    this.applyFont(currentFont, false);

    document.querySelectorAll('.font-option').forEach(option => {
      const font = option.dataset.font;
      const radio = option.querySelector('input[type="radio"]');
      if (font === currentFont) {
        option.classList.add('active');
        if (radio) radio.checked = true;
      } else {
        option.classList.remove('active');
        if (radio) radio.checked = false;
      }
    });
  },

  applyFont(fontName, notify = true) {
    document.documentElement.setAttribute('data-font', fontName);
    Storage.set('user_font', fontName);

    document.querySelectorAll('.font-option').forEach(option => {
      const isMatch = option.dataset.font === fontName;
      option.classList.toggle('active', isMatch);
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = isMatch;
    });

    if (notify) {
      const labelMap = {
        default: 'ปกติ (Prompt)',
        handwritten: 'ลายมือน่ารัก (Mali / Caveat)',
        clean: 'คลีนโมเดิร์น (Inter)'
      };
      showToast(`เปลี่ยนฟอนต์เป็น ${labelMap[fontName] || fontName} แล้วค่ะ ♡`, '✏️');
    }
  },

  // -------------------------------------------------------------------------
  // 4. EXPORT DATA (ดาวน์โหลด JSON)
  // -------------------------------------------------------------------------
  exportData() {
    try {
      const backupData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('safespace_')) {
          backupData[key] = localStorage.getItem(key);
        }
      }

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const now = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `safespace_backup_${now}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อยค่ะ ♡', '📥');
    } catch (e) {
      console.error('Export error:', e);
      showToast('เกิดข้อผิดพลาดในการสำรองข้อมูล', '⚠️');
    }
  },

  // -------------------------------------------------------------------------
  // 5. IMPORT DATA (นำเข้า JSON)
  // -------------------------------------------------------------------------
  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid JSON format');
        }

        const confirmRestore = confirm('การนำเข้าข้อมูลจะเขียนทับข้อมูลที่มีอยู่ คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?');
        if (!confirmRestore) return;

        let importedCount = 0;
        Object.keys(data).forEach(key => {
          if (key.startsWith('safespace_')) {
            localStorage.setItem(key, data[key]);
            importedCount++;
          }
        });

        alert(`นำเข้าข้อมูลสำเร็จ (${importedCount} รายการ) หน้าเว็บจะทำการรีเฟรชค่ะ`);
        window.location.reload();
      } catch (err) {
        console.error('Import error:', err);
        alert('ไฟล์ข้อมูลไม่ถูกต้อง กรุณาเลือกไฟล์สำรองของ Safe Space ที่เป็น .json ค่ะ');
      }
    };
    reader.readAsText(file);
  },

  // -------------------------------------------------------------------------
  // 6. DELETE ALL DATA (ลบข้อมูลทั้งหมด)
  // -------------------------------------------------------------------------
  openDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const input = document.getElementById('delete-modal-input');
    if (input) input.value = '';
    if (modal) modal.classList.add('active');
  },

  closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.remove('active');
  },

  confirmDeleteAll() {
    const input = document.getElementById('delete-modal-input');
    const typed = input ? input.value.trim().toUpperCase() : '';

    if (typed !== 'DELETE' && typed !== 'ลบข้อมูล') {
      showToast('กรุณาพิมพ์คำว่า DELETE หรือ ลบข้อมูล เพื่อยืนยันค่ะ', '⚠️');
      return;
    }

    Storage.clearAll();
    this.closeDeleteModal();
    alert('ลบข้อมูลทั้งหมดเรียบร้อยแล้วค่ะ ระบบจะพากลับไปที่หน้าแรก');
    window.location.href = 'index.html';
  },

  // -------------------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------------------
  bindEvents() {
    // 1. Theme Card Click
    const themeGrid = document.getElementById('theme-grid');
    if (themeGrid) {
      themeGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.theme-card');
        if (card) {
          const themeId = card.dataset.theme;
          if (typeof ThemeManager !== 'undefined') {
            ThemeManager.applyTheme(themeId, true);
          }
          this.updateActiveThemeCard(themeId);
        }
      });
    }

    // 2. Nickname Save
    const btnSaveNickname = document.getElementById('btn-save-nickname');
    if (btnSaveNickname) {
      btnSaveNickname.addEventListener('click', () => this.saveNickname());
    }

    // 3. Font Options Click
    document.querySelectorAll('.font-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const font = opt.dataset.font;
        this.applyFont(font, true);
      });
    });

    // 4. Export Button
    const btnExport = document.getElementById('btn-export-data');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportData());
    }

    // 5. Import File Input
    const fileImport = document.getElementById('file-import-data');
    if (fileImport) {
      fileImport.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.importData(e.target.files[0]);
          e.target.value = ''; // reset input
        }
      });
    }

    // 6. Delete Buttons & Modal
    const btnOpenDelete = document.getElementById('btn-open-delete-modal');
    if (btnOpenDelete) {
      btnOpenDelete.addEventListener('click', () => this.openDeleteModal());
    }

    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    if (btnCancelDelete) {
      btnCancelDelete.addEventListener('click', () => this.closeDeleteModal());
    }

    const btnConfirmDelete = document.getElementById('btn-confirm-delete');
    if (btnConfirmDelete) {
      btnConfirmDelete.addEventListener('click', () => this.confirmDeleteAll());
    }

    // ปิดเมื่อคลิก Overlay
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
      deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) this.closeDeleteModal();
      });
    }
  }
};

// เริ่มต้นเมื่อหน้าโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => SettingsApp.init());
