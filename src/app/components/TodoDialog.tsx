'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, date: Date) => void;
  initialContent?: string;
  initialDate?: Date;
  mode: 'edit' | 'copy';
}

export default function TodoDialog({
  isOpen,
  onClose,
  onSave,
  initialContent = '',
  initialDate = new Date(),
  mode,
}: TodoDialogProps) {
  const [content, setContent] = useState(initialContent);
  const [date, setDate] = useState(initialDate);

  // 当对话框打开或初始值改变时，更新表单内容
  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setDate(initialDate);
    }
  }, [isOpen, initialContent, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(content.trim(), date);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-primary-600">
          {mode === 'edit' ? '编辑待办事项' : '复制待办事项'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-600 mb-1">
                内容
              </label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-600 mb-1">
                日期
              </label>
              <input
                type="date"
                value={format(date, 'yyyy-MM-dd')}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="w-full px-3 py-1.5 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all"
                required
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm border border-secondary-200 text-secondary-600 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 