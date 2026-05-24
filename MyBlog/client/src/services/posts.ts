import type { Post, PostListItem } from "../types";

/* ===== Vite 批量导入 Markdown 文章 ===== */
const modules = import.meta.glob("../content/posts/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

/* 解析 YAML frontmatter */
function parseFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>;
  content: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };

  const frontmatter: Record<string, unknown> = {};
  match[1].split("\n").forEach((line) => {
    const sep = line.indexOf(":");
    if (sep === -1) return;
    const key = line.slice(0, sep).trim();
    let val: unknown = line.slice(sep + 1).trim();
    /* 解析数组 */
    if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
      val = val.slice(1, -1).split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    }
    /* 去除引号 */
    if (typeof val === "string") val = val.replace(/^["']|["']$/g, "");
    frontmatter[key] = val;
  });

  return { frontmatter, content: match[2] };
}

/**
 * 获取所有文章列表，可选按语言过滤
 */
export async function getPosts(lang?: string): Promise<{ items: PostListItem[] }> {
  const entries = Object.entries(modules);
  const posts: PostListItem[] = [];

  for (const [, loader] of entries) {
    const raw = await loader();
    const { frontmatter, content } = parseFrontmatter(raw);
    const postLang = (frontmatter.lang as string) || "zh";
    if (lang && postLang !== lang) continue;
    const wordCount = content.replace(/[\s\n\r]+/g, " ").split(" ").filter(Boolean).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));
    posts.push({
      id: frontmatter.slug as string,
      slug: frontmatter.slug as string,
      title: frontmatter.title as string,
      excerpt: (frontmatter.excerpt as string) || "",
      coverUrl: (frontmatter.cover as string) || undefined,
      category: (frontmatter.category as string) || "未分类",
      tags: (frontmatter.tags as string[]) || [],
      lang: postLang,
      author: { name: "MyBlog" },
      createdAt: frontmatter.date as string,
      viewCount: 0,
      readingTime,
    });
  }

  posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { items: posts };
}

/**
 * 根据 slug 获取文章详情，可选按语言过滤
 */
export async function getPostBySlug(
  slug: string,
  lang?: string
): Promise<{ data: Post | null }> {
  const entries = Object.entries(modules);

  for (const [, loader] of entries) {
    const raw = await loader();
    const { frontmatter, content } = parseFrontmatter(raw);
    const postLang = (frontmatter.lang as string) || "zh";
    if (frontmatter.slug === slug && (!lang || postLang === lang)) {
      return {
        data: {
          id: frontmatter.slug as string,
          slug: frontmatter.slug as string,
          title: frontmatter.title as string,
          content,
          excerpt: (frontmatter.excerpt as string) || "",
          cover_image: (frontmatter.cover as string) || null,
          category: { name: (frontmatter.category as string) || "未分类" },
          tags: ((frontmatter.tags as string[]) || []).map((t: string) => ({
            id: t,
            name: t,
          })),
          author: { username: "MyBlog", avatar: null },
          created_at: frontmatter.date as string,
          view_count: 0,
          author_id: 0,
        },
      };
    }
  }

  return { data: null };
}
