import "./style.css";

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
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxztodSKdNKxaemWV5EtMUZFMVr2Yi5YGOzDOafbJ4Jyr2OFcPx0UiwNUs17ZCDm_e7FQ/exec"; // ← paste your Google Apps Script URL here

const form = document.getElementById("rsvpForm") as HTMLFormElement;
const okMsg = document.getElementById("rsvpOk")!;
const errMsg = document.getElementById("rsvpErr")!;
const submitBtn = document.getElementById("submitBtn")!;
const retryBtn = document.getElementById("retryBtn")!;

// Submit via hidden form → iframe (bypasses CORS entirely)
function submitToSheet(data: Record<string, string>): Promise<void> {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.name = "rsvp-frame";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Resolve as soon as Google responds (iframe finishes loading)
    iframe.addEventListener("load", () => {
      hiddenForm.remove();
      iframe.remove();
      resolve();
    });

    const hiddenForm = document.createElement("form");
    hiddenForm.method = "POST";
    hiddenForm.action = SCRIPT_URL;
    hiddenForm.target = "rsvp-frame";

    for (const [key, val] of Object.entries(data)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = val;
      hiddenForm.appendChild(input);
    }

    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
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

  submitBtn.textContent = "Sending…";
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
  submitBtn.textContent = "Confirm Attendance";
  submitBtn.removeAttribute("disabled");
});
