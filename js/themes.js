/**
 * THEMES.JS - Safe Space ♡ (Revamped with 7 Cute Scrapbook Themes)
 * จัดการระบบเปลี่ยนธีมสีสดใสทั้ง 7 ธีม, จำค่าใน localStorage, และสุ่ม Surprise Me
 */

const ThemeManager = {
  themes: [
    { id: 'pink-polka', name: 'Pink Polka', emoji: '🎀', dot: '#FF7B9A' },
    { id: 'baby-blue', name: 'Baby Blue', emoji: '🩵', dot: '#5EA8D8' },
    { id: 'lavender', name: 'Lavender', emoji: '💜', dot: '#A282D8' },
    { id: 'pistachio', name: 'Pistachio', emoji: '🍃', dot: '#76A97D' },
    { id: 'strawberry', name: 'Strawberry', emoji: '🍓', dot: '#F25C74' },
    { id: 'cocoa', name: 'Cocoa', emoji: '🍫', dot: '#9C7053' },
    { id: 'midnight', name: 'Midnight', emoji: '🌙', dot: '#A294F9' }
  ],

  // เริ่มต้นระบบธีม และฟอนต์
  init() {
    const savedTheme = Storage.get('theme', 'pink-polka');
    this.applyTheme(savedTheme, false);

    // โหลดฟอนต์ที่ผู้ใช้เลือกไว้จากหน้า Settings
    const savedFont = Storage.get('user_font', 'default');
    document.documentElement.setAttribute('data-font', savedFont);

    this.renderThemePalette();
    this.bindEvents();
  },

  // เปลี่ยนธีมและบันทึก
  applyTheme(themeId, notify = true) {
    const validTheme = this.themes.some(t => t.id === themeId) ? themeId : 'pink-polka';
    
    // ตั้งค่า data-theme ให้กับ <html>
    if (validTheme === 'pink-polka') {
      document.documentElement.setAttribute('data-theme', 'pink-polka');
    } else {
      document.documentElement.setAttribute('data-theme', validTheme);
    }

    Storage.set('theme', validTheme);
    this.updateActiveUI(validTheme);

    if (notify) {
      const themeObj = this.themes.find(t => t.id === validTheme);
      showToast(`เปลี่ยนเป็นธีม ${themeObj.emoji} ${themeObj.name} แล้วค่ะ ♡`, '✨');
    }
  },

  // สุ่มธีม (✨ Surprise Me)
  surpriseMe() {
    const currentTheme = Storage.get('theme', 'pink-polka');
    const availableThemes = this.themes.filter(t => t.id !== currentTheme);
    const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    this.applyTheme(randomTheme.id, true);
  },

  // อัปเดตสถานะปุ่มที่เลือก (Active state)
  updateActiveUI(activeThemeId) {
    document.querySelectorAll('.theme-chip').forEach(btn => {
      if (btn.dataset.theme === activeThemeId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  // เรนเดอร์ปุ่มเลือกธีมลงใน Sidebar
  renderThemePalette() {
    const containers = document.querySelectorAll('.theme-palette-container');
    containers.forEach(container => {
      container.innerHTML = `
        <div class="theme-palette">
          ${this.themes.map(t => `
            <button class="theme-chip" data-theme="${t.id}" title="${t.name}">
              <span class="theme-dot" style="background-color: ${t.dot}"></span>
              <span>${t.emoji} ${t.name}</span>
            </button>
          `).join('')}
        </div>
        <button class="btn btn-sm btn-surprise" id="btn-surprise-theme">
          ✨ Surprise Me!
        </button>
      `;
    });
  },

  // ผูก Event Listener ให้ปุ่มต่างๆ
  bindEvents() {
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.theme-chip');
      if (chip) {
        const themeId = chip.dataset.theme;
        this.applyTheme(themeId, true);
        return;
      }

      if (e.target.closest('#btn-surprise-theme')) {
        this.surpriseMe();
      }
    });
  }
};
