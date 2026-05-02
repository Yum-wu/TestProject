import { useState } from 'react';
import { validateAddress } from '../../utils/validators';
import type { Address, CreateAddressInput } from '../../types/address';

/**
 * 地址表单组件（新增/编辑通用）
 * 支持所有地址字段输入、前端校验
 */
interface AddressFormProps {
  /** 编辑时传入已有地址数据 */
  initialData?: Address | null;
  /** 提交回调 */
  onSubmit: (data: CreateAddressInput) => void;
  /** 取消回调 */
  onCancel: () => void;
  /** 是否提交中 */
  submitting?: boolean;
}

export default function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  submitting = false,
}: AddressFormProps) {
  const [form, setForm] = useState({
    receiver_name: initialData?.receiver_name ?? '',
    phone: initialData?.phone ?? '',
    province: initialData?.province ?? '',
    city: initialData?.city ?? '',
    district: initialData?.district ?? '',
    detail: initialData?.detail ?? '',
    is_default: initialData?.is_default === 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /** 更新单个字段 */
  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /** 提交表单 */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAddress(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    onSubmit({
      receiver_name: form.receiver_name.trim(),
      phone: form.phone.trim(),
      province: form.province.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      detail: form.detail.trim(),
      is_default: form.is_default,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-base)' }}>
      {/* 收件人 */}
      <div className="form-group">
        <label className="form-label">
          收件人 <span className="required">*</span>
        </label>
        <input
          type="text"
          className={errors.receiver_name ? 'input-error' : ''}
          placeholder="请输入收件人姓名"
          value={form.receiver_name}
          onChange={(e) => updateField('receiver_name', e.target.value)}
        />
        {errors.receiver_name && <div className="form-error-text">{errors.receiver_name}</div>}
      </div>

      {/* 电话 */}
      <div className="form-group">
        <label className="form-label">
          联系电话 <span className="required">*</span>
        </label>
        <input
          type="tel"
          className={errors.phone ? 'input-error' : ''}
          placeholder="请输入手机号"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
        {errors.phone && <div className="form-error-text">{errors.phone}</div>}
      </div>

      {/* 省市区三列布局 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-base)' }}>
        <div className="form-group">
          <label className="form-label">
            省份 <span className="required">*</span>
          </label>
          <input
            type="text"
            className={errors.province ? 'input-error' : ''}
            placeholder="省"
            value={form.province}
            onChange={(e) => updateField('province', e.target.value)}
          />
          {errors.province && <div className="form-error-text">{errors.province}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">
            城市 <span className="required">*</span>
          </label>
          <input
            type="text"
            className={errors.city ? 'input-error' : ''}
            placeholder="市"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
          />
          {errors.city && <div className="form-error-text">{errors.city}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">
            区/县 <span className="required">*</span>
          </label>
          <input
            type="text"
            className={errors.district ? 'input-error' : ''}
            placeholder="区/县"
            value={form.district}
            onChange={(e) => updateField('district', e.target.value)}
          />
          {errors.district && <div className="form-error-text">{errors.district}</div>}
        </div>
      </div>

      {/* 详细地址 */}
      <div className="form-group">
        <label className="form-label">
          详细地址 <span className="required">*</span>
        </label>
        <input
          type="text"
          className={errors.detail ? 'input-error' : ''}
          placeholder="街道/门牌号"
          value={form.detail}
          onChange={(e) => updateField('detail', e.target.value)}
        />
        {errors.detail && <div className="form-error-text">{errors.detail}</div>}
      </div>

      {/* 默认地址 */}
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <input
          type="checkbox"
          id="is_default"
          checked={form.is_default}
          onChange={(e) => updateField('is_default', e.target.checked)}
          style={{ width: 'auto' }}
        />
        <label htmlFor="is_default" className="form-label" style={{ margin: 0 }}>
          设为默认地址
        </label>
      </div>

      {/* 按钮 */}
      <div style={{ display: 'flex', gap: 'var(--space-base)', marginTop: 'var(--space-sm)' }}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? '提交中...' : '保存'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          取消
        </button>
      </div>
    </form>
  );
}
