export function normalizeNigerianPhone(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("+234")) {
    const digits = trimmed.slice(4);
    if (/^[789]\d{9}$/.test(digits)) {
      return `+234${digits}`;
    }
    throw new Error("Invalid Nigerian phone number after +234 prefix");
  }
  if (trimmed.startsWith("234")) {
    const digits = trimmed.slice(3);
    if (/^[789]\d{9}$/.test(digits)) {
      return `+234${digits}`;
    }
    throw new Error("Invalid Nigerian phone number after 234 prefix");
  }
  if (trimmed.startsWith("0")) {
    const digits = trimmed.slice(1);
    if (/^[789]\d{9}$/.test(digits)) {
      return `+234${digits}`;
    }
    throw new Error("Invalid Nigerian phone number after 0 prefix");
  }
  if (/^[789]\d{9}$/.test(trimmed)) {
    return `+234${trimmed}`;
  }
  throw new Error(
    "Phone must be E.164 (+234XXXXXXXXXX), 0XXXXXXXXXX, or 10 digits starting with 7/8/9"
  );
}

export function isValidNigerianPhone(input: string): boolean {
  try {
    normalizeNigerianPhone(input);
    return true;
  } catch {
    return false;
  }
}
