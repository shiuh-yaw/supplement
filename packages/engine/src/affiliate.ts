/**
 * Affiliate links. Applied only at the moment someone clicks a buy link
 * (the web app's /go route). Nothing in recommend(), filtering or ranking
 * imports this file: commission can never change which products are shown
 * or in what order.
 */

export interface AffiliateProgramConfig {
  /** Hostname the program covers, e.g. "shopee.com.my". Also matches subdomains. */
  host: string;
  /**
   * Either a link template starting with https:// that contains {url} (the
   * product URL, encoded) and optionally {sub} (a tracking label), or query
   * parameters to add to the product URL, e.g. "rcode=ABC123".
   */
  template: string;
  enabled: boolean;
}

const HOST_RE = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normaliseHost(host: string): string {
  return host.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}

/** Problems with a program's settings, for the backoffice form. Empty = valid. */
export function validateAffiliateProgram(p: { host: string; template: string }): string[] {
  const errors: string[] = [];
  const host = normaliseHost(p.host);
  if (!HOST_RE.test(host)) errors.push("Enter a hostname like shopee.com.my.");
  const t = p.template.trim();
  if (!t) {
    errors.push("Enter a link template or the parameters to add.");
  } else if (/^https?:\/\//i.test(t)) {
    if (!/^https:\/\//i.test(t)) errors.push("The link template must start with https://.");
    if (!t.includes("{url}")) errors.push("The link template must contain {url}.");
    try {
      new URL(t.replaceAll("{url}", "x").replaceAll("{sub}", "x"));
    } catch {
      errors.push("The link template isn't a valid URL.");
    }
  } else {
    const params = t.replace(/^[?&]/, "");
    if (!/^[\w.~-]+=[^&\s]*(&[\w.~-]+=[^&\s]*)*$/.test(params)) {
      errors.push("Parameters must look like name=value&other=value.");
    }
  }
  return errors;
}

function hostOf(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** The enabled program covering this URL's host (most specific host wins). */
export function findAffiliateProgram<P extends AffiliateProgramConfig>(url: string, programs: P[]): P | null {
  const host = hostOf(url);
  if (!host) return null;
  const matches = programs.filter((p) => {
    if (!p.enabled) return false;
    const h = normaliseHost(p.host);
    return host === h || host.endsWith(`.${h}`);
  });
  matches.sort((a, b) => normaliseHost(b.host).length - normaliseHost(a.host).length);
  return matches[0] ?? null;
}

/** Turns a product URL into its affiliate link. Invalid settings leave the URL unchanged. */
export function applyAffiliate(url: string, program: AffiliateProgramConfig, sub = "sukat"): string {
  if (!hostOf(url) || validateAffiliateProgram(program).length > 0) return url;
  const t = program.template.trim();
  if (/^https:\/\//i.test(t)) {
    return t.replaceAll("{url}", encodeURIComponent(url)).replaceAll("{sub}", encodeURIComponent(sub));
  }
  const u = new URL(url);
  for (const pair of t.replace(/^[?&]/, "").split("&")) {
    const [k, ...v] = pair.split("=");
    u.searchParams.set(k!, decodeURIComponent(v.join("=")).replaceAll("{sub}", sub));
  }
  return u.toString();
}

/** Final outbound link: the affiliate link when a program covers the host, else the plain URL. */
export function outboundLink(url: string, programs: AffiliateProgramConfig[], sub?: string): { href: string; affiliate: boolean } {
  const program = findAffiliateProgram(url, programs);
  if (!program) return { href: url, affiliate: false };
  const href = applyAffiliate(url, program, sub);
  return { href, affiliate: href !== url };
}
