'use client';

import { useState, useEffect } from 'react';

interface NoteEditorProps {
  date: Date;
  initialContent: string;
  onSave: (content: string) => void;
}

export default function NoteEditor({
  date,
  initialContent,
  onSave,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, date]);

  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (content !== initialContent && !isSaving) {
        setIsSaving(true);
        onSave(content);
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [content, initialContent, isSaving, onSave]);

  return (
    <div className="w-full">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下今天的记录..."
        className="w-full h-48 p-3 text-sm border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all resize-none text-secondary-700 placeholder-secondary-400"
      />
      <div className="flex justify-end mt-1.5">
        <span className="text-xs text-secondary-400 flex items-center">
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isSaving ? 'bg-primary-400 animate-pulse' : 'bg-green-400'}`} />
          {isSaving ? '保存中...' : '已自动保存'}
        </span>
      </div>
    </div>
  );
} 