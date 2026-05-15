import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getPostBySlug } from "../utils/posts-loader";
import { estimateReadingTime } from "../utils/posts-loader";
import Tag from "../components/common/Tag";
import { PageLoading } from "../components/common/Loading";

/**
 * Giscus 评论组件
 * 基于 GitHub Discussions 的免费评论系统
 */
function GiscusComments({ slug }: { slug: string }) {
  return (
    <div className="mt-12">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        评论
      </h3>
      <div
        className="giscus"
        data-repo="Yum-wu/MyBlog"
        data-repo-id=""
        data-category="Announcements"
        data-category-id=""
        data-mapping="specific"
        data-term={slug}
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        data-loading="lazy"
      />
    </div>
  );
}

/**
 * 文章详情页
 * 从本地 Markdown 加载文章内容并渲染
 */
export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useMemo(() => (slug ? getPostBySlug(slug) : undefined), [slug]);

  /* 加载中 */
  if (!slug) return <PageLoading />;

  /* 文章不存在 */
  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          文章不存在
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          你访问的文章未找到，可能已被移除或链接有误。
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
        >
          ← 返回首页
        </Link>
      </div>
    );
  }

  const readingTime = estimateReadingTime(post.content);

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ===== 文章头部 ===== */}
      <header className="mb-8">
        {/* 分类 */}
        {post.category && (
          <Link
            to={`/?category=${post.category}`}
            className="inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-3"
          >
            {post.category}
          </Link>
        )}

        {/* 标题 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
          {post.title}
        </h1>

        {/* 元信息 */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {post.author || "Yum"}
          </span>
          <time>{post.date}</time>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {readingTime} 分钟
          </span>
        </div>

        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} size="sm" color="primary" />
            ))}
          </div>
        )}
      </header>

      {/* ===== 文章内容（Markdown 渲染） ===== */}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          disallowedElements={["script", "iframe", "object", "embed", "form"]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");

              if (match) {
                return (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      borderRadius: "0.75rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* ===== 分割线 ===== */}
      <hr className="my-12 border-neutral-200 dark:border-neutral-700" />

      {/* ===== Giscus 评论 ===== */}
      <GiscusComments slug={post.slug} />
    </article>
  );
}
