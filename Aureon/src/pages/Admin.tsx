import { useState } from 'react';

interface Workspace {
  id: string;
  name: string;
  users: number;
  docs: number;
  created: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  lastActive: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
}

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'workspaces' | 'users' | 'audit'>('workspaces');

  // Mock 数据
  const workspaces: Workspace[] = [
    { id: '1', name: 'Default', users: 3, docs: 12, created: '2 天前' },
    { id: '2', name: 'R&D Team', users: 5, docs: 28, created: '1 周前' },
    { id: '3', name: 'Product', users: 2, docs: 8, created: '2 周前' },
  ];

  const users: User[] = [
    { id: '1', name: '张明', email: 'zhang@example.com', role: 'Admin', lastActive: '刚刚' },
    { id: '2', name: '李华', email: 'li@example.com', role: 'Editor', lastActive: '10 分钟前' },
    { id: '3', name: '王芳', email: 'wang@example.com', role: 'Viewer', lastActive: '1 小时前' },
    { id: '4', name: 'John Doe', email: 'john@example.com', role: 'Editor', lastActive: '3 小时前' },
  ];

  const auditLogs: AuditLog[] = [
    { id: '1', timestamp: '12:34', action: '查询', user: '张明', details: '"RAG 系统配置"' },
    { id: '2', timestamp: '12:30', action: '文档更新', user: '李华', details: '"api.md"' },
    { id: '3', timestamp: '12:15', action: '登录', user: '王芳', details: '从 192.168.1.100' },
    { id: '4', timestamp: '11:50', action: '文档上传', user: '张明', details: '"RAG.pdf" (2MB)' },
    { id: '5', timestamp: '11:30', action: '设置变更', user: 'John Doe', details: '更新 LLM 模型配置' },
  ];

  const tabs = [
    { id: 'workspaces' as const, label: '工作空间', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'users' as const, label: '用户管理', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'audit' as const, label: '审计日志', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  const roleColors = {
    Admin: 'bg-red-100 text-red-700',
    Editor: 'bg-blue-100 text-blue-700',
    Viewer: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Enterprise Admin</h1>
        <p className="text-gray-500 text-sm">企业管理控制台</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200">
        {/* Workspaces Tab */}
        {activeTab === 'workspaces' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">工作空间</h3>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                新建工作空间
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">名称</th>
                  <th className="pb-3 font-medium">用户数</th>
                  <th className="pb-3 font-medium">文档数</th>
                  <th className="pb-3 font-medium">创建时间</th>
                  <th className="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((ws) => (
                  <tr key={ws.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 font-medium text-gray-900">{ws.name}</td>
                    <td className="py-4 text-gray-600">{ws.users}</td>
                    <td className="py-4 text-gray-600">{ws.docs}</td>
                    <td className="py-4 text-gray-500 text-sm">{ws.created}</td>
                    <td className="py-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">用户管理</h3>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                邀请用户
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">用户</th>
                  <th className="pb-3 font-medium">邮箱</th>
                  <th className="pb-3 font-medium">角色</th>
                  <th className="pb-3 font-medium">最后活跃</th>
                  <th className="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {user.name[0]}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 text-sm">{user.lastActive}</td>
                    <td className="py-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">审计日志</h3>
              <button className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                导出日志
              </button>
            </div>
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-400 w-16 shrink-0">{log.timestamp}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{log.user}</span>
                      <span className="text-gray-500">{log.action}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{log.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
