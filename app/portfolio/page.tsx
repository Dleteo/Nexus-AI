import { redirect } from "next/navigation";
import { isSiteLanguage, portfolioPath } from "../../data/site-languages";

// Keep existing bookmarks working while presenting one current portfolio.
export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { lang } = await searchParams;
  redirect(portfolioPath(typeof lang === "string" && isSiteLanguage(lang) ? lang : "es"));
}
