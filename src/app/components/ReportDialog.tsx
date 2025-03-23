'use client';

import { useRef } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Note, Todo, Event } from '@/lib/storage';
import { exportWeeklyReport, exportMonthlyReport } from '@/lib/exportImport';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  notes: Note[];
  todos: Todo[];
  events: Event[];
  type: 'week' | 'month';
}

export default function ReportDialog({
  isOpen,
  onClose,
  date,
  notes,
  todos,
  events,
  type,
}: ReportDialogProps) {
  if (!isOpen) return null;

  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (type === 'week') {
      exportWeeklyReport(date);
    } else {
      exportMonthlyReport(date);
    }
  };

  // 获取日期范围
  const getDateRange = () => {
    if (type === 'week') {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
      return {
        start: weekStart,
        end: weekEnd,
        title: `周报（${format(weekStart, 'MM.dd', { locale: zhCN })} - ${format(weekEnd, 'MM.dd', { locale: zhCN })}）`
      };
    } else {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      return {
        start: monthStart,
        end: monthEnd,
        title: `${format(date, 'yyyy年MM月', { locale: zhCN })}月报`
      };
    }
  };

  const { start, end, title } = getDateRange();
  const days = eachDayOfInterval({ start, end });

  // 按日期格式化数据
  const getDateStr = (date: Date) => format(date, 'yyyy-MM-dd');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
          <h2 className="text-base font-semibold text-primary-600">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1.5"
              title="下载为文本"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>下载</span>
            </button>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4" ref={contentRef} data-report-content>
          <div className="grid grid-cols-2 gap-4 auto-rows-min">
            {days
              .map(day => {
                const dateStr = getDateStr(day);
                const dayNotes = notes.filter(note => note.date === dateStr);
                const dayTodos = todos.filter(todo => todo.date === dateStr);
                const dayEvents = events.filter(event => event.date === dateStr);
                
                // 如果这一天没有任何内容，就不显示
                if (dayNotes.length === 0 && dayTodos.length === 0 && dayEvents.length === 0) {
                  return null;
                }
                
                return (
                  <div key={dateStr} className="border border-secondary-200 rounded-lg p-2">
                    <h3 className="text-sm font-medium text-primary-600 mb-2">
                      {format(day, 'MM月dd日 EEEE', { locale: zhCN })}
                    </h3>
                    
                    {/* 事件 */}
                    {dayEvents.length > 0 && (
                      <div className="mb-2">
                        <h4 className="text-xs font-medium text-secondary-600 mb-1">事件</h4>
                        <div className="space-y-0.5">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              className="flex items-center gap-1.5 text-xs"
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${event.color}`} />
                              <span className="text-secondary-700">{event.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 待办事项 */}
                    {dayTodos.length > 0 && (
                      <div className="mb-2">
                        <h4 className="text-xs font-medium text-secondary-600 mb-1">待办事项</h4>
                        <div className="space-y-0.5">
                          {dayTodos.map(todo => (
                            <div
                              key={todo.id}
                              className="flex items-center gap-1.5 text-xs"
                            >
                              <div
                                className={`w-3 h-3 rounded border flex items-center justify-center ${
                                  todo.completed
                                    ? 'bg-primary-500 border-primary-500 text-white'
                                    : 'border-secondary-300'
                                }`}
                              >
                                {todo.completed && (
                                  <svg className="w-1.5 h-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-secondary-700 ${todo.completed ? 'line-through' : ''}`}>
                                {todo.content}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 日记 */}
                    {dayNotes.map(note => (
                      <div key={note.id}>
                        <h4 className="text-xs font-medium text-secondary-600 mb-1">日记</h4>
                        <div className="text-xs text-secondary-700 whitespace-pre-wrap">
                          {note.content}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            
            {/* 如果没有任何内容 */}
            {days.every(day => {
              const dateStr = getDateStr(day);
              const dayNotes = notes.filter(note => note.date === dateStr);
              const dayTodos = todos.filter(todo => todo.date === dateStr);
              const dayEvents = events.filter(event => event.date === dateStr);
              return dayNotes.length === 0 && dayTodos.length === 0 && dayEvents.length === 0;
            }) && (
              <div className="text-center py-4 text-xs text-secondary-400">
                {type === 'week' ? '本周暂无任何记录' : '本月暂无任何记录'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 