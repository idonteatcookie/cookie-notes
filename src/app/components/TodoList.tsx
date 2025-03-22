'use client';

import { useState } from 'react';
import { FiTrash2, FiEdit2, FiCopy } from 'react-icons/fi';
import { Todo } from '@/lib/storage';
import TodoDialog from './TodoDialog';

interface TodoListProps {
  todos: Todo[];
  selectedDate: Date;
  onAdd: (content: string, date: Date) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string, date: Date) => void;
}

export default function TodoList({
  todos,
  selectedDate,
  onAdd,
  onToggle,
  onDelete,
  onEdit,
}: TodoListProps) {
  const [content, setContent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [dialogMode, setDialogMode] = useState<'edit' | 'copy'>('edit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAdd(content.trim(), selectedDate);
      setContent('');
    }
  };

  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleCopy = (todo: Todo) => {
    setSelectedTodo(todo);
    setDialogMode('copy');
    setDialogOpen(true);
  };

  const handleDialogSave = (content: string, date: Date) => {
    if (dialogMode === 'edit' && selectedTodo) {
      onEdit(selectedTodo.id, content, date);
    } else {
      onAdd(content, date);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-3 mb-4">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="添加新的待办事项..."
          className="flex-1 px-3 py-1.5 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all"
        />
        <button
          type="submit"
          className="px-4 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
        >
          添加
        </button>
      </form>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between py-2 px-3 bg-white border border-secondary-200 rounded-lg hover:border-primary-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggle(todo.id)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  todo.completed
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'border-secondary-300 hover:border-primary-400'
                }`}
              >
                {todo.completed && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`text-sm text-secondary-700 transition-all ${
                  todo.completed ? 'line-through text-secondary-400' : ''
                }`}
              >
                {todo.content}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(todo)}
                className="text-secondary-400 hover:text-primary-500 transition-colors p-1.5"
                title="编辑"
              >
                <FiEdit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleCopy(todo)}
                className="text-secondary-400 hover:text-primary-500 transition-colors p-1.5"
                title="复制"
              >
                <FiCopy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(todo.id)}
                className="text-secondary-400 hover:text-red-500 transition-colors p-1.5"
                title="删除"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <TodoDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleDialogSave}
        initialContent={selectedTodo?.content}
        initialDate={selectedTodo?.date ? new Date(selectedTodo.date) : selectedDate}
        mode={dialogMode}
      />
    </div>
  );
} 