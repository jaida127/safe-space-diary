/**
 * MEMORIES.JS - Safe Space ♡
 * จัดการแกลเลอรี่ภาพความทรงจำสไตล์ Polaroid & Scrapbook
 */

const MemoriesApp = {
  photos: [],
  currentIndex: 0,

  init() {
    this.loadPhotos();
    this.renderGallery();
    this.bindEvents();
  },

  loadPhotos() {
    const list = [];

    // 1. ดึงภาพจาก Journal Entries
    const entries = Storage.get('journal_entries', []);
    entries.forEach(entry => {
      if (entry.photos && Array.isArray(entry.photos)) {
        entry.photos.forEach((photoUrl, idx) => {
          list.push({
            id: `entry_${entry.id}_${idx}`,
            url: photoUrl,
            caption: entry.title || 'Quiet Memory',
            date: entry.date,
            source: 'journal',
            entryId: entry.id
          });
        });
      }
    });

    // 2. ดึงภาพจาก Home page moments (safespace_moment_YYYY-MM-DD)
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith('safespace_moment_')) {
        const dateKey = k.replace('safespace_moment_', '');
        try {
          const item = JSON.parse(localStorage.getItem(k));
          if (item && item.image) {
            list.push({
              id: `moment_${dateKey}`,
              url: item.image,
              caption: item.caption || 'Today’s Little Moment',
              date: dateKey,
              source: 'moment'
            });
          }
        } catch (e) {}
      }
    });

    // เรียงจากใหม่ไปเก่า
    this.photos = list.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  renderGallery() {
    const grid = document.getElementById('polaroid-grid');
    const emptyState = document.getElementById('memories-empty-state');
    const countBadge = document.getElementById('memories-count-badge');

    if (countBadge) {
      countBadge.textContent = `📸 ${this.photos.length} memories captured`;
    }

    if (!grid) return;

    if (this.photos.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const stickers = [
      'heart.png', 'bow.png', 'flower.png', 'cat.png', 
      'bear.png', 'star.png', 'moon.png', 'headphones.png'
    ];

    grid.innerHTML = this.photos.map((photo, index) => {
      const stickerName = stickers[index % stickers.length];
      const stickerPos = (index % 2 === 0) ? 'sticker-corner-tr' : 'sticker-corner-tl';

      const dateFormatted = new Date(photo.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `
        <article class="polaroid-item" onclick="MemoriesApp.openLightbox(${index})">
          <div class="washi-tape"></div>
          <img src="assets/stickers/${stickerName}" class="scrapbook-sticker sticker-sm ${stickerPos}" alt="sticker">
          
          <div class="polaroid-photo-wrapper">
            <img src="${photo.url}" class="polaroid-photo" alt="${photo.caption}" loading="lazy">
          </div>

          <div class="polaroid-caption-area">
            <div class="polaroid-date">${dateFormatted}</div>
            <div class="polaroid-caption">${photo.caption}</div>
          </div>
        </article>
      `;
    }).join('');
  },

  openLightbox(index) {
    if (index < 0 || index >= this.photos.length) return;
    this.currentIndex = index;
    const photo = this.photos[index];

    const overlay = document.getElementById('polaroid-lightbox');
    const photoImg = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const dateEl = document.getElementById('lightbox-date');
    const journalBtn = document.getElementById('lightbox-journal-btn');

    if (!overlay || !photo) return;

    if (photoImg) photoImg.src = photo.url;
    if (captionEl) captionEl.textContent = photo.caption;
    
    if (dateEl) {
      const dateFormatted = new Date(photo.date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      dateEl.textContent = `📅 ${dateFormatted}`;
    }

    if (journalBtn) {
      if (photo.source === 'journal') {
        journalBtn.style.display = 'inline-flex';
        journalBtn.href = `journal.html`;
      } else {
        journalBtn.style.display = 'none';
      }
    }

    overlay.classList.add('active');
  },

  closeLightbox() {
    const overlay = document.getElementById('polaroid-lightbox');
    if (overlay) overlay.classList.remove('active');
  },

  nextPhoto() {
    if (this.photos.length === 0) return;
    const nextIdx = (this.currentIndex + 1) % this.photos.length;
    this.openLightbox(nextIdx);
  },

  prevPhoto() {
    if (this.photos.length === 0) return;
    const prevIdx = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
    this.openLightbox(prevIdx);
  },

  bindEvents() {
    // ปิดเมื่อคลิกพื้นหลัง overlay
    const overlay = document.getElementById('polaroid-lightbox');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeLightbox();
        }
      });
    }

    // แป้นพิมพ์ลูกศรซ้าย/ขวา และ Esc
    document.addEventListener('keydown', (e) => {
      const active = overlay && overlay.classList.contains('active');
      if (!active) return;

      if (e.key === 'ArrowRight') this.nextPhoto();
      if (e.key === 'ArrowLeft') this.prevPhoto();
      if (e.key === 'Escape') this.closeLightbox();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MemoriesApp.init();
});
