import { NextResponse } from "next/server";
import { COUNTRIES, outboundLink, type Country } from "@supplement/engine";
import { prisma } from "@supplement/db";

export const dynamic = "force-dynamic";

/**
 * Buy-link redirect: /go/<productId>?c=<country>.
 * Looks the link up in the catalog (so it can't be used to redirect anywhere
 * else), adds the affiliate code if a program covers that shop, counts the
 * click anonymously, and sends the browser on.
 */
export async function GET(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const c = new URL(request.url).searchParams.get("c")?.toUpperCase();
  const country = (COUNTRIES as readonly string[]).includes(c ?? "") ? (c as Country) : null;
  // Relative Location: behind a proxy request.url can carry an internal host.
  const home = () => new Response(null, { status: 307, headers: { Location: "/" } });
  if (!country || productId.length > 64) return home();

  const price = await prisma.productPrice.findUnique({
    where: { productId_country: { productId, country } },
    include: { product: { select: { active: true, supplement: { select: { slug: true } } } } },
  });
  if (!price?.url || !price.product.active) return home();

  const programs = await prisma.affiliateProgram.findMany({ where: { enabled: true } });
  const { href, affiliate } = outboundLink(price.url, programs, `sukat_${price.product.supplement.slug}`);

  let host = "";
  try {
    host = new URL(price.url).hostname.replace(/^www\./, "");
  } catch {
    return home();
  }
  // Anonymous: which product and shop, nothing about the person.
  prisma.outboundClick
    .create({ data: { productId, country, host, affiliate } })
    .catch((e: unknown) => console.error("[outbound-click]", e));

  const res = NextResponse.redirect(href, 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
