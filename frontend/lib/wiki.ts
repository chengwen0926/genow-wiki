import { cache } from "react";
import { readWiki } from "./content.mjs";

export type WikiHeading = { level: number; text: string; id: string };
export type WikiTreeNode = {
  type: string; name: string; title: string; slug: string | null; children: WikiTreeNode[];
};
export type WikiPage = {
  slug: string; href: string; title: string; markdown: string;
  headings: WikiHeading[]; images: Record<string, { width?: number; height?: number }>;
  description: string; updatedAt: string | null;
};

export const getWiki = cache(async (): Promise<{ tree: WikiTreeNode[]; pages: WikiPage[] }> => readWiki());
