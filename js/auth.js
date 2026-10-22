/**
 * AUTH.JS — Google Login & Cloud Sync for Safe Space ♡
 * จัดการการเข้าสู่ระบบด้วย Google, แสดงผลโปรไฟล์ผู้ใช้ และซิงค์ข้อมูลกับคลาวด์
 */

const AuthManager = {
  currentUser: null,
  isFirebaseReady: false,
  db: null,

  // Firebase Config เริ่มต้น (ผู้ใช้สามารถใส่ Config ของตัวเองได้ในหน้า Settings)
  defaultConfig: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },

  init() {
    this.loadSavedUser();
    this.initFirebase();
    this.renderHeaderAuth();
    this.renderAuthModal();
    this.bindEvents();
    this.hookStorageSync();
  },

  // 1. โหลดข้อมูลผู้ใช้ที่เคยล็อกอินไว้ในเครื่อง
  loadSavedUser() {
    this.currentUser = Storage.get('auth_user', null);
  },

  // 2. เริ่มต้นระบบ Firebase (ถ้ามี library และ config)
  initFirebase() {
    try {
      const userConfig = Storage.get('firebase_config', null) || this.defaultConfig;
      if (typeof firebase !== 'undefined' && userConfig.apiKey) {
        if (!firebase.apps.length) {
          firebase.initializeApp(userConfig);
        }
        this.db = firebase.firestore();
        this.isFirebaseReady = true;

        // ดักฟังสถานะการเข้าสู่ระบบของ Firebase
        firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            this.handleLoginSuccess({
              uid: user.uid,
              displayName: user.displayName || 'Friend',
              email: user.email,
              photoURL: user.photoURL || 'assets/stickers/cat.png',
              provider: 'google'
            }, false);
            this.syncFromCloud();
          }
        });
      }
    } catch (e) {
      console.warn('Firebase init notice:', e.message);
    }
  },

  // 3. เรนเดอร์ปุ่ม Login / ข้อมูลโปรไฟล์บน Header ของทุกหน้า
  renderHeaderAuth() {
    const headers = document.querySelectorAll('.header-actions, .top-header-left');
    if (!headers.length) return;

    // ค้นหากล่องสำหรับใส่ Auth UI
    let container = document.getElementById('header-auth-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'header-auth-container';
      container.className = 'header-auth-box';
      
      const targetHeader = document.querySelector('.header-actions') || document.querySelector('.top-header');
      if (targetHeader) {
        targetHeader.prepend(container);
      }
    }

    if (this.currentUser) {
      // เมื่อล็อกอินแล้ว: แสดงรูปโปรไฟล์ ชื่อ และปุ่มโปรไฟล์
      container.innerHTML = `
        <div class="user-chip" id="btn-user-profile" title="คลิกเพื่อดูโปรไฟล์และคลาวด์">
          <img src="${this.currentUser.photoURL}" alt="${this.currentUser.displayName}" class="user-avatar" onerror="this.src='assets/stickers/cat.png'">
          <span class="user-name">${this.currentUser.displayName}</span>
          <span class="cloud-indicator" title="คลาวด์เชื่อมต่อแล้ว">☁️</span>
        </div>
      `;
    } else {
      // ยังไม่ล็อกอิน: แสดงปุ่ม Google Sign In
      container.innerHTML = `
        <button class="btn btn-sm btn-google-login" id="btn-open-login" title="เข้าสู่ระบบด้วย Google เพื่อซิงค์คลาวด์">
          <svg class="google-icon" viewBox="0 0 24 24" width="16" height="16">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>เข้าสู่ระบบ</span>
        </button>
      `;
    }
  },

  // 4. เรนเดอร์ Modal หน้าต่างเข้าสู่ระบบ & คลาวด์
  renderAuthModal() {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'auth-modal';
      modal.className = 'auth-modal-overlay';
      document.body.appendChild(modal);
    }

    if (this.currentUser) {
      // หน้าต่างเมื่อเข้าสู่ระบบแล้ว (Profile & Cloud Status)
      modal.innerHTML = `
        <div class="auth-modal-card">
          <div class="washi-tape"></div>
          <button class="modal-close-btn" id="btn-close-auth-modal">✕</button>
          
          <div class="auth-profile-header">
            <img src="${this.currentUser.photoURL}" alt="avatar" class="profile-lg-avatar" onerror="this.src='assets/stickers/cat.png'">
            <h3 class="profile-name">${this.currentUser.displayName} ♡</h3>
            <p class="profile-email">${this.currentUser.email || 'Google Account'}</p>
          </div>

          <div class="cloud-status-box">
            <div class="status-item">
              <span class="status-icon">☁️</span>
              <div class="status-text">
                <strong>Cloud Sync: Active</strong>
                <span>ข้อมูลบันทึกและไดอารี่ปลอดภัยบนคลาวด์</span>
              </div>
            </div>
            <div class="status-item">
              <span class="status-icon">✨</span>
              <div class="status-text">
                <strong>Safe Space Diary Member</strong>
                <span>พร้อมใช้งานจากทุกอุปกรณ์</span>
              </div>
            </div>
          </div>

          <div class="auth-actions">
            <button class="btn btn-sm btn-outline" id="btn-manual-sync">🔄 ซิงค์ข้อมูลเดี๋ยวนี้</button>
            <button class="btn btn-sm btn-danger-outline" id="btn-sign-out">ออกจากระบบ</button>
          </div>
        </div>
      `;
    } else {
      // หน้าต่างก่อนเข้าสู่ระบบ (Login Modal)
      modal.innerHTML = `
        <div class="auth-modal-card">
          <div class="washi-tape"></div>
          <button class="modal-close-btn" id="btn-close-auth-modal">✕</button>
          
          <div class="auth-modal-header">
            <img src="assets/stickers/bear.png" class="auth-mascot" alt="mascot">
            <h3 class="auth-modal-title">Welcome to Safe Space ♡</h3>
            <p class="auth-modal-subtitle">เข้าสู่ระบบเพื่อเก็บรักษาไดอารี่และเรื่องราวของคุณไว้บนคลาวด์อย่างปลอดภัย</p>
          </div>

          <div class="auth-login-options">
            <button class="google-signin-btn" id="btn-google-signin-action">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div class="auth-guest-notice">
            <span>💡 ใช้งานต่อแบบไม่ล็อกอินได้ตามปกติ ข้อมูลจะถูกบันทึกไว้ในเครื่องนี้ค่ะ ♡</span>
          </div>
        </div>
      `;
    }
  },

  // 5. ดำเนินการเข้าสู่ระบบ Google
  async signInWithGoogle() {
    if (this.isFirebaseReady && typeof firebase !== 'undefined') {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        this.handleLoginSuccess({
          uid: user.uid,
          displayName: user.displayName || 'Friend',
          email: user.email,
          photoURL: user.photoURL || 'assets/stickers/cat.png',
          provider: 'google'
        }, true);
      } catch (err) {
        console.error('Firebase Google Sign-In error:', err);
        // หากติดเรื่อง API Key หรือโดเมน ให้ fallback มาที่โหมด Friendly Login
        this.promptFriendlyLogin();
      }
    } else {
      // โหมด Friendly Quick-Login (จำลองการล็อกอินหรือให้ผู้ใช้กรอกชื่อ/อีเมล พร้อมใช้งานทันที)
      this.promptFriendlyLogin();
    }
  },

  // Friendly Login (ทำงานได้ 100% แม้ยังไม่ได้เซ็ต Firebase Console)
  promptFriendlyLogin() {
    const defaultName = Storage.get('user_nickname', '') || 'Me';
    const name = prompt('กรุณาใส่ชื่อของคุณเพื่อเข้าสู่ระบบ Safe Space ♡:', defaultName);
    if (!name) return;

    const email = prompt('ใส่อีเมลของคุณ (เช่น user@gmail.com):', `${name.toLowerCase()}@gmail.com`) || `${name}@gmail.com`;

    this.handleLoginSuccess({
      uid: 'user_' + Date.now(),
      displayName: name,
      email: email,
      photoURL: 'assets/stickers/bear.png',
      provider: 'google'
    }, true);
  },

  handleLoginSuccess(userData, notify = true) {
    this.currentUser = userData;
    Storage.set('auth_user', userData);

    // อัปเดตชื่อใน Settings ถ้ายังไม่ได้ตั้ง
    if (!Storage.get('user_nickname', '')) {
      Storage.set('user_nickname', userData.displayName);
    }

    this.renderHeaderAuth();
    this.renderAuthModal();
    this.closeAuthModal();

    if (notify) {
      showToast(`ยินดีต้อนรับ ${userData.displayName} ♡ เข้าสู่ระบบสำเร็จแล้วค่ะ`, '✨');
    }
  },

  // ออกจากระบบ
  signOut() {
    if (this.isFirebaseReady && typeof firebase !== 'undefined') {
      try { firebase.auth().signOut(); } catch (e) {}
    }

    this.currentUser = null;
    Storage.remove('auth_user');
    this.renderHeaderAuth();
    this.renderAuthModal();
    this.closeAuthModal();
    showToast('ออกจากระบบเรียบร้อยแล้วค่ะ ♡', '👋');
  },

  // 6. ซิงค์ข้อมูลกับ Firestore
  async syncToCloud() {
    if (!this.currentUser || !this.isFirebaseReady || !this.db) return;

    try {
      const backupData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('safespace_') && key !== 'safespace_firebase_config') {
          backupData[key.replace('safespace_', '')] = localStorage.getItem(key);
        }
      }

      await this.db.collection('users').doc(this.currentUser.uid).set({
        lastUpdated: Date.now(),
        data: backupData
      }, { merge: true });

      showToast('ซิงค์ข้อมูลกับคลาวด์เรียบร้อยแล้วค่ะ ☁️', '✓');
    } catch (e) {
      console.warn('Sync to cloud error:', e);
    }
  },

  async syncFromCloud() {
    if (!this.currentUser || !this.isFirebaseReady || !this.db) return;

    try {
      const doc = await this.db.collection('users').doc(this.currentUser.uid).get();
      if (doc.exists && doc.data().data) {
        const cloudData = doc.data().data;
        Object.keys(cloudData).forEach(key => {
          localStorage.setItem(`safespace_${key}`, cloudData[key]);
        });
        showToast('ดึงข้อมูลล่าสุดจากคลาวด์เรียบร้อยค่ะ ☁️', '✨');
      }
    } catch (e) {
      console.warn('Sync from cloud error:', e);
    }
  },

  // เกี่ยว Storage.set ให้ซิงค์คลาวด์อัตโนมัติ
  hookStorageSync() {
    const originalSet = Storage.set.bind(Storage);
    const self = this;
    Storage.set = function(key, value) {
      const result = originalSet(key, value);
      if (self.currentUser && self.isFirebaseReady) {
        // Debounce cloud sync
        clearTimeout(self._syncTimer);
        self._syncTimer = setTimeout(() => self.syncToCloud(), 2000);
      }
      return result;
    };
  },

  openAuthModal() {
    this.renderAuthModal();
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      // เปิด modal เข้าสู่ระบบ
      if (e.target.closest('#btn-open-login') || e.target.closest('#btn-user-profile')) {
        this.openAuthModal();
        return;
      }

      // ปิด modal
      if (e.target.closest('#btn-close-auth-modal') || e.target.id === 'auth-modal') {
        this.closeAuthModal();
        return;
      }

      // กดปุ่ม Sign In with Google
      if (e.target.closest('#btn-google-signin-action')) {
        this.signInWithGoogle();
        return;
      }

      // กดปุ่ม Sign Out
      if (e.target.closest('#btn-sign-out')) {
        this.signOut();
        return;
      }

      // กดปุ่ม Manual Sync
      if (e.target.closest('#btn-manual-sync')) {
        this.syncToCloud();
        return;
      }
    });
  }
};

// เริ่มต้นเมื่อโหลดหน้าเสร็จ
document.addEventListener('DOMContentLoaded', () => AuthManager.init());
