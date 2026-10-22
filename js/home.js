/**
 * HOME.JS - Safe Space ♡
 * จัดการฟังก์ชันทั้งหมดในหน้าหลัก (Home Page)
 * เช่น วันที่/เวลา, การเลือก Mood, Little Things, Song of the day, และ Moment of the day
 */

const HomePage = {
  todayKey: '', // เก็บวันที่ในรูปแบบ 'YYYY-MM-DD' เพื่อใช้เป็น key อ้างอิงข้อมูลของวันนั้น

  init() {
    this.initDateKey();
    this.renderDateTime();
    this.initNickname();
    this.initMoodSection();
    this.initLittleThings();
    this.initSongOfTheDay();
    this.initMemoryOfTheDay();
    this.initQuickJournal();
  },

  // แสดงชื่อเล่นของผู้ใช้หากตั้งค่าไว้
  initNickname() {
    const nickname = Storage.get('user_nickname', '');
    if (nickname) {
      const badge = document.querySelector('.welcome-badge');
      if (badge) badge.textContent = `welcome back, ${nickname} ♡`;
    }
  },

  // สร้าง Key วันที่ เช่น '2026-09-26'
  initDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    this.todayKey = `${year}-${month}-${day}`;
  },

  // 1. แสดงวันที่และเวลาปัจจุบัน
  renderDateTime() {
    const now = new Date();

    // แสดงวันที่ภาษาอังกฤษและไทยอย่างสวยงาม
    const optionsEn = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEn = now.toLocaleDateString('en-US', optionsEn);

    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      dateEl.textContent = dateEn;
    }

    // นาฬิกาบอกเวลาแบบเรียบง่าย
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
      const updateClock = () => {
        const timeNow = new Date();
        const hours = String(timeNow.getHours()).padStart(2, '0');
        const minutes = String(timeNow.getMinutes()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}`;
      };
      updateClock();
      setInterval(updateClock, 1000 * 30); // อัปเดตทุก 30 วินาที
    }
  },

  // 2. จัดการส่วนเลือก Mood (How are you feeling today?)
  initMoodSection() {
    const moodBtns = document.querySelectorAll('.mood-btn');
    const moodNoteInput = document.getElementById('mood-note');
    const moodNoteBox = document.getElementById('mood-note-box');

    // โหลดข้อมูล Mood เดิมที่เคยบันทึกไว้ในวันนี้
    const savedMoodData = Storage.get(`mood_${this.todayKey}`, null);
    if (savedMoodData) {
      const activeBtn = document.querySelector(`.mood-btn[data-mood="${savedMoodData.mood}"]`);
      if (activeBtn) activeBtn.classList.add('active');
      if (moodNoteInput && savedMoodData.note) {
        moodNoteInput.value = savedMoodData.note;
        if (moodNoteBox) moodNoteBox.style.display = 'block';
      }
    }

    // กดเลือก Mood
    moodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const selectedMood = btn.dataset.mood;
        const moodName = btn.querySelector('.mood-label').textContent;

        // บันทึก Mood
        const currentData = Storage.get(`mood_${this.todayKey}`, {});
        currentData.mood = selectedMood;
        currentData.date = this.todayKey;
        Storage.set(`mood_${this.todayKey}`, currentData);

        // เปิดกล่องเขียนบันทึกเหตุผล
        if (moodNoteBox) {
          moodNoteBox.style.display = 'block';
        }

        showToast(`บันทึกอารมณ์ "${moodName}" ของวันนี้แล้วค่ะ`, '🌷');
      });
    });

    // บันทึกข้อความเหตุผลเมื่อพิมพ์ (Auto-save)
    if (moodNoteInput) {
      moodNoteInput.addEventListener('input', () => {
        const currentData = Storage.get(`mood_${this.todayKey}`, {});
        currentData.note = moodNoteInput.value;
        Storage.set(`mood_${this.todayKey}`, currentData);
      });
    }
  },

  // 3. จัดการส่วน Today's Little Things (4 ข้อความสั้น)
  initLittleThings() {
    const fields = ['grateful', 'smiled', 'learned', 'thinking'];
    const savedThings = Storage.get(`little_things_${this.todayKey}`, {});

    fields.forEach(field => {
      const input = document.getElementById(`lt-${field}`);
      if (input) {
        // เติมข้อมูลเก่าที่เคยบันทึกไว้
        if (savedThings[field]) {
          input.value = savedThings[field];
        }

        // เมื่อพิมพ์ให้อัปเดตและบันทึกลง LocalStorage
        input.addEventListener('input', () => {
          const current = Storage.get(`little_things_${this.todayKey}`, {});
          current[field] = input.value;
          Storage.set(`little_things_${this.todayKey}`, current);
        });
      }
    });
  },

  // 4. จัดการส่วนเพลงประจำวัน (Song of the Day)
  initSongOfTheDay() {
    const titleInput = document.getElementById('song-title');
    const artistInput = document.getElementById('song-artist');
    const feelingInput = document.getElementById('song-feeling');
    const previewTitle = document.getElementById('music-preview-title');
    const previewArtist = document.getElementById('music-preview-artist');
    const turntableBox = document.getElementById('turntable-box');
    const vinylWrapper = document.getElementById('vinyl-wrapper');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const playPauseText = document.getElementById('play-pause-text');
    const btnSearch = document.getElementById('btn-search-song');

    const savedSong = Storage.get(`song_${this.todayKey}`, {
      title: 'Pluto Projector',
      artist: 'Rex Orange County',
      feeling: 'ฟังสบายๆ ชวนคิดถึงช่วงเวลาสงบ'
    });

    // แสดงข้อมูลใน UI
    if (titleInput) titleInput.value = savedSong.title || '';
    if (artistInput) artistInput.value = savedSong.artist || '';
    if (feelingInput) feelingInput.value = savedSong.feeling || '';
    if (previewTitle) previewTitle.textContent = savedSong.title || 'ชื่อเพลงที่ชอบ';
    if (previewArtist) previewArtist.textContent = savedSong.artist || 'ศิลปิน';

    const saveSongData = () => {
      const songData = {
        title: titleInput ? titleInput.value.trim() : '',
        artist: artistInput ? artistInput.value.trim() : '',
        feeling: feelingInput ? feelingInput.value.trim() : ''
      };
      Storage.set(`song_${this.todayKey}`, songData);

      if (previewTitle) previewTitle.textContent = songData.title || 'ชื่อเพลงที่ชอบ';
      if (previewArtist) previewArtist.textContent = songData.artist || 'ศิลปิน';
    };

    if (titleInput) titleInput.addEventListener('input', saveSongData);
    if (artistInput) artistInput.addEventListener('input', saveSongData);
    if (feelingInput) feelingInput.addEventListener('input', saveSongData);

    // ฟังก์ชันสลับสถานะ Play / Pause ของเครื่องเล่นแผ่นเสียง
    let isPlaying = false;
    const togglePlayback = () => {
      isPlaying = !isPlaying;

      if (turntableBox) {
        turntableBox.classList.toggle('playing', isPlaying);
      }

      if (playPauseIcon && playPauseText) {
        if (isPlaying) {
          playPauseIcon.textContent = '⏸';
          playPauseText.textContent = 'Pause';
          showToast('กำลังเล่นแผ่นเสียงในความรู้สึก ♡', '🎧');
        } else {
          playPauseIcon.textContent = '▶';
          playPauseText.textContent = 'Play';
          showToast('หยุดเล่นแผ่นเสียงชั่วคราวแล้วค่ะ', '⏸');
        }
      }
    };

    // แตะปุ่ม Play/Pause หรือแตะที่แผ่นเสียงโดยตรงเพื่อเปิด/ปิด
    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', togglePlayback);
    }
    if (vinylWrapper) {
      vinylWrapper.addEventListener('click', togglePlayback);
    }

    // ปุ่มเปิดค้นหาใน YouTube
    if (btnSearch) {
      btnSearch.addEventListener('click', () => {
        const query = `${titleInput ? titleInput.value : ''} ${artistInput ? artistInput.value : ''}`.trim();
        if (query) {
          const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
          window.open(url, '_blank');
        } else {
          showToast('กรุณากรอกชื่อเพลงก่อนค้นหานะคะ', '💭');
        }
      });
    }
  },

  // 5. จัดการรูปภาพความทรงจำของวัน (Today's Little Moment)
  initMemoryOfTheDay() {
    const fileInput = document.getElementById('photo-input');
    const imgEl = document.getElementById('polaroid-img');
    const placeholder = document.getElementById('polaroid-placeholder');
    const captionInput = document.getElementById('polaroid-caption');
    const btnRemove = document.getElementById('btn-remove-photo');

    // โหลดรูปภาพและความรู้สึกเดิม
    const savedMoment = Storage.get(`moment_${this.todayKey}`, null);
    if (savedMoment) {
      if (savedMoment.image && imgEl && placeholder) {
        imgEl.src = savedMoment.image;
        imgEl.style.display = 'block';
        placeholder.style.display = 'none';
        if (btnRemove) btnRemove.style.display = 'inline-flex';
      }
      if (savedMoment.caption && captionInput) {
        captionInput.value = savedMoment.caption;
      }
    }

    // เมื่อเลือกรูปภาพจากเครื่อง
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ตรวจสอบว่าเป็นไฟล์รูปภาพ
        if (!file.type.startsWith('image/')) {
          showToast('กรุณาเลือกไฟล์รูปภาพนะคะ', '⚠️');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Img = event.target.result;

          if (imgEl && placeholder) {
            imgEl.src = base64Img;
            imgEl.style.display = 'block';
            placeholder.style.display = 'none';
          }
          if (btnRemove) btnRemove.style.display = 'inline-flex';

          const currentMoment = Storage.get(`moment_${this.todayKey}`, {});
          currentMoment.image = base64Img;
          Storage.set(`moment_${this.todayKey}`, currentMoment);

          showToast('บันทึกรูปภาพความทรงจำแล้วค่ะ ♡', '📸');
        };
        reader.readAsDataURL(file);
      });
    }

    // บันทึกคำบรรยายใต้ภาพ (Caption)
    if (captionInput) {
      captionInput.addEventListener('input', () => {
        const currentMoment = Storage.get(`moment_${this.todayKey}`, {});
        currentMoment.caption = captionInput.value;
        Storage.set(`moment_${this.todayKey}`, currentMoment);
      });
    }

    // ปุ่มลบรูปภาพ
    if (btnRemove) {
      btnRemove.addEventListener('click', () => {
        if (imgEl && placeholder) {
          imgEl.src = '';
          imgEl.style.display = 'none';
          placeholder.style.display = 'flex';
        }
        btnRemove.style.display = 'none';

        const currentMoment = Storage.get(`moment_${this.todayKey}`, {});
        delete currentMoment.image;
        Storage.set(`moment_${this.todayKey}`, currentMoment);

        if (fileInput) fileInput.value = '';
        showToast('ลบรูปภาพเรียบร้อยแล้วค่ะ', '🗑️');
      });
    }
  },

  // 6. Quick Journal (กล่องเขียนข้อความชวนคิด)
  initQuickJournal() {
    const quickInput = document.getElementById('quick-journal-text');
    const btnWrite = document.getElementById('btn-goto-journal');
    const btnQuickSave = document.getElementById('btn-quick-save');

    if (quickInput) {
      // โหลดข้อความร่างด่วน (Quick draft)
      const draft = Storage.get(`quick_draft_${this.todayKey}`, '');
      quickInput.value = draft;

      quickInput.addEventListener('input', () => {
        Storage.set(`quick_draft_${this.todayKey}`, quickInput.value);
      });
    }

    // บันทึกด่วนลง Journal ทันทีจากหน้าแรก
    if (btnQuickSave) {
      btnQuickSave.addEventListener('click', () => {
        const text = quickInput ? quickInput.value.trim() : '';
        if (!text) {
          showToast('กรุณาเขียนข้อความก่อนบันทึกนะคะ ♡', '💭');
          if (quickInput) quickInput.focus();
          return;
        }

        const entries = Storage.get('journal_entries', []);
        const todayMood = Storage.get(`mood_${this.todayKey}`, null);
        const moodName = todayMood ? todayMood.mood : 'calm';
        const moodEmojiMap = {
          happy: '😊', calm: '😌', loved: '🥰', peaceful: '🤍',
          tired: '😴', emotional: '🥹', sad: '😔', frustrated: '😤'
        };

        const newEntry = {
          id: 'entry_' + Date.now(),
          date: this.todayKey,
          mood: moodName,
          moodLabel: moodName.charAt(0).toUpperCase() + moodName.slice(1),
          moodEmoji: moodEmojiMap[moodName] || '🌷',
          title: text.length > 30 ? text.slice(0, 30) + '...' : text,
          content: `<p>${text.replace(/\n/g, '<br>')}</p>`,
          snippet: text.length > 140 ? text.slice(0, 140) + '...' : text,
          song: Storage.get(`song_${this.todayKey}`, { title: '', artist: '' }),
          tags: ['quickjournal'],
          photos: [],
          createdAt: Date.now()
        };

        entries.unshift(newEntry);
        Storage.set('journal_entries', entries);
        Storage.remove(`quick_draft_${this.todayKey}`);
        Storage.remove('journal_draft');
        if (quickInput) quickInput.value = '';

        showToast('✨ บันทึกลง Journal เรียบร้อยแล้วค่ะ ♡', '📖');
      });
    }

    if (btnWrite) {
      btnWrite.addEventListener('click', () => {
        const text = quickInput ? quickInput.value.trim() : '';
        if (text) {
          Storage.set('journal_draft', {
            title: text.length > 30 ? text.slice(0, 30) + '...' : text,
            content: `<p>${text.replace(/\n/g, '<br>')}</p>`,
            timestamp: Date.now()
          });
        }
        window.location.href = 'journal.html?action=new';
      });
    }
  }
};

// เริ่มต้นทำงานเมื่อเอกสารโหลดเสร็จสมบูรณ์
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  QuotesManager.init();
  HomePage.init();
});
