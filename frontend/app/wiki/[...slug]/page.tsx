import { notFound } from "next/navigation";
import { getWiki } from "@/lib/wiki";
import { WikiPageView } from "@/components/WikiPageView";

export const dynamicParams = false;
type Props = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  return (await getWiki()).pages.map((page) => ({ slug: page.slug.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const slug = (await params).slug.join("/");
  const page = (await getWiki()).pages.find((page) => page.slug === slug);
  if (!page) notFound();
  return { title: page.title, description: page.description, robots: page.hidden ? { index: false, follow: true } : undefined };
}

export default async function ArticlePage({ params }: Props) {
  const slug = (await params).slug.join("/");
  const { tree, pages } = await getWiki();
  const page = pages.find((page) => page.slug === slug);
  if (!page) notFound();
  return <WikiPageView tree={tree} page={page} pages={pages} />;
}
