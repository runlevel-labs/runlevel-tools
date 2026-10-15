const maxMilliseconds = 8640000000000000n;

export function timestampToDate(value, unit) {
  const text = String(value).trim();
  if (!text || text.length > 32) throw new Error("Bitte einen gültigen Unix-Zeitstempel eingeben.");
  let milliseconds;
  if (unit === "milliseconds") {
    if (!/^[+-]?\d+$/.test(text)) throw new Error("Millisekunden müssen eine ganze Zahl sein.");
    milliseconds = BigInt(text);
  } else if (unit === "seconds") {
    const match = /^([+-]?)(\d+)(?:[.,](\d{1,3}))?$/.exec(text);
    if (!match) throw new Error("Sekunden als Zahl mit höchstens drei Nachkommastellen eingeben.");
    milliseconds = BigInt(match[2]) * 1000n + BigInt((match[3] || "").padEnd(3, "0"));
    if (match[1] === "-") milliseconds = -milliseconds;
  } else {
    throw new Error("Bitte Sekunden oder Millisekunden wählen.");
  }
  if (milliseconds < -maxMilliseconds || milliseconds > maxMilliseconds) {
    throw new Error("Der Zeitstempel liegt außerhalb des unterstützten Datumsbereichs.");
  }
  return new Date(Number(milliseconds));
}

export function dateInputToDate(value, zone) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(String(value));
  if (!match) throw new Error("Bitte ein vollständiges Datum mit Uhrzeit eingeben.");
  if (zone !== "utc" && zone !== "local") throw new Error("Bitte UTC oder lokale Zeit wählen.");
  const parts = [Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6] || 0), Number((match[7] || "").padEnd(3, "0"))];
  const [year, month, day, hour, minute, second, millisecond] = parts;
  if (year < 1 || month < 0 || month > 11 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    throw new Error("Bitte einen gültigen Kalendertag und eine gültige Uhrzeit eingeben.");
  }
  const date = new Date(0);
  if (zone === "utc") {
    date.setUTCFullYear(year, month, day);
    date.setUTCHours(hour, minute, second, millisecond);
  } else {
    date.setFullYear(year, month, day);
    date.setHours(hour, minute, second, millisecond);
  }
  const actual = zone === "utc"
    ? [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()]
    : [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
  if (parts.some((part, index) => part !== actual[index])) {
    throw new Error("Das Datum ist ungültig oder diese lokale Uhrzeit existiert wegen einer Zeitumstellung nicht.");
  }
  return date;
}

export function formatSeconds(milliseconds) {
  const value = BigInt(milliseconds);
  const absolute = value < 0n ? -value : value;
  const fraction = String(absolute % 1000n).padStart(3, "0").replace(/0+$/, "");
  return (value < 0n ? "-" : "") + String(absolute / 1000n) + (fraction ? "." + fraction : "");
}
