import { useEffect, useState } from 'react';
import { useAddresses } from '../hooks/useAddresses';
import AddressCard from '../components/address/AddressCard';
import AddressForm from '../components/address/AddressForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loading from '../components/common/Loading';
import Empty from '../components/common/Empty';
import type { Address, CreateAddressInput } from '../types/address';

/**
 * 地址管理页
 * 展示地址列表，支持新增/编辑/删除，默认地址置顶
 */
export default function AddressPage() {
  const { loading, addresses, addAddress, editAddress, removeAddress, refresh } = useAddresses();

  // 表单模态框状态
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // 删除确认状态
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // 页面加载时获取地址
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 打开新增表单
  const handleAdd = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  // 打开编辑表单（预填数据）
  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  // 提交表单（新增或编辑）
  const handleSubmit = async (data: CreateAddressInput) => {
    try {
      if (editingAddress) {
        await editAddress(editingAddress.id, data);
      } else {
        await addAddress(data);
      }
      setShowForm(false);
      setEditingAddress(null);
    } catch {
      alert('保存失败，请重试');
    }
  };

  // 删除确认
  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) return;
    try {
      await removeAddress(deleteTarget);
      setDeleteTarget(null);
    } catch {
      alert('删除失败，请重试');
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h2>收货地址管理</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          新增地址
        </button>
      </div>

      {loading && <Loading />}

      {/* 地址列表或空状态 */}
      {!loading && addresses.length === 0 && <Empty text="暂无收货地址，点击右上角新增" />}
      {!loading && addresses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-base)' }}>
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      {/* 新增/编辑表单模态框 */}
      {showForm && (
        <div className="dialog-overlay" onClick={() => setShowForm(false)}>
          <div
            className="dialog"
            style={{ maxWidth: 520, maxHeight: '85vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              {editingAddress ? '编辑地址' : '新增地址'}
            </div>
            <div className="dialog-body">
              <AddressForm
                initialData={editingAddress}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget !== null && (
        <ConfirmDialog
          title="删除地址"
          message="确定要删除该收货地址吗？"
          confirmText="删除"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
