export function processJSON(value, mode = "pretty") {
  const text = String(value);
  if (!text.trim()) throw new Error("Bitte JSON eingeben.");
  if (text.length > 1000000) throw new Error("Die Eingabe ist zu groß. Maximal 1.000.000 Zeichen sind möglich.");
  if (!["check", "pretty", "compact"].includes(mode)) throw new Error("Bitte Prüfen, Formatieren oder Kompakt wählen.");
  try {
    JSON.parse(text);
  } catch (error) {
    throw new Error("Ungültiges JSON: " + error.message);
  }
  if (mode === "check") return text.trim();

  // Nur Leerraum außerhalb von Strings ändern; Zahlen und doppelte Schlüssel erhalten.
  const tokens = text.match(/"(?:\\[\s\S]|[^"\\])*"|[{}\[\],:]|[^\s{}\[\],:]+/g);
  if (mode === "compact") return tokens.join("");
  let depth = 0;
  const output = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "{" || token === "[") {
      depth += 1;
      if (depth > 256) throw new Error("Für die Formatierung sind maximal 256 Verschachtelungsebenen möglich.");
      output.push(token);
      if (tokens[index + 1] !== "}" && tokens[index + 1] !== "]") output.push("\n", "  ".repeat(depth));
    } else if (token === "}" || token === "]") {
      depth -= 1;
      if (tokens[index - 1] !== "{" && tokens[index - 1] !== "[") output.push("\n", "  ".repeat(depth));
      output.push(token);
    } else if (token === ",") {
      output.push(",\n", "  ".repeat(depth));
    } else if (token === ":") {
      output.push(": ");
    } else {
      output.push(token);
    }
  }
  return output.join("");
}
