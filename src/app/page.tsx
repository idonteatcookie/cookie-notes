'use client';

import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import NoteEditor from './components/NoteEditor';
import TodoList from './components/TodoList';
import EventDialog from './components/EventDialog';
import ReportDialog from './components/ReportDialog';
import { format, differenceInDays, isToday, isTomorrow, isFuture, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as storage from '../lib/storage';
import { exportData, importData } from '../lib/exportImport';

const getEventTextColorClass = (bgColorClass: string | undefined) => {
  if (!bgColorClass) return 'text-secondary-600';
  return bgColorClass.replace('bg-', 'text-');
};

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [note, setNote] = useState<storage.Note | null>(null);
  const [todos, setTodos] = useState<storage.Todo[]>([]);
  const [events, setEvents] = useState<storage.Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<storage.Event[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<storage.Event | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [weeklyData, setWeeklyData] = useState<{
    notes: storage.Note[];
    todos: storage.Todo[];
    events: storage.Event[];
  }>({
    notes: [],
    todos: [],
    events: [],
  });
  const [monthlyData, setMonthlyData] = useState<{
    notes: storage.Note[];
    todos: storage.Todo[];
    events: storage.Event[];
  }>({
    notes: [],
    todos: [],
    events: [],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      loadDayData();
      loadUpcomingEvents();
    }
  }, [selectedDate, isClient]);

  const loadDayData = () => {
    if (!isClient) return;
    
    // 加载日记
    const currentNote = storage.getNote(selectedDate);
    setNote(currentNote);
    
    // 加载特殊事件
    const currentEvents = storage.getEvents(selectedDate);
    setEvents(currentEvents);
    
    // 加载待办事项
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const allTodos = storage.loadTodos();
    const todosForDate = allTodos.filter(todo => todo.date === dateStr);
    setTodos(todosForDate);
  };

  const loadUpcomingEvents = () => {
    if (!isClient) return;
    const allEvents = storage.loadEvents();
    const today = new Date();
    const futureEvents = allEvents
      .filter((event) => {
        const eventDate = new Date(event.date);
        return isToday(eventDate) || isFuture(eventDate);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setUpcomingEvents(futureEvents);
  };

  const formatEventDate = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const today = new Date();
    
    if (isToday(eventDate)) {
      return '今天';
    }
    if (isTomorrow(eventDate)) {
      return '明天';
    }

    const daysLeft = differenceInDays(eventDate, today);
    return `${format(eventDate, 'MM.dd', { locale: zhCN })}（${daysLeft}天后）`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDateContextMenu = (date: Date, event: React.MouseEvent) => {
    event.preventDefault();
    setSelectedDate(date);
    setIsEventDialogOpen(true);
  };

  const handleNoteSave = (content: string) => {
    if (!isClient) return;
    storage.saveNote(content, selectedDate);
    loadDayData();
  };

  const handleAddTodo = (content: string, date: Date) => {
    if (!isClient) return;
    const newTodo = storage.saveTodo(content, date);
    setTodos([...todos, newTodo]);
    loadDayData();
  };

  const handleToggleTodo = (id: string) => {
    if (!isClient) return;
    storage.toggleTodo(id);
    setTodos(storage.loadTodos());
    loadDayData();
  };

  const handleDeleteTodo = (id: string) => {
    if (!isClient) return;
    storage.deleteTodo(id);
    setTodos(storage.loadTodos());
    loadDayData();
  };

  const handleEditTodo = (id: string, content: string, date: Date) => {
    if (!isClient) return;
    storage.editTodo(id, content, date);
    setTodos(storage.loadTodos());
    loadDayData();
  };

  const handleAddEvent = (event: Omit<storage.Event, 'id' | 'createdAt'>) => {
    if (!isClient) return;
    if (selectedEvent) {
      storage.editEvent(selectedEvent.id, event.title, new Date(event.date), event.color);
    } else {
      storage.addEvent(event.title, new Date(event.date), event.color);
    }
    loadDayData();
    loadUpcomingEvents();
    setSelectedEvent(null);
  };

  const handleEditEvent = (event: storage.Event) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const hasContent = (date: Date) => {
    if (!isClient) return { events: [] };
    const events = storage.getEvents(date);
    return { events };
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  const loadWeeklyData = () => {
    if (!isClient) return;
    
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const weeklyNotes: storage.Note[] = [];
    const weeklyTodos: storage.Todo[] = [];
    const weeklyEvents: storage.Event[] = [];
    
    days.forEach(day => {
      const note = storage.getNote(day);
      if (note) weeklyNotes.push(note);
      
      const dateStr = format(day, 'yyyy-MM-dd');
      const allTodos = storage.loadTodos();
      const todosForDate = allTodos.filter(todo => todo.date === dateStr);
      weeklyTodos.push(...todosForDate);
      
      const events = storage.getEvents(day);
      weeklyEvents.push(...events);
    });
    
    setWeeklyData({
      notes: weeklyNotes,
      todos: weeklyTodos,
      events: weeklyEvents,
    });
  };

  const handleOpenWeeklyReport = () => {
    loadWeeklyData();
    setIsWeeklyReportOpen(true);
  };

  const loadMonthlyData = () => {
    if (!isClient) return;
    
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const monthlyNotes: storage.Note[] = [];
    const monthlyTodos: storage.Todo[] = [];
    const monthlyEvents: storage.Event[] = [];
    
    days.forEach(day => {
      const note = storage.getNote(day);
      if (note) monthlyNotes.push(note);
      
      const dateStr = format(day, 'yyyy-MM-dd');
      const allTodos = storage.loadTodos();
      const todosForDate = allTodos.filter(todo => todo.date === dateStr);
      monthlyTodos.push(...todosForDate);
      
      const events = storage.getEvents(day);
      monthlyEvents.push(...events);
    });
    
    setMonthlyData({
      notes: monthlyNotes,
      todos: monthlyTodos,
      events: monthlyEvents,
    });
  };

  const handleOpenMonthlyReport = () => {
    loadMonthlyData();
    setIsMonthlyReportOpen(true);
  };

  const handleExport = () => {
    if (!isClient) return;
    exportData();
  };

  const handleImport = () => {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await importData(file);
        loadDayData();
        loadUpcomingEvents();
        alert('导入成功！页面将刷新以显示导入的数据。');
        window.location.reload();
      } catch (error) {
        console.error('导入失败:', error);
        alert('导入失败，请确保文件格式正确。');
      }
    };
    
    fileInput.click();
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex gap-4 mb-6">
          <div className="max-h-[100px] bg-white rounded-xl shadow-soft p-2.5 overflow-y-auto flex-1 max-w-[600px]">
            <div className="space-y-0.5">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-[1.5rem,6rem,1fr] items-center"
                >
                  <div className="flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 rounded-full ${event.color || 'bg-secondary-400'}`} />
                  </div>
                  <div className="text-xs text-secondary-500">
                    {formatEventDate(event.date)}
                  </div>
                  <div className="text-xs text-secondary-700 truncate pr-2">
                    {event.title}
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="py-2 flex items-center justify-center text-xs text-secondary-400">
                  暂无即将发生的事件
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleGoToToday}
              className="h-[60px] px-3 bg-white rounded-xl shadow-soft text-xs text-secondary-600 hover:text-primary-500 transition-colors flex flex-col items-center justify-center gap-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>今天</span>
            </button>
            <button
              onClick={handleOpenWeeklyReport}
              className="h-[60px] px-3 bg-white rounded-xl shadow-soft text-xs text-secondary-600 hover:text-primary-500 transition-colors flex flex-col items-center justify-center gap-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>周报</span>
            </button>
            <button
              onClick={handleOpenMonthlyReport}
              className="h-[60px] px-3 bg-white rounded-xl shadow-soft text-xs text-secondary-600 hover:text-primary-500 transition-colors flex flex-col items-center justify-center gap-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>月报</span>
            </button>
            <button
              onClick={handleImport}
              className="h-[60px] px-3 bg-white rounded-xl shadow-soft text-xs text-secondary-600 hover:text-primary-500 transition-colors flex flex-col items-center justify-center gap-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>导入</span>
            </button>
            <button
              onClick={handleExport}
              className="h-[60px] px-3 bg-white rounded-xl shadow-soft text-xs text-secondary-600 hover:text-primary-500 transition-colors flex flex-col items-center justify-center gap-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>导出</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl shadow-soft p-4">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onDateContextMenu={handleDateContextMenu}
                hasContent={hasContent}
              />
            </div>
            <div className="bg-white rounded-xl shadow-soft p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-primary-600">事件</h2>
                <button
                  onClick={() => setIsEventDialogOpen(true)}
                  className="px-3 py-1 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  添加
                </button>
              </div>
              <div className="space-y-1.5">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="py-1.5 px-2 rounded-lg border border-secondary-200 flex items-center gap-2"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${event.color || 'bg-secondary-400'}`} />
                    <div className={`text-xs font-medium flex-1 ${getEventTextColorClass(event.color)}`}>
                      {event.title}
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="text-secondary-400 hover:text-primary-500 transition-colors p-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (isClient) {
                            storage.deleteEvent(event.id);
                            loadDayData();
                            loadUpcomingEvents();
                          }
                        }}
                        className="text-secondary-400 hover:text-red-500 transition-colors p-0.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center py-3 text-xs text-secondary-400">
                    暂无事件
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl shadow-soft p-4">
              <h2 className="text-lg font-semibold mb-3 text-primary-600">日记</h2>
              <NoteEditor
                date={selectedDate}
                initialContent={note?.content || ''}
                onSave={handleNoteSave}
              />
            </div>
            <div className="bg-white rounded-xl shadow-soft p-4">
              <h2 className="text-lg font-semibold mb-3 text-primary-600">待办事项</h2>
              <TodoList
                todos={todos}
                selectedDate={selectedDate}
                onAdd={handleAddTodo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
              />
            </div>
          </div>
        </div>
      </main>
      <EventDialog
        isOpen={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleAddEvent}
        date={selectedDate}
        mode={selectedEvent ? 'edit' : 'add'}
        initialEvent={selectedEvent ?? undefined}
      />
      <ReportDialog
        isOpen={isWeeklyReportOpen}
        onClose={() => setIsWeeklyReportOpen(false)}
        date={selectedDate}
        notes={weeklyData.notes}
        todos={weeklyData.todos}
        events={weeklyData.events}
        type="week"
      />
      <ReportDialog
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        date={selectedDate}
        notes={monthlyData.notes}
        todos={monthlyData.todos}
        events={monthlyData.events}
        type="month"
      />
    </div>
  );
}
