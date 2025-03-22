export interface Note {
  id: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  content: string;
  completed: boolean;
  date: string;
  createdAt: string;
  completedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  createdAt: string;
}

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date) => date.toISOString().split('T')[0];

// 获取指定日期的笔记
export const getNote = (date: Date): Note | null => {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  return notes.find((note: Note) => note.date === formatDate(date)) || null;
};

// 保存笔记
export const saveNote = (content: string, date: Date) => {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  const existingNote = notes.find((note: Note) => note.date === formatDate(date));
  const now = new Date().toISOString();

  if (existingNote) {
    existingNote.content = content;
    existingNote.updatedAt = now;
  } else {
    notes.push({
      id: generateId(),
      content,
      date: formatDate(date),
      createdAt: now,
      updatedAt: now,
    });
  }

  localStorage.setItem('notes', JSON.stringify(notes));
};

// 获取指定日期的待办事项
export const getTodos = (date: Date): Todo[] => {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  return todos.filter((todo: Todo) => todo.date === formatDate(date));
};

// 创建待办事项
export const createTodo = (content: string, date: Date) => {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  const now = new Date().toISOString();

  todos.push({
    id: generateId(),
    content,
    completed: false,
    date: formatDate(date),
    createdAt: now,
  });

  localStorage.setItem('todos', JSON.stringify(todos));
};

// 更新待办事项状态
export const updateTodo = (id: string, completed: boolean) => {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  const todo = todos.find((t: Todo) => t.id === id);
  
  if (todo) {
    todo.completed = completed;
    todo.completedAt = completed ? new Date().toISOString() : undefined;
    localStorage.setItem('todos', JSON.stringify(todos));
  }
};

// 删除待办事项
export const deleteTodo = (id: string) => {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  const filteredTodos = todos.filter((todo: Todo) => todo.id !== id);
  localStorage.setItem('todos', JSON.stringify(filteredTodos));
};

// 获取指定日期的事件
export const getEvents = (date: Date): Event[] => {
  const events = JSON.parse(localStorage.getItem('events') || '[]');
  return events.filter((event: Event) => event.date === formatDate(date));
};

// 获取所有事件
export const getAllEvents = (): Event[] => {
  return JSON.parse(localStorage.getItem('events') || '[]');
};

// 创建事件
export const createEvent = (title: string, type: string, date: Date) => {
  const events = JSON.parse(localStorage.getItem('events') || '[]');
  const now = new Date().toISOString();

  events.push({
    id: generateId(),
    title,
    type,
    date: formatDate(date),
    createdAt: now,
  });

  localStorage.setItem('events', JSON.stringify(events));
};

// 删除事件
export const deleteEvent = (id: string) => {
  const events = JSON.parse(localStorage.getItem('events') || '[]');
  const filteredEvents = events.filter((event: Event) => event.id !== id);
  localStorage.setItem('events', JSON.stringify(filteredEvents));
}; 