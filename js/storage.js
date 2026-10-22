/**
 * STORAGE.JS - Safe Space ♡
 * จัดการข้อมูล LocalStorage อย่างเป็นระเบียบและปลอดภัย
 * สำหรับผู้เริ่มต้น: ฟังก์ชันนี้ช่วยให้เราบันทึกและอ่านข้อมูลจากเครื่องผู้ใช้ได้ง่ายๆ
 */

const Storage = {
  // บันทึกข้อมูลลง LocalStorage (แปลง Object เป็น JSON String อัตโนมัติ)
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`safespace_${key}`, serialized);
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },

  // ดึงข้อมูลจาก LocalStorage (แปลงกลับเป็น Object อัตโนมัติ หากไม่มีให้คืนค่า defaultValue)
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`safespace_${key}`);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return defaultValue;
    }
  },

  // ลบข้อมูลตาม key
  remove(key) {
    try {
      localStorage.removeItem(`safespace_${key}`);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage:', e);
      return false;
    }
  },

  // ล้างข้อมูลทั้งหมดของ Safe Space (ใช้ในหน้า Settings พร้อมการยืนยัน)
  clearAll() {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('safespace_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (e) {
      console.error('Error clearing localStorage:', e);
      return false;
    }
  }
};

/**
 * Toast Notification Helper
 * แสดงกล่องข้อความแจ้งเตือนเล็กๆ มุมขวาล่างแบบนุ่มนวล
 */
function showToast(message, icon = '✨') {
  let toastEl = document.getElementById('app-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'app-toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }

  toastEl.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  toastEl.classList.add('show');

  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }

  window.toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2800);
}
