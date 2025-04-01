'use client';

import { useState } from 'react';
import { FiTrash2, FiEdit2, FiCopy } from 'react-icons/fi';
import { BsGripVertical } from 'react-icons/bs';
import { Todo } from '@/lib/storage';
import TodoDialog from './TodoDialog';
import DeletePopover from './DeletePopover';
import { Popover } from '@headlessui/react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  rectIntersection,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TodoListProps {
  todos: Todo[];
  selectedDate: Date;
  onAdd: (content: string, date: Date) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string, date: Date) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
}

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onCopy: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

function SortableTodoItem({ todo, onToggle, onEdit, onCopy, onDelete, isDragging = false }: SortableTodoItemProps & { isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: todo.id,
    transition: {
      duration: 300,
      easing: 'ease',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isSortableDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between py-2 px-3 bg-white border rounded-lg transition-colors ${
        isDragging 
          ? 'border-primary-400 shadow-lg bg-primary-50 scale-[1.02]' 
          : 'border-secondary-200 hover:border-primary-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          className="text-secondary-400 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <BsGripVertical className="w-4 h-4" />
        </button>
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
          onClick={() => onEdit(todo)}
          className="text-secondary-400 hover:text-primary-500 transition-colors p-1.5"
          title="编辑"
        >
          <FiEdit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onCopy(todo)}
          className="text-secondary-400 hover:text-primary-500 transition-colors p-1.5"
          title="复制"
        >
          <FiCopy className="w-3.5 h-3.5" />
        </button>
        <DeletePopover onConfirm={() => onDelete(todo.id)}>
          <Popover.Button className="text-secondary-400 hover:text-red-500 transition-colors p-1.5">
            <FiTrash2 className="w-3.5 h-3.5" />
          </Popover.Button>
        </DeletePopover>
      </div>
    </div>
  );
}

export default function TodoList({
  todos,
  selectedDate,
  onAdd,
  onToggle,
  onDelete,
  onEdit,
  onReorder,
}: TodoListProps) {
  const [content, setContent] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [dialogMode, setDialogMode] = useState<'edit' | 'copy'>('edit');
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 5,
        delay: 150,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedTodo = todos.find(todo => todo.id === active.id);
    if (draggedTodo) {
      setActiveTodo(draggedTodo);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over.id);
      
      if (onReorder) {
        onReorder(oldIndex, newIndex);
      }
    }
    
    setActiveTodo(null);
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
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todos.map(todo => todo.id)}
            strategy={verticalListSortingStrategy}
          >
            {todos.map((todo) => (
              <SortableTodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onDelete={onDelete}
                isDragging={activeTodo?.id === todo.id}
              />
            ))}
          </SortableContext>
          <DragOverlay dropAnimation={{
            duration: 300,
            easing: 'ease',
          }}>
            {activeTodo ? (
              <SortableTodoItem
                todo={activeTodo}
                onToggle={onToggle}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onDelete={onDelete}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
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