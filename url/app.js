import Kernel from "../core/kernel.js";

Kernel.init();

const form = document.querySelector("#url-form");
const textInput = document.querySelector("#text-input");
const output = document.querySelector("#result-output");
const copyButton = document.querySelector("#copy-button");
const clearButton = document.querySelector("#clear-button");
const statusText = document.querySelector("#status-text");
const statusBadge = document.querySelector("#status-badge");
const signalDot = document.querySelector("#signal-dot");
let result = null;
let resultVersion = 0;
let copyResetTimer;

function setStatus(message, state = "idle") {
  statusText.textContent = message;
  statusBadge.textContent = state;
  statusBadge.className = "badge";
  signalDot.className = "signal-dot";
  if (state === "OK") {
    statusBadge.classList.add("ok");
  } else if (state === "ERROR") {
    statusBadge.classList.add("bad");
    signalDot.classList.add("bad");
  }
}

function resetCopyFeedback() {
  window.clearTimeout(copyResetTimer);
  copyButton.textContent = "Ergebnis kopieren";
  copyButton.classList.remove("is-copied", "is-error");
}

function resetResult() {
  result = null;
  resultVersion += 1;
  output.textContent = "Noch keine Umwandlung.";
  copyButton.disabled = true;
  resetCopyFeedback();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  resetResult();
  const decode = event.submitter?.value === "decode";
  if (textInput.value.length === 0) {
    setStatus("Bitte einen Text oder kodierten URL-Bestandteil eingeben.", "ERROR");
    return;
  }
  try {
    result = decode ? decodeURIComponent(textInput.value) : encodeURIComponent(textInput.value);
    output.textContent = result;
    copyButton.disabled = false;
    setStatus(decode ? "Text erfolgreich dekodiert." : "Text erfolgreich kodiert.", "OK");
  } catch {
    setStatus(decode
      ? "Ungültige URL-Kodierung: Bitte Prozentzeichen, Hex-Ziffern und UTF-8-Zeichenfolgen prüfen."
      : "Der Text enthält ein ungültiges Unicode-Zeichen und kann nicht kodiert werden.", "ERROR");
  }
});

textInput.addEventListener("input", () => {
  resetResult();
  setStatus("Bereit für die nächste Umwandlung.");
});

clearButton.addEventListener("click", () => {
  textInput.value = "";
  resetResult();
  setStatus("Bereit für die erste Umwandlung.");
  textInput.focus();
});

// URL-Text exakt kopieren; die gemeinsame Copy-Funktion entfernt Rand-Leerzeichen.
async function copyExactText(text) {
  if (navigator.clipboard?.writeText) {
    let timeout;
    try {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => {
          timeout = window.setTimeout(() => reject(new Error("Clipboard Timeout")), 800);
        }),
      ]);
      return;
    } catch {
      // Fallback wie in den bestehenden Core-Utilities.
    } finally {
      window.clearTimeout(timeout);
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  let copied;
  try {
    copied = document.execCommand("copy");
  } finally {
    textarea.remove();
    textInput.focus();
  }
  if (!copied) throw new Error("Kopieren wird von diesem Browser nicht unterstützt.");
}

copyButton.addEventListener("click", async () => {
  if (result === null) return;
  const version = resultVersion;
  let copied = false;
  try {
    await copyExactText(result);
    copied = true;
  } catch {
    // Der Benutzer kann das sichtbare Ergebnis weiterhin manuell kopieren.
  }
  if (version !== resultVersion) return;
  resetCopyFeedback();
  copyButton.textContent = copied ? "Kopiert" : "Kopieren fehlgeschlagen";
  copyButton.classList.add(copied ? "is-copied" : "is-error");
  copyResetTimer = window.setTimeout(resetCopyFeedback, 4000);
});
