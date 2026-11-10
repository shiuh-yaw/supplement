import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyAffiliate, findAffiliateProgram, outboundLink, validateAffiliateProgram } from "./affiliate";

const shopee = { host: "shopee.com.my", template: "https://s.shopee.com.my/an_redir?origin_link={url}&affiliate_id=123&sub_id={sub}", enabled: true };
const iherb = { host: "iherb.com", template: "rcode=ABC123", enabled: true };
const off = { host: "lazada.com.my", template: "https://c.lazada.com.my/t/c.X?url={url}", enabled: false };

describe("affiliate links", () => {
  it("wraps the product URL in the template, encoded", () => {
    const url = "https://shopee.com.my/product/1/2?x=1&y=2";
    expect(applyAffiliate(url, shopee, "sukat_protein")).toBe(
      `https://s.shopee.com.my/an_redir?origin_link=${encodeURIComponent(url)}&affiliate_id=123&sub_id=sukat_protein`,
    );
  });

  it("adds parameters to the product URL", () => {
    expect(applyAffiliate("https://sg.iherb.com/pr/x?y=1", iherb)).toBe("https://sg.iherb.com/pr/x?y=1&rcode=ABC123");
  });

  it("matches subdomains and the most specific host, and skips disabled programs", () => {
    const broad = { host: "iherb.com", template: "rcode=A", enabled: true };
    const narrow = { host: "sg.iherb.com", template: "rcode=B", enabled: true };
    expect(findAffiliateProgram("https://sg.iherb.com/pr/1", [broad, narrow])).toBe(narrow);
    expect(findAffiliateProgram("https://www.lazada.com.my/p", [off])).toBeNull();
    expect(findAffiliateProgram("https://notshopee.com.my/p", [shopee])).toBeNull();
    expect(outboundLink("https://www.lazada.com.my/p", [off])).toEqual({ href: "https://www.lazada.com.my/p", affiliate: false });
  });

  it("never rewrites to a non-https template or unsafe URL", () => {
    expect(validateAffiliateProgram({ host: "shopee.com.my", template: "http://evil.example/{url}" })).not.toHaveLength(0);
    expect(validateAffiliateProgram({ host: "shopee.com.my", template: "https://x.example/no-url" })).not.toHaveLength(0);
    expect(validateAffiliateProgram({ host: "not a host", template: "a=b" })).not.toHaveLength(0);
    expect(validateAffiliateProgram({ host: "https://www.Shopee.com.my/", template: "a=b" })).toEqual([]);
    expect(applyAffiliate("javascript:alert(1)", shopee)).toBe("javascript:alert(1)");
    expect(outboundLink("javascript:alert(1)", [shopee]).affiliate).toBe(false);
  });

  it("is never used by the recommendation engine", () => {
    for (const file of ["recommend.ts", "ranking.ts", "dosing.ts", "conditions.ts"]) {
      const src = readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
      expect(src, file).not.toMatch(/affiliate/i);
    }
  });
});
