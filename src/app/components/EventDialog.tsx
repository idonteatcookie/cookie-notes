'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

const EVENT_COLORS = {
  'bg-red-500': '红色',
  'bg-yellow-500': '黄色',
  'bg-blue-500': '蓝色',
  'bg-green-500': '绿色',
  'bg-purple-500': '紫色',
  'bg-pink-500': '粉色',
};

interface Event {
  id: string;
  title: string;
  color: string;
  date: string;
  createdAt: string;
}

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  date: Date;
  mode: 'add' | 'edit';
  initialEvent?: Event;
}

export default function EventDialog({
  isOpen,
  onClose,
  onSave,
  date,
  mode = 'add',
  initialEvent,
}: EventDialogProps) {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [selectedDate, setSelectedDate] = useState(date);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialEvent) {
      setTitle(initialEvent.title);
      setSelectedColor(initialEvent.color);
      setSelectedDate(new Date(initialEvent.date));
    } else if (isOpen) {
      setTitle('');
      setSelectedColor('bg-blue-500');
      setSelectedDate(date);
    }
  }, [isOpen, initialEvent, date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      color: selectedColor,
      date: format(selectedDate, 'yyyy-MM-dd'),
    });
    setTitle('');
    setSelectedColor('bg-blue-500');
    setSelectedDate(date);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-primary-600">
          {mode === 'add' ? '添加事件' : '编辑事件'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-600 mb-1">
                事件标题
              </label>
              <input
                type="text"
                value={title}
                ref={inputRef}
                onChange={(e) => setTitle(e.target.value)}
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
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-3 py-1.5 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-600 mb-1">
                事件颜色
              </label>
              <div className="grid grid-cols-6 gap-2">
                {Object.entries(EVENT_COLORS).map(([color, name]) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-lg ${color} transition-all ${
                      selectedColor === color ? 'ring-2 ring-primary-400 ring-offset-2' : ''
                    }`}
                    title={name}
                  />
                ))}
              </div>
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