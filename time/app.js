import Kernel from "../core/kernel.js";
import { timestampToDate, dateInputToDate, formatSeconds } from "./converter.mjs";

Kernel.init();

const timestampForm = document.querySelector("#timestamp-form");
const dateForm = document.querySelector("#date-form");
const timestampInput = document.querySelector("#timestamp-input");
const unitInput = document.querySelector("#unit-input");
const dateInput = document.querySelector("#date-input");
const zoneInput = document.querySelector("#zone-input");
const statusText = document.querySelector("#status-text");
const statusBadge = document.querySelector("#status-badge");
const signalDot = document.querySelector("#signal-dot");
const copyButton = document.querySelector("#copy-button");
const summaryOutput = document.querySelector("#summary-output");
const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localFormatter = new Intl.DateTimeFormat("de-DE", {
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
  fractionalSecondDigits: 3, hourCycle: "h23", timeZoneName: "longOffset",
});
document.querySelector("#local-zone").textContent = localZone;
const fields = {
  seconds: document.querySelector("#result-seconds"),
  milliseconds: document.querySelector("#result-milliseconds"),
  utc: document.querySelector("#result-utc"),
  local: document.querySelector("#result-local"),
};

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
  Object.values(fields).forEach((field) => { field.textContent = "-"; });
  summaryOutput.textContent = "Noch keine Umwandlung.";
  copyButton.disabled = true;
  copyButton.textContent = "Ergebnis kopieren";
  copyButton.classList.remove("is-copied", "is-error");
}

function renderResult(date) {
  const milliseconds = date.getTime();
  fields.seconds.textContent = formatSeconds(milliseconds);
  fields.milliseconds.textContent = String(milliseconds);
  fields.utc.textContent = date.toISOString();
  fields.local.textContent = localFormatter.format(date) + " (" + localZone + ")";
  summaryOutput.textContent = [
    "Unix-Sekunden: " + fields.seconds.textContent,
    "Unix-Millisekunden: " + fields.milliseconds.textContent,
    "UTC: " + fields.utc.textContent,
    "Lokale Zeit: " + fields.local.textContent,
  ].join("\n");
  copyButton.disabled = false;
}

function convert(event, getDate) {
  event.preventDefault();
  resetResult();
  try {
    renderResult(getDate());
    setStatus("Umwandlung erfolgreich.", "OK");
  } catch (error) {
    resetResult();
    setStatus(error.message, "ERROR");
  }
}

timestampForm.addEventListener("submit", (event) => {
  convert(event, () => timestampToDate(timestampInput.value, unitInput.value));
});
dateForm.addEventListener("submit", (event) => {
  convert(event, () => dateInputToDate(dateInput.value, zoneInput.value));
});

[timestampInput, unitInput, dateInput, zoneInput].forEach((input) => {
  const event = input.tagName === "SELECT" ? "change" : "input";
  input.addEventListener(event, () => {
    resetResult();
    setStatus("Bereit für die nächste Umwandlung.");
  });
});

document.querySelector("#clear-button").addEventListener("click", () => {
  timestampForm.reset();
  dateForm.reset();
  resetResult();
  setStatus("Bereit für die erste Umwandlung.");
  timestampInput.focus();
});
