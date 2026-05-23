import { useEffect, useState } from "react";
import PostList from "../components/post/PostList";
import * as postService from "../services/posts";
import type { PostListItem } from "../types";

/**
 * 首页
 * 展示文章列表（从本地 Markdown 读取）
 */
export default function HomePage() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService.getPosts().then((res) => {
      setPosts(res.items);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          探索精彩内容
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          发现技术文章、分享编程心得、记录成长历程
        </p>
      </div>

      <PostList
        posts={posts}
        loading={loading}
      />
    </div>
  );
}
