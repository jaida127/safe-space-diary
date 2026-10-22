/**
 * QUOTES.JS - Safe Space ♡ (Revamped with 35+ Curated Healing Quotes)
 * คลังคำคมฮีลใจแท้จริง แบ่งเป็น 10 หมวดหมู่ อบอุ่น จริงใจ ปราศจาก Toxic Positivity
 */

const QuotesManager = {
  quotes: [
    // 1. Gentle Reminder (เตือนใจอย่างอ่อนโยน)
    {
      category: "Gentle Reminder",
      icon: "🌸",
      en: "You don’t have to have it all figured out today.",
      th: "ไม่เป็นไรนะ ถ้าวันนี้เรายังหาคำตอบให้กับทุกเรื่องไม่ได้"
    },
    {
      category: "Gentle Reminder",
      icon: "🌸",
      en: "You are allowed to have quiet days without feeling guilty.",
      th: "เรามีสิทธิ์ที่จะมีวันเงียบๆ โดยไม่ต้องรู้สึกผิดอะไรเลย"
    },
    {
      category: "Gentle Reminder",
      icon: "🌸",
      en: "You don't have to turn every feeling into a lesson.",
      th: "ไม่ต้องพยายามเปลี่ยนทุกความรู้สึกให้กลายเป็นบทเรียนหรอก แค่รู้สึกก็พอแล้ว"
    },
    {
      category: "Gentle Reminder",
      icon: "🌸",
      en: "Save a little softness for yourself at the end of the day.",
      th: "เผื่อความอ่อนโยนไว้ให้ตัวเองสักนิด ในตอนท้ายของแต่ละวันนะ"
    },

    // 2. Rest (การพักผ่อน)
    {
      category: "Rest",
      icon: "☁️",
      en: "Rest is not a reward you have to earn. It is a biological necessity.",
      th: "การพักผ่อนไม่ใช่รางวัลที่ต้องแลกมาด้วยความเหนื่อยล้า แต่มันคือสิ่งจำเป็นของชีวิต"
    },
    {
      category: "Rest",
      icon: "☁️",
      en: "Some days, simply being here and breathing is more than enough.",
      th: "บางวัน แค่ตื่นมา หายใจ และพาตัวเองผ่านวันไปได้ ก็ถือว่าเก่งมากแล้ว"
    },
    {
      category: "Rest",
      icon: "☁️",
      en: "The world can wait while you recharge your heart.",
      th: "โลกทั้งใบยังรอได้เสมอ ในตอนที่หัวใจของเธอต้องการเวลาชาร์จพลัง"
    },
    {
      category: "Rest",
      icon: "☁️",
      en: "Putting your phone down and closing your eyes is also progress.",
      th: "การวางมือถือลงแล้วหลับตาพักเงียบๆ ก็นับเป็นก้าวที่ดีเหมือนกัน"
    },

    // 3. Growth (การเติบโต)
    {
      category: "Growth",
      icon: "🌱",
      en: "Your pace is still a pace, no matter how small.",
      th: "จังหวะก้าวของเธอคือก้าวของเธอเอง จะช้าหรือเล็กแค่ไหนมันก็ยังพาไปข้างหน้าอยู่ดี"
    },
    {
      category: "Growth",
      icon: "🌱",
      en: "Keep going, even if today’s step is tiny.",
      th: "ก้าวต่อไปนะ แม้ว่าก้าวของวันนี้จะดูเล็กนิดเดียวก็ตาม"
    },
    {
      category: "Growth",
      icon: "🌱",
      en: "Roots grow quietly in the dark before flowers can bloom.",
      th: "รากไม้ค่อยๆ เติบโตอย่างเงียบเชียบในดินมืด ก่อนที่จะผลิบานเป็นดอกไม้สวยเสมอ"
    },
    {
      category: "Growth",
      icon: "🌱",
      en: "You are allowed to be both a masterpiece and a work in progress.",
      th: "เธอสามารถเป็นสิ่งที่งดงาม ไปพร้อมๆ กับการเป็นผลงานที่กำลังค่อยๆ ต่อเติมได้นะ"
    },

    // 4. Self-understanding (การเข้าใจตัวเอง)
    {
      category: "Self-understanding",
      icon: "🪞",
      en: "Your feelings are valid, even when you can’t find words for them.",
      th: "ทุกความรู้สึกที่เกิดขึ้นล้วนมีความหมาย แม้ในวันที่เรายังหาคำมาอธิบายมันไม่ได้"
    },
    {
      category: "Self-understanding",
      icon: "🪞",
      en: "It is okay to outgrow the things that once brought you comfort.",
      th: "ไม่เป็นไรเลย ถ้าวันหนึ่งเราจะเติบโตเกินกว่าสิ่งเดิมๆ ที่เคยให้ความสบายใจ"
    },
    {
      category: "Self-understanding",
      icon: "🪞",
      en: "Listening to your body is a form of deep wisdom.",
      th: "การรับฟังเสียงเตือนของร่างกายและจิตใจ คือความฉลาดในการดูแลตัวเอง"
    },

    // 5. Self-kindness (ความใจดีต่อตัวเอง)
    {
      category: "Self-kindness",
      icon: "🧸",
      en: "Talk to yourself the way you would comfort a dear friend.",
      th: "ลองพูดกับตัวเองด้วยน้ำเสียงเดียวกับที่เธอใช้ปลอบเพื่อนสนิทดูสิ"
    },
    {
      category: "Self-kindness",
      icon: "🧸",
      en: "You are worthy of patience, love, and quiet care.",
      th: "เธอคู่ควรกับการได้รับความอดทน ความรัก และการดูแลที่ทะนุถนอม"
    },
    {
      category: "Self-kindness",
      icon: "🧸",
      en: "Forgive yourself for what you didn’t know back then.",
      th: "ให้อภัยตัวเองสำหรับเรื่องที่เรายังไม่รู้ในอดีตเถอะนะ"
    },

    // 6. Difficult Days (วันที่ยากลำบาก)
    {
      category: "Difficult Days",
      icon: "🌧️",
      en: "A bad chapter does not mean your whole story is broken.",
      th: "บทที่ยากบทหนึ่งในชีวิต ไม่ได้แปลว่าหนังสือทั้งเล่มจะพังลงสักหน่อย"
    },
    {
      category: "Difficult Days",
      icon: "🌧️",
      en: "It’s okay to cry. Tears are just the heart letting out what’s too heavy.",
      th: "ร้องไห้ออกมาได้นะ น้ำตาก็แค่วิธีที่หัวใจระบายสิ่งที่หนักอึ้งเกินไปออกมา"
    },
    {
      category: "Difficult Days",
      icon: "🌧️",
      en: "Even storms run out of rain eventually.",
      th: "แม้แต่พายุที่โหมกระหน่ำ สุดท้ายฝนก็ต้องหยุดตกอยู่ดี"
    },
    {
      category: "Difficult Days",
      icon: "🌧️",
      en: "Hold on gently. Tomorrow brings another sunrise.",
      th: "อดทนไว้อย่างนุ่มนวลนะ เดี๋ยวพรุ่งนี้แสงอาทิตย์ก็ส่องมาใหม่แล้ว"
    },

    // 7. Hope (ความหวัง)
    {
      category: "Hope",
      icon: "✨",
      en: "There is still so much kindness waiting to meet you in this life.",
      th: "ยังมีเรื่องราวและผู้คนที่แสนอ่อนโยนอีกมากมาย กำลังรอพบเธออยู่ในชีวิตนี้"
    },
    {
      category: "Hope",
      icon: "✨",
      en: "Some of your best and coziest memories haven’t happened yet.",
      th: "ความทรงจำที่อบอุ่นและมีความสุขที่สุด บางอย่างยังไม่เกิดขึ้นเลยนะ"
    },
    {
      category: "Hope",
      icon: "✨",
      en: "After the rain, the air always smells of fresh beginnings.",
      th: "หลังฝนซา อากาศจะอบอวลไปด้วยกลิ่นของจุดเริ่มต้นใหม่เสมอ"
    },

    // 8. Comparing Yourself (การหยุดเปรียบเทียบ)
    {
      category: "Comparing Yourself",
      icon: "🌷",
      en: "You don’t need to catch up with anyone. You have your own season.",
      th: "เธอไม่ต้องวิ่งตามใครให้ทันหรอก ดอกไม้แต่ละชนิดมีฤดูกาลผลิบานของตัวเอง"
    },
    {
      category: "Comparing Yourself",
      icon: "🌷",
      en: "Your journey is allowed to look completely different.",
      th: "เส้นทางของเธอมีสิทธิ์ที่จะดูแปลกและแตกต่างจากคนอื่นได้เลย"
    },
    {
      category: "Comparing Yourself",
      icon: "🌷",
      en: "Flowers don’t compare themselves to the one next to them; they just bloom.",
      th: "ดอกไม้ไม่เคยเทียบความสวยกับดอกไม้ข้างๆ มันแค่ทำหน้าที่เบ่งบานในแบบของมัน"
    },

    // 9. Dreams (ความฝัน)
    {
      category: "Dreams",
      icon: "🌙",
      en: "Dreams can grow slowly, too. They don't have to rush.",
      th: "ความฝันค่อยๆ เติบโตอย่างช้าๆ ก็ได้ ไม่จำเป็นต้องรีบร้อนเลย"
    },
    {
      category: "Dreams",
      icon: "🌙",
      en: "Protect the little spark inside you that still believes in warm things.",
      th: "รักษาประกายไฟดวงเล็กๆ ในใจที่ยังคงเชื่อในสิ่งดีๆ เอาไว้ให้ดีนะ"
    },
    {
      category: "Dreams",
      icon: "🌙",
      en: "Every big dream was once just a quiet thought in someone's diary.",
      th: "ทุกความฝันที่ยิ่งใหญ่ ล้วนเคยเป็นเพียงบันทึกเงียบๆ บรรทัดหนึ่งในไดอารี่ทั้งนั้น"
    },

    // 10. Little Joys (ความสุขเล็กๆ)
    {
      category: "Little Joys",
      icon: "🎀",
      en: "Maybe today’s little joy is enough.",
      th: "บางทีแค่ความสุขเล็กๆ เรื่องเดียวในวันนี้ มันก็เพียงพอแล้วนะ"
    },
    {
      category: "Little Joys",
      icon: "🎀",
      en: "Notice the little things. They quietly become the biggest memories.",
      th: "สังเกตเรื่องเล็กๆ รอบตัวดูนะ สักวันมันจะกลายเป็นความทรงจำที่อบอุ่นที่สุด"
    },
    {
      category: "Little Joys",
      icon: "🎀",
      en: "A warm drink, a soft blanket, and a moment of peace.",
      th: "เครื่องดื่มอุ่นๆ ผ้าห่มนุ่มๆ และช่วงเวลาที่ใจได้พักผ่อน"
    },
    {
      category: "Little Joys",
      icon: "🎀",
      en: "You deserve moments that feel like home.",
      th: "เธอคู่ควรกับทุกช่วงเวลาที่ทำให้รู้สึกอบอุ่นเหมือนได้กลับบ้าน ♡"
    }
  ],

  currentIndex: 0,

  // คำนวณคำคมประจำวันจากวันที่ (Deterministic Daily Quote)
  getDailyQuote() {
    const today = new Date();
    const daySeed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 50 + today.getDate();
    this.currentIndex = daySeed % this.quotes.length;
    return this.quotes[this.currentIndex];
  },

  // สุ่มคำคมใหม่ (♡ Another reminder)
  getRandomQuote() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.quotes.length);
    } while (newIndex === this.currentIndex && this.quotes.length > 1);

    this.currentIndex = newIndex;
    return this.quotes[this.currentIndex];
  },

  // แสดงคำคมบนหน้าจอพร้อมแอนิเมชัน Fade แบบนุ่มนวล
  renderQuote(quote) {
    const container = document.getElementById('quote-content');
    const categoryEl = document.getElementById('quote-category-tag');
    if (!container) return;

    // Fade out
    container.style.opacity = '0';
    container.style.transform = 'translateY(4px)';

    setTimeout(() => {
      container.innerHTML = `
        <p class="quote-text-en">“${quote.en}”</p>
        <p class="quote-text-th">“${quote.th}”</p>
      `;

      if (categoryEl) {
        categoryEl.innerHTML = `<span>${quote.icon}</span> <span>${quote.category}</span>`;
      }

      // Fade in
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 220);
  },

  init() {
    const initialQuote = this.getDailyQuote();
    this.renderQuote(initialQuote);

    const btn = document.getElementById('btn-new-quote');
    if (btn) {
      btn.addEventListener('click', () => {
        const newQuote = this.getRandomQuote();
        this.renderQuote(newQuote);
      });
    }
  }
};
