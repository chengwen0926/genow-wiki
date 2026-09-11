import { getWiki } from "@/lib/wiki";
import { WikiPageView } from "@/components/WikiPageView";

export async function generateMetadata() {
  const { pages } = await getWiki();
  return { title: pages[0].title, description: pages[0].description };
}

export default async function HomePage() {
  const { tree, pages } = await getWiki();
  return <WikiPageView tree={tree} page={pages[0]} />;
}
