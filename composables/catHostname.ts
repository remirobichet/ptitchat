function stripPort(hostname: string): string {
  if (!hostname) {
    return "";
  }

  const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");

  if (normalized.startsWith("[")) {
    const ipv6End = normalized.indexOf("]");
    return ipv6End === -1 ? normalized : normalized.slice(1, ipv6End);
  }

  const [withoutPort] = normalized.split(":");
  return withoutPort || "";
}

function extractPort(hostname: string): string {
  if (!hostname) {
    return "";
  }

  const trimmed = hostname.trim();

  if (trimmed.startsWith("[")) {
    const ipv6End = trimmed.indexOf("]");
    if (ipv6End === -1) {
      return "";
    }

    if (trimmed[ipv6End + 1] !== ":") {
      return "";
    }

    return trimmed.slice(ipv6End + 2);
  }

  const parts = trimmed.split(":");
  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1] || "";
}

function shouldAppendPort(port: string, protocol: string): boolean {
  if (!port) {
    return false;
  }

  if (
    (protocol === "http:" && port === "80") ||
    (protocol === "https:" && port === "443")
  ) {
    return false;
  }

  return true;
}

function isIpAddress(value: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
}

function normalizeBaseDomain(baseDomain: string): string {
  return stripPort(baseDomain);
}

export function extractCatSlugFromHostname(
  hostname: string,
  baseDomain: string,
): string | null {
  const normalizedHost = stripPort(hostname);

  if (
    !normalizedHost ||
    normalizedHost === "localhost" ||
    isIpAddress(normalizedHost)
  ) {
    return null;
  }

  const normalizedBaseDomain = normalizeBaseDomain(baseDomain);

  if (normalizedBaseDomain) {
    if (normalizedHost === normalizedBaseDomain) {
      return null;
    }

    if (!normalizedHost.endsWith(`.${normalizedBaseDomain}`)) {
      return null;
    }

    const label = normalizedHost.slice(
      0,
      normalizedHost.length - normalizedBaseDomain.length - 1,
    );
    const slug = label.split(".")[0] || "";
    return slug && slug !== "www" ? slug : null;
  }

  const labels = normalizedHost.split(".");
  if (labels.length < 3) {
    return null;
  }

  const slug = labels[0] || "";
  return slug && slug !== "www" ? slug : null;
}

export function buildCatPublicUrl(
  catSlug: string,
  hostname: string,
  protocol: string,
  baseDomain: string,
): string {
  const normalizedSlug = catSlug.trim().toLowerCase();
  if (!normalizedSlug) {
    return "";
  }

  const safeProtocol = protocol || "https:";
  const normalizedHost = stripPort(hostname);
  const port = extractPort(hostname);
  const portSuffix = shouldAppendPort(port, safeProtocol) ? `:${port}` : "";
  const normalizedBaseDomain = normalizeBaseDomain(baseDomain);

  if (normalizedBaseDomain) {
    return `${safeProtocol}//${normalizedSlug}.${normalizedBaseDomain}${portSuffix}`;
  }

  if (
    !normalizedHost ||
    normalizedHost === "localhost" ||
    isIpAddress(normalizedHost)
  ) {
    return "";
  }

  const labels = normalizedHost.split(".");
  if (labels.length < 2) {
    return "";
  }

  const parentDomain = labels.slice(-2).join(".");
  return `${safeProtocol}//${normalizedSlug}.${parentDomain}${portSuffix}`;
}
