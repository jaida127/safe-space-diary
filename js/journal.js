/**
 * JOURNAL.JS - Safe Space ♡ (Journal System Engine)
 * จัดการระบบไดอารี่: เพิ่ม, อ่าน, แก้ไข, ลบ, ค้นหา, กรองอารมณ์/แท็ก, และ Auto-save
 */

const JournalApp = {
  entries: [],
  activeFilterMood: 'all',
  activeFilterTag: 'all',
  searchQuery: '',
  editingEntryId: null,
  currentPhotos: [],

  init() {
    this.loadEntries();
    this.renderEntries();
    this.renderFilterTags();
    this.bindEvents();
    this.checkUrlParams();
    this.loadDraft();
  },

  // โหลดรายการไดอารี่จาก LocalStorage
  loadEntries() {
    this.entries = Storage.get('journal_entries', [
      // ตัวอย่างเริ่มต้นเพื่อให้หน้าเว็บมีตัวอย่างอบอุ่นให้ดู
      {
        id: 'entry_sample_1',
        date: '2026-09-26',
        mood: 'calm',
        moodLabel: 'Calm',
        moodEmoji: '😌',
        title: 'วันเสาร์ที่แสนสงบและกาแฟหนึ่งแก้ว',
        content: '<p>วันนี้ได้ตื่นสายกว่าปกตินิดหน่อย ลมพัดเข้ามาทางหน้าต่างเย็นสบายมาก ได้นั่งฟังเพลงโปรดและเขียนบันทึกเล่มนี้ รู้สึกเหมือนได้กลับมาอยู่กับตัวเองจริงๆ ขอบคุณช่วงเวลาเงียบๆ แบบนี้จัง ♡</p>',
        snippet: 'วันนี้ได้ตื่นสายกว่าปกตินิดหน่อย ลมพัดเข้ามาทางหน้าต่างเย็นสบายมาก ได้นั่งฟังเพลงโปรดและเขียนบันทึกเล่มนี้...',
        song: { title: 'Pluto Projector', artist: 'Rex Orange County' },
        tags: ['littlethings', 'peaceful', 'coffee'],
        photos: [],
        createdAt: 1790434800000
      }
    ]);
  },

  // บันทึกรายการทั้งหมดกลับลง LocalStorage
  saveEntriesToStorage() {
    Storage.set('journal_entries', this.entries);
  },

  // กรองและค้นหารายการไดอารี่
  getFilteredEntries() {
    return this.entries.filter(entry => {
      // 1. กรองตามคำค้นหา
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const inTitle = (entry.title || '').toLowerCase().includes(q);
        const inContent = (entry.content || '').toLowerCase().includes(q);
        const inSong = (entry.song?.title || '').toLowerCase().includes(q);
        const inTags = (entry.tags || []).some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inContent && !inSong && !inTags) return false;
      }

      // 2. กรองตาม Mood
      if (this.activeFilterMood !== 'all' && entry.mood !== this.activeFilterMood) {
        return false;
      }

      // 3. กรองตาม Tag
      if (this.activeFilterTag !== 'all' && !(entry.tags || []).includes(this.activeFilterTag)) {
        return false;
      }

      return true;
    });
  },

  // เรนเดอร์การ์ดไดอารี่ลงใน Grid
  renderEntries() {
    const grid = document.getElementById('journal-grid');
    const emptyState = document.getElementById('journal-empty-state');
    if (!grid) return;

    const filtered = this.getFilteredEntries();

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const stickers = ['heart.png', 'star.png', 'flower.png', 'bow.png', 'doodle.png', 'moon.png', 'cat.png', 'bear.png'];

    // เรียงลำดับจากใหม่ → เก่า
    const sorted = [...filtered].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    grid.innerHTML = sorted.map((entry, index) => {
      const stickerName = stickers[index % stickers.length];
      const dateFormatted = new Date(entry.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const photoHtml = (entry.photos && entry.photos.length > 0)
        ? `<div class="journal-card-images">
            ${entry.photos.slice(0, 3).map(img => `<img src="${img}" class="journal-card-thumb" alt="thumbnail">`).join('')}
            ${entry.photos.length > 3 ? `<span class="journal-tag-item" style="align-self:center;">+${entry.photos.length - 3}</span>` : ''}
          </div>`
        : '';

      const songHtml = (entry.song && entry.song.title)
        ? `<div class="journal-song-pill"><span>🎵</span> <span>${entry.song.title} ${entry.song.artist ? '· ' + entry.song.artist : ''}</span></div>`
        : '';

      const tagsHtml = (entry.tags && entry.tags.length > 0)
        ? `<div class="journal-tag-list">${entry.tags.map(t => `<span class="journal-tag-item">#${t}</span>`).join('')}</div>`
        : '';

      return `
        <article class="journal-card" data-id="${entry.id}">
          <img src="assets/stickers/${stickerName}" class="scrapbook-sticker sticker-sm sticker-corner-tr" alt="sticker">
          <div class="journal-card-top">
            <span class="journal-date-badge">${dateFormatted}</span>
            <span class="journal-mood-badge">
              <span>${entry.moodEmoji || '🌷'}</span>
              <span>${entry.moodLabel || entry.mood}</span>
            </span>
          </div>

          <h3 class="journal-card-title">${entry.title || 'Untitled Memory'}</h3>
          <p class="journal-card-snippet">${entry.snippet || ''}</p>

          ${photoHtml}

          <div class="journal-card-footer">
            ${songHtml}
            ${tagsHtml}
          </div>
        </article>
      `;
    }).join('');
  },

  // ดึงรายการ Tags ทั้งหมดมาแสดงในแถบตัวกรอง
  renderFilterTags() {
    const container = document.getElementById('filter-tags-row');
    if (!container) return;

    const allTags = new Set();
    this.entries.forEach(e => {
      (e.tags || []).forEach(t => allTags.add(t));
    });

    if (allTags.size === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <span class="filter-label">Tags:</span>
      <button class="filter-chip ${this.activeFilterTag === 'all' ? 'active' : ''}" data-tag="all">All</button>
      ${Array.from(allTags).map(tag => `
        <button class="filter-chip ${this.activeFilterTag === tag ? 'active' : ''}" data-tag="${tag}">#${tag}</button>
      `).join('')}
    `;
  },

  // -------------------------------------------------------------------------
  // Modal Editor: การเปิดหน้าต่างเขียนบันทึก
  // -------------------------------------------------------------------------
  openEditor(entryToEdit = null) {
    const modal = document.getElementById('editor-modal');
    if (!modal) return;

    this.editingEntryId = entryToEdit ? entryToEdit.id : null;
    this.currentPhotos = entryToEdit ? [...(entryToEdit.photos || [])] : [];

    const dateInput = document.getElementById('entry-date');
    const moodSelect = document.getElementById('entry-mood');
    const titleInput = document.getElementById('entry-title');
    const contentArea = document.getElementById('entry-content');
    const songTitleInput = document.getElementById('entry-song-title');
    const songArtistInput = document.getElementById('entry-song-artist');
    const tagsInput = document.getElementById('entry-tags');
    const modalTitle = document.getElementById('editor-modal-title');

    if (entryToEdit) {
      // โหมดแก้ไข
      if (modalTitle) modalTitle.textContent = 'Edit Memory ♡';
      if (dateInput) dateInput.value = entryToEdit.date || '';
      if (moodSelect) moodSelect.value = entryToEdit.mood || 'calm';
      if (titleInput) titleInput.value = entryToEdit.title || '';
      if (contentArea) contentArea.innerHTML = entryToEdit.content || '';
      if (songTitleInput) songTitleInput.value = entryToEdit.song?.title || '';
      if (songArtistInput) songArtistInput.value = entryToEdit.song?.artist || '';
      if (tagsInput) tagsInput.value = (entryToEdit.tags || []).join(', ');
    } else {
      // โหมดสร้างใหม่
      if (modalTitle) modalTitle.textContent = 'Write New Memory ♡';
      const today = new Date().toISOString().split('T')[0];
      if (dateInput) dateInput.value = today;
      if (moodSelect) moodSelect.value = 'happy';

      const draft = Storage.get('journal_draft', null);
      if (titleInput) titleInput.value = draft?.title || '';
      if (contentArea) contentArea.innerHTML = draft?.content || '';
      if (songTitleInput) songTitleInput.value = '';
      if (songArtistInput) songArtistInput.value = '';
      if (tagsInput) tagsInput.value = '';
    }

    this.renderPhotoPreviews();
    modal.classList.add('active');

    // โฟกัสไปยังช่องพิมพ์ทันที
    setTimeout(() => {
      if (titleInput && !titleInput.value) {
        titleInput.focus();
      } else if (contentArea) {
        contentArea.focus();
      }
    }, 150);
  },

  closeEditor() {
    const modal = document.getElementById('editor-modal');
    if (modal) modal.classList.remove('active');
    this.editingEntryId = null;
    this.currentPhotos = [];
  },

  // เรนเดอร์รูปภาพที่แนบในหน้า Editor
  renderPhotoPreviews() {
    const container = document.getElementById('editor-photo-previews');
    if (!container) return;

    container.innerHTML = this.currentPhotos.map((src, index) => `
      <div class="editor-thumb-box">
        <img src="${src}" alt="photo">
        <button class="editor-thumb-delete" data-index="${index}" title="ลบรูป">✕</button>
      </div>
    `).join('');
  },

  // -------------------------------------------------------------------------
  // บันทึกไดอารี่ (Save Memory ♡)
  // -------------------------------------------------------------------------
  saveEntry() {
    const dateInput = document.getElementById('entry-date');
    const moodSelect = document.getElementById('entry-mood');
    const titleInput = document.getElementById('entry-title');
    const contentArea = document.getElementById('entry-content');
    const songTitleInput = document.getElementById('entry-song-title');
    const songArtistInput = document.getElementById('entry-song-artist');
    const tagsInput = document.getElementById('entry-tags');

    const title = titleInput ? titleInput.value.trim() : '';
    let content = contentArea ? contentArea.innerHTML.trim() : '';
    
    // ตรวจสอบข้อความจริง (ไม่นับแท็กว่างเปล่า)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const rawText = (tempDiv.textContent || tempDiv.innerText || '').trim();

    if (!title && !rawText) {
      showToast('กรุณาเขียนชื่อเรื่องหรือเนื้อหาก่อนบันทึกนะคะ ♡', '💭');
      if (titleInput) titleInput.focus();
      return;
    }

    const finalTitle = title || (rawText ? rawText.slice(0, 32) + '...' : 'ความทรงจำวันนี้ ♡');
    const finalContent = rawText ? content : `<p>${finalTitle}</p>`;
    const snippet = (rawText || finalTitle).slice(0, 140) + '...';

    // ดึงชื่ออารมณ์และอิโมจิ
    const moodLabels = {
      happy: { label: 'Happy', emoji: '😊' },
      calm: { label: 'Calm', emoji: '😌' },
      loved: { label: 'Loved', emoji: '🥰' },
      peaceful: { label: 'Peaceful', emoji: '🤍' },
      tired: { label: 'Tired', emoji: '😴' },
      emotional: { label: 'Emotional', emoji: '🥹' },
      sad: { label: 'Sad', emoji: '😔' },
      frustrated: { label: 'Frustrated', emoji: '😤' }
    };
    const moodMeta = moodLabels[mood] || { label: 'Calm', emoji: '🌷' };

    // แปลง Tags
    const tags = tagsInput 
      ? tagsInput.value.split(',').map(t => t.trim().replace(/^#/, '')).filter(t => t.length > 0)
      : [];

    const song = {
      title: songTitleInput ? songTitleInput.value.trim() : '',
      artist: songArtistInput ? songArtistInput.value.trim() : ''
    };

    if (this.editingEntryId) {
      // แก้ไขบันทึกเดิม
      const index = this.entries.findIndex(e => e.id === this.editingEntryId);
      if (index !== -1) {
        this.entries[index] = {
          ...this.entries[index],
          date,
          mood,
          moodLabel: moodMeta.label,
          moodEmoji: moodMeta.emoji,
          title: finalTitle,
          content: finalContent,
          snippet,
          song,
          tags,
          photos: [...this.currentPhotos],
          updatedAt: Date.now()
        };
      }
      showToast('แก้ไขบันทึกเรียบร้อยแล้วค่ะ ✨', '✏️');
    } else {
      // สร้างบันทึกใหม่
      const newEntry = {
        id: 'entry_' + Date.now(),
        date,
        mood,
        moodLabel: moodMeta.label,
        moodEmoji: moodMeta.emoji,
        title: finalTitle,
        content: finalContent,
        snippet,
        song,
        tags,
        photos: [...this.currentPhotos],
        createdAt: Date.now()
      };
      this.entries.unshift(newEntry);
      showToast('✨ Saved to your memories.', '♡');
    }

    this.triggerSaveAnimation();
    this.saveEntriesToStorage();
    this.renderEntries();
    this.renderFilterTags();
    this.closeEditor();

    // ล้างร่าง draft
    Storage.remove('journal_draft');
  },

  // แอนิเมชันน่ารักหลังบันทึกไดอารี่สำเร็จ (Save Celebration Sparkle)
  triggerSaveAnimation() {
    let overlay = document.getElementById('save-celebration-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'save-celebration-overlay';
      overlay.className = 'save-celebration-overlay';
      overlay.innerHTML = `
        <div class="save-celebration-card">
          <div class="washi-tape"></div>
          <img src="assets/stickers/star.png" class="scrapbook-sticker sticker-md sticker-corner-tr" alt="star">
          <img src="assets/stickers/heart.png" class="scrapbook-sticker sticker-md sticker-corner-bl" alt="heart">
          <div class="save-sparkle-icon">✨</div>
          <h4 class="save-celebration-title">Saved to your memories ♡</h4>
          <p class="save-celebration-sub">บันทึกเรื่องราวอันมีค่าของคุณเรียบร้อยแล้วค่ะ</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 1600);
  },

  // -------------------------------------------------------------------------
  // Modal Read: การเปิดอ่านบันทึกฉบับเต็ม
  // -------------------------------------------------------------------------
  openReadModal(entryId) {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) return;

    const modal = document.getElementById('read-modal');
    const container = document.getElementById('read-modal-content');
    if (!modal || !container) return;

    const dateFormatted = new Date(entry.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const photosHtml = (entry.photos && entry.photos.length > 0)
      ? `<div class="read-entry-photos">
          ${entry.photos.map(p => `<img src="${p}" class="read-entry-photo-item" alt="memory photo">`).join('')}
        </div>`
      : '';

    const songHtml = (entry.song && entry.song.title)
      ? `<div class="journal-song-pill" style="margin-bottom: 1.2rem; font-size: 0.95rem;">
          <span>🎧</span> <strong>${entry.song.title}</strong> ${entry.song.artist ? '· ' + entry.song.artist : ''}
        </div>`
      : '';

    const tagsHtml = (entry.tags && entry.tags.length > 0)
      ? `<div class="journal-tag-list" style="margin-top: 1rem;">
          ${entry.tags.map(t => `<span class="journal-tag-item">#${t}</span>`).join('')}
        </div>`
      : '';

    container.innerHTML = `
      <div class="read-entry-header">
        <div class="read-entry-meta">
          <span class="sticker-badge">${dateFormatted}</span>
          <span class="journal-mood-badge">
            <span>${entry.moodEmoji || '🌷'}</span>
            <span>${entry.moodLabel || entry.mood}</span>
          </span>
        </div>
        <h2 class="read-entry-title">${entry.title || 'Untitled Memory'}</h2>
        ${songHtml}
      </div>

      <div class="read-entry-body">
        ${entry.content}
      </div>

      ${photosHtml}
      ${tagsHtml}

      <div class="modal-actions" style="margin-top: 2rem; padding-top: 1.2rem; border-top: 1.5px dashed var(--border-color);">
        <button class="btn btn-sm btn-soft" id="btn-edit-current" data-id="${entry.id}">
          ✏️ แก้ไขบันทึก
        </button>
        <button class="btn btn-sm btn-outline" id="btn-delete-current" data-id="${entry.id}" style="color: #E53957;">
          🗑️ ลบบันทึก
        </button>
      </div>
    `;

    modal.classList.add('active');
  },

  closeReadModal() {
    const modal = document.getElementById('read-modal');
    if (modal) modal.classList.remove('active');
  },

  // ลบบันทึกพร้อมยืนยันความปลอดภัย
  deleteEntry(entryId) {
    if (confirm('คุณแน่ใจว่าต้องการลบบันทึกความทรงจำนี้ใช่ไหมคะ?')) {
      this.entries = this.entries.filter(e => e.id !== entryId);
      this.saveEntriesToStorage();
      this.renderEntries();
      this.renderFilterTags();
      this.closeReadModal();
      showToast('ลบบันทึกเรียบร้อยแล้วค่ะ', '🗑️');
    }
  },

  // -------------------------------------------------------------------------
  // Auto-Save Draft
  // -------------------------------------------------------------------------
  setupAutoDraft() {
    const titleInput = document.getElementById('entry-title');
    const contentArea = document.getElementById('entry-content');

    const saveDraft = () => {
      if (this.editingEntryId) return; // ไม่บันทึกทับถ้ากำลังแก้ไขของเก่า
      const draft = {
        title: titleInput ? titleInput.value : '',
        content: contentArea ? contentArea.innerHTML : '',
        timestamp: Date.now()
      };
      Storage.set('journal_draft', draft);
    };

    if (titleInput) titleInput.addEventListener('input', saveDraft);
    if (contentArea) contentArea.addEventListener('input', saveDraft);
  },

  loadDraft() {
    const draft = Storage.get('journal_draft', null);
    if (draft && (draft.title || draft.content)) {
      // มีข้อความร่างค้างอยู่
      console.log('Found draft in storage');
    }
  },

  // ตรวจสอบ URL query parameters เช่น ?action=new
  checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setTimeout(() => this.openEditor(), 300);
    }
  },

  // -------------------------------------------------------------------------
  // Event Bindings
  // -------------------------------------------------------------------------
  bindEvents() {
    // ปุ่มเปิดเขียนบันทึกใหม่
    const btnNew = document.getElementById('btn-new-entry');
    if (btnNew) btnNew.addEventListener('click', () => this.openEditor());

    const btnEmptyNew = document.getElementById('btn-empty-new');
    if (btnEmptyNew) btnEmptyNew.addEventListener('click', () => this.openEditor());

    // ปุ่มปิด Modal
    const btnCloseEditor = document.getElementById('btn-close-editor');
    if (btnCloseEditor) btnCloseEditor.addEventListener('click', () => this.closeEditor());

    const btnCloseRead = document.getElementById('btn-close-read');
    if (btnCloseRead) btnCloseRead.addEventListener('click', () => this.closeReadModal());

    // ปิดเมื่อคลิกพื้นหลัง
    document.querySelectorAll('.journal-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // ปุ่มบันทึกใน Editor
    const btnSave = document.getElementById('btn-save-entry');
    if (btnSave) btnSave.addEventListener('click', () => this.saveEntry());

    // ค้นหาข้อความ
    const searchInput = document.getElementById('journal-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderEntries();
      });
    }

    // คลิกเลือกตัวกรอง Mood
    document.addEventListener('click', (e) => {
      const moodChip = e.target.closest('.filter-mood-chip');
      if (moodChip) {
        document.querySelectorAll('.filter-mood-chip').forEach(c => c.classList.remove('active'));
        moodChip.classList.add('active');
        this.activeFilterMood = moodChip.dataset.mood;
        this.renderEntries();
        return;
      }

      const tagChip = e.target.closest('.filter-chip[data-tag]');
      if (tagChip) {
        document.querySelectorAll('.filter-chip[data-tag]').forEach(c => c.classList.remove('active'));
        tagChip.classList.add('active');
        this.activeFilterTag = tagChip.dataset.tag;
        this.renderEntries();
        return;
      }

      // คลิกการ์ดไดอารี่เพื่อเปิดอ่าน
      const card = e.target.closest('.journal-card');
      if (card) {
        const id = card.dataset.id;
        this.openReadModal(id);
        return;
      }

      // คลิกปุ่มแก้ไขในหน้าอ่านเต็ม
      const btnEdit = e.target.closest('#btn-edit-current');
      if (btnEdit) {
        const id = btnEdit.dataset.id;
        const entry = this.entries.find(x => x.id === id);
        this.closeReadModal();
        this.openEditor(entry);
        return;
      }

      // คลิกปุ่มลบในหน้าอ่านเต็ม
      const btnDelete = e.target.closest('#btn-delete-current');
      if (btnDelete) {
        const id = btnDelete.dataset.id;
        this.deleteEntry(id);
        return;
      }

      // ลบรูปภาพในหน้า Editor
      const btnDelPhoto = e.target.closest('.editor-thumb-delete');
      if (btnDelPhoto) {
        const idx = parseInt(btnDelPhoto.dataset.index, 10);
        this.currentPhotos.splice(idx, 1);
        this.renderPhotoPreviews();
        return;
      }
    });

    // อัปโหลดรูปภาพใน Editor
    const photoInput = document.getElementById('entry-photo-input');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
          if (!file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            this.currentPhotos.push(event.target.result);
            this.renderPhotoPreviews();
          };
          reader.readAsDataURL(file);
        });
        photoInput.value = '';
      });
    }

    // แถบเครื่องมือจัดแต่งข้อความ (Formatting Toolbar)
    const toolbar = document.getElementById('editor-toolbar');
    const contentArea = document.getElementById('entry-content');

    // คลิกที่กรอบเนื้อหาเพื่อโฟกัสพิมพ์ได้ทันที
    if (contentArea) {
      contentArea.addEventListener('click', () => {
        contentArea.focus();
      });
    }

    if (toolbar) {
      // ป้องกันการคลิกปุ่มบน toolbar แย่ง focus ไปจากกล่องข้อความ
      toolbar.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });

      toolbar.addEventListener('click', (e) => {
        const btn = e.target.closest('.tool-btn');
        if (!btn) return;
        e.preventDefault();

        const cmd = btn.dataset.cmd;
        const val = btn.dataset.val || null;

        if (cmd === 'highlight') {
          document.execCommand('backColor', false, 'rgba(255, 235, 130, 0.45)');
        } else if (cmd === 'emoji') {
          const emojis = ['♡', '✨', '🌸', '🌷', '🌿', '☁️', '🌙', '☕', '🧸', '🍓'];
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          document.execCommand('insertText', false, ` ${randomEmoji} `);
        } else if (cmd) {
          document.execCommand(cmd, false, val);
        }

        if (contentArea) contentArea.focus();
      });
    }

    this.setupAutoDraft();
  }
};

// เริ่มต้นทำงาน
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  JournalApp.init();
});
