const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8002";

export type WikiTreeNode = {
  type: "directory" | "page";
  name: string;
  title: string;
  slug: string | null;
  children: WikiTreeNode[];
};

export type WikiTreeResponse = {
  tree: WikiTreeNode[];
  default_slug: string | null;
};

export type WikiHeading = {
  level: number;
  text: string;
  id: string;
};

export type WikiPageResponse = {
  slug: string;
  title: string;
  content: string;
  headings: WikiHeading[];
  updated_at: number;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchWikiTree(): Promise<WikiTreeResponse> {
  const response = await fetch(`${API_URL}/api/wiki/tree`, {
    cache: "no-store",
  });
  return parseResponse<WikiTreeResponse>(response);
}

export async function fetchWikiPage(slug: string): Promise<WikiPageResponse> {
  const encodedSlug = slug.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${API_URL}/api/wiki/page/${encodedSlug}`, {
    cache: "no-store",
  });
  return parseResponse<WikiPageResponse>(response);
}
