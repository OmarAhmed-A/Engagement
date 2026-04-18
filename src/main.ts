import "./style.css";

// ── Translations ──────────────────────────────────
const i18n: Record<string, Record<string, string>> = {
  ar: {
    tagline: "يسعدنا دعوتكم لحضور حفل خطوبة",
    name1: "عمر",
    name2: "بسنت",
    dateLabel: "التاريخ",
    dateValue: "الجمعة، ٢٤ أبريل ٢٠٢٦",
    dateTime: "الساعة ٥:٣٠ مساءً",
    locLabel: "المكان",
    locValue: "مركب جاردينيا",
    locSub: "أمام مستشفى السلام الدولي",
    mapLink: "عرض على خرائط جوجل",
    rsvpTitle: "تأكيد الحضور",
    rsvpSub: "يسعدنا مشاركتكم فرحتنا",
    formName: "الاسم",
    formNamePh: "أدخل اسمك الكامل",
    formGuests: "عدد الحضور",
    formSelect: "اختر",
    formPhone: "رقم الهاتف",
    formOpt: "(اختياري)",
    formPhonePh: "رقم هاتفك",
    formSubmit: "تأكيد الحضور",
    formSending: "جاري الإرسال...",
    okTitle: "شكراً لكم!",
    okBody: "نتطلع لرؤيتكم هناك.",
    errTitle: "حدث خطأ ما",
    errBody: "يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.",
    errRetry: "حاول مرة أخرى",
    artBtn: "عرض بطاقة الدعوة",
    artNote: "مرسومة يدوياً بكل حب",
    footer: "لا نستطيع الانتظار للاحتفال معكم",
  },
  en: {
    tagline: "You are cordially invited to the engagement of",
    name1: "Omar",
    name2: "Basant",
    dateLabel: "Date",
    dateValue: "Friday, April 24, 2026",
    dateTime: "at 5:30 PM",
    locLabel: "Location",
    locValue: "Gardenia Boat",
    locSub: "In front of Salam International Hospital",
    mapLink: "View on Google Maps",
    rsvpTitle: "RSVP",
    rsvpSub: "We would love to have you celebrate with us",
    formName: "Your Name",
    formNamePh: "Enter your full name",
    formGuests: "Number of Guests",
    formSelect: "Select",
    formPhone: "Phone Number",
    formOpt: "(optional)",
    formPhonePh: "Your phone number",
    formSubmit: "Confirm Attendance",
    formSending: "Sending…",
    okTitle: "Thank you!",
    okBody: "We look forward to seeing you there.",
    errTitle: "Something went wrong",
    errBody: "Please try again or contact us directly.",
    errRetry: "Try Again",
    artBtn: "View Our Invitation Art",
    artNote: "Hand-drawn with love",
    footer: "We can't wait to celebrate with you",
  },
};

let currentLang = "ar";

function setLang(lang: string) {
  currentLang = lang;
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === "ar" ? "rtl" : "ltr";

  const t = i18n[lang];
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n!;
    if (t[key] != null) el.textContent = t[key];
  });
  document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder!;
    if (t[key] != null) el.placeholder = t[key];
  });

  document.getElementById("langToggle")!.textContent = lang === "ar" ? "EN" : "عربي";
}

document.getElementById("langToggle")!.addEventListener("click", () => {
  setLang(currentLang === "ar" ? "en" : "ar");
});

// ── Fade-in on scroll ─────────────────────────────
const observer = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add("visible");
    }
  },
  { threshold: 0.1 },
);
document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

// ── Art modal ─────────────────────────────────────
const modal = document.getElementById("modal")!;
const openBtn = document.getElementById("openArt")!;
const closeBtn = document.getElementById("closeArt")!;

function openModal() {
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ── RSVP form ─────────────────────────────────────
//
// SETUP: Create a Google Sheet, open Extensions → Apps Script,
// paste the contents of google-apps-script.js, deploy as web app
// (execute as "Me", access "Anyone"), then paste the URL below.
//
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxztodSKdNKxaemWV5EtMUZFMVr2Yi5YGOzDOafbJ4Jyr2OFcPx0UiwNUs17ZCDm_e7FQ/exec";

const form = document.getElementById("rsvpForm") as HTMLFormElement;
const okMsg = document.getElementById("rsvpOk")!;
const errMsg = document.getElementById("rsvpErr")!;
const submitBtn = document.getElementById("submitBtn")!;
const retryBtn = document.getElementById("retryBtn")!;

// Hidden form → iframe. We wait for the about:blank load first,
// then submit, then resolve on the response load (or a timeout fallback).
function submitToSheet(data: Record<string, string>): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      if (hiddenForm.parentNode) hiddenForm.remove();
      if (iframe.parentNode) iframe.remove();
      resolve();
    };

    const iframe = document.createElement("iframe");
    iframe.name = "rsvp-" + Date.now();
    iframe.style.display = "none";

    const hiddenForm = document.createElement("form");
    hiddenForm.method = "POST";
    hiddenForm.action = SCRIPT_URL;
    hiddenForm.target = iframe.name;

    for (const [key, val] of Object.entries(data)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = val;
      hiddenForm.appendChild(input);
    }

    let submitted = false;
    iframe.addEventListener("load", () => {
      if (!submitted) {
        // First load = about:blank ready. Now submit.
        submitted = true;
        hiddenForm.submit();
        setTimeout(finish, 4000); // fallback if response load never fires
        return;
      }
      // Second load = Google responded.
      finish();
    });

    document.body.appendChild(hiddenForm);
    document.body.appendChild(iframe);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!SCRIPT_URL) {
    alert("RSVP endpoint not configured yet. See src/main.ts for setup instructions.");
    return;
  }

  const data = {
    name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
    guests: (form.elements.namedItem("guests") as HTMLSelectElement).value,
    phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
  };

  submitBtn.textContent = i18n[currentLang].formSending;
  submitBtn.setAttribute("disabled", "true");

  try {
    await submitToSheet(data);
    form.hidden = true;
    okMsg.hidden = false;
  } catch {
    form.hidden = true;
    errMsg.hidden = false;
  }
});

retryBtn.addEventListener("click", () => {
  errMsg.hidden = true;
  form.hidden = false;
  submitBtn.textContent = i18n[currentLang].formSubmit;
  submitBtn.removeAttribute("disabled");
});
