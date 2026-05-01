import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Post } from "../types";
import * as postService from "../services/posts";
import { useCategories } from "../hooks/useCategories";
import { useTags } from "../hooks/useTags";
import { useAuth } from "../hooks/useAuth";
import PostEditor from "../components/post/PostEditor";
import CoverUpload from "../components/post/CoverUpload";
import TagComponent from "../components/common/Tag";
import { PageLoading } from "../components/common/Loading";
import toast from "react-hot-toast";

/**
 * 文章编辑/创建页
 * 包含标题、分类选择、标签选择、Markdown 编辑器、封面图上传
 */
export default function PostEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { state: authState } = useAuth();
  const { categories } = useCategories();
  const { tags } = useTags();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [existingPost, setExistingPost] = useState<Post | null>(null);

  /* 编辑器状态 */
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");

  /* 编辑模式：加载已有文章 */
  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      toast.error("无效的文章ID");
      navigate("/", { replace: true });
      return;
    }
    postService
      .getPostById(numericId)
      .then((res) => {
        const post = res.data;
        if (authState.user && post.author_id !== authState.user.id) {
          toast.error("无权编辑此文章");
          navigate("/", { replace: true });
          return;
        }
        setExistingPost(post);
        setSelectedCategoryId(post.category_id || undefined);
        setSelectedTagIds(post.tags?.map((t) => t.id) || []);
        setCoverUrl(post.cover_image || undefined);
        setStatus(post.status);
      })
      .catch(() => {
        toast.error("文章不存在");
        navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [isEdit, id, authState.user, navigate]);

  /* 上传封面图 */
  const handleCoverUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await postService.uploadCover(file);
      setCoverUrl(res.data.url);
      toast.success("封面上传成功");
    } catch {
      toast.error("封面上传失败");
    } finally {
      setUploading(false);
    }
  };

  /* 切换标签选择 */
  const handleToggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  /* 保存文章 */
  const handleSave = async (data: {
    title: string;
    content: string;
    status: "draft" | "published";
  }) => {
    if (!data.title.trim() || !data.content.trim()) {
      toast.error("标题和内容不能为空");
      return;
    }

    setSaving(true);
    try {
      const excerpt =
        data.content.slice(0, 200).replace(/[#*`\n]/g, "") + "...";

      if (isEdit && existingPost) {
        const res = await postService.updatePost(existingPost.id, {
          title: data.title,
          content: data.content,
          excerpt,
          cover_image: coverUrl,
          category_id: selectedCategoryId,
          status: data.status,
          tag_ids: selectedTagIds,
        });
        toast.success("文章更新成功");
        navigate(`/posts/${res.data.slug}`, { replace: true });
      } else {
        const res = await postService.createPost({
          title: data.title,
          content: data.content,
          excerpt,
          cover_image: coverUrl,
          category_id: selectedCategoryId,
          status: data.status,
          tag_ids: selectedTagIds,
        });
        toast.success(data.status === "draft" ? "草稿已保存" : "文章发布成功");
        navigate(`/posts/${res.data.slug}`, { replace: true });
      }
    } catch {
      /* 错误已在拦截器中处理 */
    } finally {
      setSaving(false);
    }
  };

  /* 加载中 */
  if (loading) return <PageLoading text="加载文章中..." />;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ===== 页面标题 ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {isEdit ? "编辑文章" : "写文章"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {isEdit ? "修改你的文章内容" : "分享你的想法和经验"}
        </p>
      </div>

      {/* ===== 封面图上传 ===== */}
      <div className="mb-6">
        <CoverUpload
          coverUrl={coverUrl}
          onUpload={handleCoverUpload}
          onRemove={() => setCoverUrl(undefined)}
          uploading={uploading}
        />
      </div>

      {/* ===== 分类和标签选择 ===== */}
      <div className="mb-6 space-y-4">
        {/* 分类选择 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            分类
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <TagComponent
                key={category.id}
                label={category.name}
                color={
                  selectedCategoryId === category.id ? "primary" : "default"
                }
                clickable
                onClick={() =>
                  setSelectedCategoryId(
                    selectedCategoryId === category.id
                      ? undefined
                      : category.id,
                  )
                }
              />
            ))}
          </div>
        </div>

        {/* 标签选择 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            标签
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagComponent
                key={tag.id}
                label={tag.name}
                color={
                  selectedTagIds.includes(tag.id) ? "secondary" : "default"
                }
                clickable
                onClick={() => handleToggleTag(tag.id)}
              />
            ))}
          </div>
        </div>

        {/* 发布状态 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            发布状态
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStatus("draft")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === "draft"
                  ? "bg-accent-100 dark:bg-accent-950/30 text-accent-700 dark:text-accent-400 border border-accent-200 dark:border-accent-800"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              草稿
            </button>
            <button
              type="button"
              onClick={() => setStatus("published")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === "published"
                  ? "bg-secondary-100 dark:bg-secondary-950/30 text-secondary-700 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-800"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              发布
            </button>
          </div>
        </div>
      </div>

      {/* ===== Markdown 编辑器 ===== */}
      <PostEditor
        initialTitle={existingPost?.title || ""}
        initialContent={existingPost?.content || ""}
        onSave={handleSave}
        saving={saving}
        isEdit={isEdit}
      />
    </div>
  );
}
