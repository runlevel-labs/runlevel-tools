import Kernel from "../core/kernel.js";
import { processJSON } from "./formatter.mjs";

Kernel.init();

const form = document.querySelector("#json-form");
const jsonInput = document.querySelector("#json-input");
const output = document.querySelector("#result-output");
const copyButton = document.querySelector("#copy-button");
const statusText = document.querySelector("#status-text");
const statusBadge = document.querySelector("#status-badge");
const signalDot = document.querySelector("#signal-dot");

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

function resetResult() {
  output.textContent = "Noch keine Prüfung.";
  copyButton.disabled = true;
  copyButton.textContent = "Ergebnis kopieren";
  copyButton.classList.remove("is-copied", "is-error");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  resetResult();
  const mode = event.submitter?.value || "pretty";
  try {
    output.textContent = processJSON(jsonInput.value, mode);
    copyButton.disabled = false;
    const message = mode === "check" ? "JSON ist gültig."
      : mode === "compact" ? "JSON ist gültig und wurde kompakt ausgegeben."
      : "JSON ist gültig und wurde formatiert.";
    setStatus(message, "OK");
  } catch (error) {
    setStatus(error.message, "ERROR");
  }
});

jsonInput.addEventListener("input", () => {
  resetResult();
  setStatus("Bereit für die nächste Prüfung.");
});

document.querySelector("#clear-button").addEventListener("click", () => {
  jsonInput.value = "";
  resetResult();
  setStatus("Bereit für die erste Prüfung.");
  jsonInput.focus();
});
