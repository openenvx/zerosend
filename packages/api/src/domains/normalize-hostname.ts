export function normalizeHostname(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}

export function parseEmailHost(address: string): string | null {
  const atIndex = address.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === address.length - 1) {
    return null;
  }

  return normalizeHostname(address.slice(atIndex + 1));
}
