/* ===== 博客系统 TypeScript 类型定义 ===== */

/* ===== 文章类型 ===== */
export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  category: { name: string } | null;
  tags: { id: string; name: string }[];
  author: { username: string; avatar: string | null } | null;
  created_at: string;
  view_count: number;
  author_id: number;
}

export interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl?: string;
  category: string;
  tags: string[];
  lang?: string;
  author: { name: string; avatarUrl?: string };
  createdAt: string;
  viewCount: number;
  readingTime: number;
}
