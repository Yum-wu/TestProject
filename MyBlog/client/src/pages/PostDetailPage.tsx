import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Post } from "../types";
import * as postService from "../services/posts";
import { useAuth } from "../hooks/useAuth";
import { useComments } from "../hooks/useComments";
import { formatSmartTime } from "../utils/formatDate";
import { READING_SPEED } from "../utils/constants";
import Tag from "../components/common/Tag";
import Button from "../components/common/Button";
import CommentList from "../components/comment/CommentList";
import { PageLoading } from "../components/common/Loading";
import toast from "react-hot-toast";

/**
 * 文章详情页
 * 包含 Markdown 渲染、封面图、分类标签、评论列表、评论表单
 */
export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { state: authState, isLoggedIn } = useAuth();
  const {
    comments,
    totalCount,
    loading: commentsLoading,
    fetchComments,
    submitComment,
    submitReply,
    deleteComment,
  } = useComments();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  /* 获取文章详情 */
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    postService
      .getPostBySlug(slug)
      .then((res) => {
        setPost(res.data);
        /* 获取评论 */
        fetchComments(res.data.id);
      })
      .catch(() => {
        toast.error("文章不存在");
        navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [slug, navigate, fetchComments]);

  /* 发表评论 */
  const handleSubmitComment = async (content: string) => {
    if (!post) return;
    await submitComment(post.id, content);
  };

  /* 回复评论 */
  const handleSubmitReply = async (commentId: string, content: string) => {
    await submitReply(Number(commentId), content);
    /* 刷新评论列表 */
    if (post) {
      await fetchComments(post.id);
    }
  };

  /* 删除评论 */
  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(Number(commentId));
    if (post) {
      await fetchComments(post.id);
    }
    toast.success("评论已删除");
  };

  /* 计算阅读时间 */
  const readingTime = post
    ? Math.max(1, Math.ceil(post.content.length / READING_SPEED))
    : 0;

  /* 加载中 */
  if (loading) return <PageLoading text="加载文章中..." />;

  /* 文章不存在 */
  if (!post) return null;

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ===== 文章头部 ===== */}
      <header className="mb-8">
        {/* 分类 */}
        {post.category && (
          <Link
            to={`/categories?name=${post.category.name}`}
            className="inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-3"
          >
            {post.category.name}
          </Link>
        )}

        {/* 标题 */}
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
          {post.title}
        </h1>

        {/* 元信息 */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          {/* 作者 */}
          <div className="flex items-center gap-2">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-2xs font-medium text-primary-600 dark:text-primary-400">
                {post.author?.username?.charAt(0) || "U"}
              </span>
            )}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {post.author?.username || "匿名"}
            </span>
          </div>

          {/* 日期 */}
          <time>{formatSmartTime(post.created_at)}</time>

          {/* 阅读时间 */}
          <span className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {readingTime} 分钟
          </span>

          {/* 浏览量 */}
          <span className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {post.view_count}
          </span>

          {/* 编辑按钮（仅作者可见） */}
          {authState.user && authState.user.id === post.author_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/editor/${post.id}`)}
              icon={
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                  />
                </svg>
              }
            >
              编辑
            </Button>
          )}
        </div>

        {/* 标签 */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag
                key={tag.id}
                label={tag.name}
                size="sm"
                color="primary"
                clickable
                onClick={() => navigate(`/?tagId=${tag.id}`)}
              />
            ))}
          </div>
        )}
      </header>

      {/* ===== 封面图 ===== */}
      {post.cover_image && (
        <div className="mb-8 rounded-2xl overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-auto max-h-[400px] object-cover"
          />
        </div>
      )}

      {/* ===== 文章内容（Markdown 渲染） ===== */}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          /* 禁止原始 HTML 渲染，防止 XSS 攻击 */
          disallowedElements={["script", "iframe", "object", "embed", "form"]}
          components={{
            /* 代码高亮 */
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");

              /* 有语言标识的代码块 */
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

              /* 行内代码 */
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

      {/* ===== 评论区 ===== */}
      <section>
        <CommentList
          comments={comments}
          loading={commentsLoading}
          totalCount={totalCount}
          onSubmitComment={handleSubmitComment}
          onSubmitReply={handleSubmitReply}
          onDelete={handleDeleteComment}
          isLoggedIn={isLoggedIn}
          username={authState.user?.username}
          avatarUrl={authState.user?.avatar}
        />
      </section>
    </article>
  );
}
