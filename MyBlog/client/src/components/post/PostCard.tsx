import { memo } from "react";
import { Link } from "react-router-dom";
import Tag from "../common/Tag";

/* ===== 文章数据接口 ===== */
export type Post = {
  id: string;
  title: string;
  excerpt: string;
  coverUrl?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  readingTime: number;
};

/* ===== PostCard 组件属性 ===== */
interface PostCardProps {
  /** 文章数据 */
  post: Post;
  /** 布局模式 */
  variant?: "vertical" | "horizontal";
}

/**
 * 文章卡片组件
 * 包含封面图、标题、摘要、分类、标签、日期、阅读量
 * 使用 React.memo 优化，避免父组件重渲染时不必要的更新
 */
function PostCard({ post, variant = "vertical" }: PostCardProps) {
  /* 水平布局 */
  if (variant === "horizontal") {
    return (
      <article className="group flex flex-col sm:flex-row gap-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
        {/* 封面图 */}
        {post.coverUrl && (
          <Link
            to={`/posts/${post.id}`}
            className="sm:w-64 sm:min-h-[200px] overflow-hidden"
          >
            <img
              src={post.coverUrl}
              alt={post.title}
              className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        )}

        {/* 内容区 */}
        <div className="flex-1 p-5 flex flex-col">
          {/* 分类 */}
          <Link
            to={`/categories?name=${post.category}`}
            className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors w-fit"
          >
            {post.category}
          </Link>

          {/* 标题 */}
          <Link to={`/posts/${post.id}`} className="mt-1.5 block group/title">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover/title:text-primary-600 dark:group-hover/title:text-primary-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* 摘要 */}
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed flex-1">
            {post.excerpt}
          </p>

          {/* 标签 */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} label={tag} size="sm" color="primary" />
            ))}
          </div>

          {/* 底部信息 */}
          <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.readingTime} 分钟
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {post.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {post.likeCount}
              </span>
            </div>
            <time>{post.createdAt}</time>
          </div>
        </div>
      </article>
    );
  }

  /* 垂直布局（默认） */
  return (
    <article className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* 封面图 */}
      {post.coverUrl && (
        <Link to={`/posts/${post.id}`} className="block overflow-hidden">
          <img
            src={post.coverUrl}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      )}

      {/* 内容区 */}
      <div className="p-5">
        {/* 分类 */}
        <Link
          to={`/categories?name=${post.category}`}
          className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          {post.category}
        </Link>

        {/* 标题 */}
        <Link to={`/posts/${post.id}`} className="mt-1.5 block group/title">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover/title:text-primary-600 dark:group-hover/title:text-primary-400 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* 摘要 */}
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>

        {/* 标签 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} label={tag} size="sm" color="primary" />
          ))}
        </div>

        {/* 底部信息 */}
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          {/* 作者信息 */}
          <div className="flex items-center gap-2">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-2xs font-medium text-primary-600 dark:text-primary-400">
                {post.author.name.charAt(0)}
              </span>
            )}
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {post.author.name}
            </span>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-2.5 text-xs text-neutral-400 dark:text-neutral-500">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readingTime}分钟
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* 使用 React.memo 包装，对 props 进行浅比较，避免不必要的重渲染 */
export default memo(PostCard);
