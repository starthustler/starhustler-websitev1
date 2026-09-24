export type DokuCredentialKind = "clientId" | "secretKey";

const credentialPattern = /^[A-Za-z0-9._~+/=-]+$/;

function valueAfterLabel(text: string, label: RegExp) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const match = line.match(label);
    if (!match) continue;

    const inlineValue = line.slice((match.index || 0) + match[0].length)
      .replace(/^[\s:=\-]+/, "")
      .trim()
      .split(/\s+/)[0];
    if (inlineValue && credentialPattern.test(inlineValue)) return inlineValue;

    const nextValue = lines.slice(index + 1).map(item => item.trim()).find(Boolean);
    if (nextValue) {
      const token = nextValue.split(/\s+/)[0];
      if (credentialPattern.test(token)) return token;
    }
  }
  return "";
}

export function extractDokuCredential(rawValue: string, kind: DokuCredentialKind) {
  const value = rawValue.trim();
  if (!value) return "";

  const labelledValue = kind === "clientId"
    ? valueAfterLabel(value, /(?:DOKU\s+)?Client(?:\s|-)?ID/i)
    : valueAfterLabel(value, /(?:Active\s+)?Secret(?:\s|-)?Key(?:\s*\(\d+\))?/i);
  if (labelledValue) return labelledValue;

  // The DOKU copy buttons place only the credential on the clipboard.
  if (!value.includes("\n") && !/\s/.test(value) && credentialPattern.test(value)) {
    return value;
  }
  return "";
}
