import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePosts } from "../hooks/usePosts";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import PostCard from "../components/post/PostCard";
import { PageLoading } from "../components/common/Loading";
import EmptyState from "../components/common/EmptyState";

/**
 * 个人中心页
 * 包含用户信息、修改头像/简介、我的文章列表
 */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { state: authState, updateProfile, isLoggedIn } = useAuth();
  const { posts, loading: postsLoading } = usePosts({
    authorId: authState.user?.id,
    status: undefined /* 显示所有状态的文章 */,
  });

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState(authState.user?.username || "");
  const [bio, setBio] = useState(authState.user?.bio || "");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  const user = authState.user!;

  /* 保存资料 */
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ username, bio });
      setEditing(false);
    } catch {
      /* 错误已在拦截器中处理 */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* ===== 用户信息卡片 ===== */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* 头像 */}
          <div className="shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900/30"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-2xl font-bold text-white ring-4 ring-primary-100 dark:ring-primary-900/30">
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* 用户信息 */}
          <div className="flex-1 min-w-0">
            {editing ? (
              /* 编辑模式 */
              <div className="space-y-4">
                <Input
                  label="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入用户名"
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    个人简介
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="介绍一下自己..."
                    rows={3}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveProfile}
                    loading={saving}
                  >
                    保存
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setUsername(user.username);
                      setBio(user.bio || "");
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              /* 展示模式 */
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user.username}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {user.email}
                </p>
                {user.bio ? (
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {user.bio}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-neutral-400 dark:text-neutral-500 italic">
                    还没有个人简介
                  </p>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setEditing(true)}
                >
                  编辑资料
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== 我的文章 ===== */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            我的文章
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/editor")}
            icon={
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            }
          >
            写文章
          </Button>
        </div>

        {postsLoading ? (
          <PageLoading text="加载文章中..." />
        ) : posts.length === 0 ? (
          <EmptyState
            title="还没有文章"
            description="开始写你的第一篇文章吧！"
            actionText="写文章"
            onAction={() => navigate("/editor")}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
