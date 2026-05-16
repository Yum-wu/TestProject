import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Post } from "../types";
import * as postService from "../services/posts";
import { formatSmartTime } from "../utils/formatDate";
import Tag from "../components/common/Tag";
import { PageLoading } from "../components/common/Loading";

/**
 * 文章详情页
 * 包含 Markdown 渲染、封面图、分类标签
 */
export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    postService
      .getPostBySlug(slug)
      .then((res) => {
        if (!res.data) {
          navigate("/", { replace: true });
          return;
        }
        setPost(res.data);
      })
      .catch(() => {
        navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <PageLoading text="加载文章中..." />;
  if (!post) return null;

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        {post.category && (
          <span className="inline-block text-sm font-medium text-primary-600 dark:text-primary-400 mb-3">
            {post.category.name}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <time>{formatSmartTime(post.created_at)}</time>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag.id} label={tag.name} size="sm" color="primary" />
            ))}
          </div>
        )}
      </header>

      {post.cover_image && (
        <div className="mb-8 rounded-2xl overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-auto max-h-[400px] object-cover"
          />
        </div>
      )}

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
                    customStyle={{ borderRadius: "0.75rem", fontSize: "0.875rem" }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                );
              }
              return <code className={className} {...props}>{children}</code>;
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
