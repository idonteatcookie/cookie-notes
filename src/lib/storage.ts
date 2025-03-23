import { format } from 'date-fns';

export interface Todo {
  id: string;
  content: string;
  completed: boolean;
  date: string;
  createdAt: string;
  completedAt?: string;
}

export interface Note {
  id: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  color: string;
  createdAt: string;
  status?: 'active' | 'cancelled' | 'postponed';
}

const isClient = typeof window !== 'undefined';

// Todo functions
export function saveTodos(todos: Todo[]) {
  if (!isClient) return;
  localStorage.setItem('todos', JSON.stringify(todos));
}

export function loadTodos(): Todo[] {
  if (!isClient) return [];
  const todosStr = localStorage.getItem('todos');
  return todosStr ? JSON.parse(todosStr) : [];
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function saveTodo(content: string, date: Date): Todo {
  const todos = loadTodos();
  const todo: Todo = {
    id: generateId(),
    content,
    completed: false,
    date: formatDate(date),
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  localStorage.setItem('todos', JSON.stringify(todos));
  return todo;
}

export function toggleTodo(id: string) {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date().toISOString() : undefined;
    saveTodos(todos);
  }
}

export function deleteTodo(id: string) {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index !== -1) {
    todos.splice(index, 1);
    saveTodos(todos);
  }
}

export function editTodo(id: string, content: string, date: Date): Todo | null {
  const todos = loadTodos();
  const index = todos.findIndex(todo => todo.id === id);
  if (index === -1) return null;

  const updatedTodo = {
    ...todos[index],
    content,
    date: formatDate(date),
  };
  todos[index] = updatedTodo;
  localStorage.setItem('todos', JSON.stringify(todos));
  return updatedTodo;
}

// Note functions
export function saveNotes(notes: Note[]) {
  if (!isClient) return;
  localStorage.setItem('notes', JSON.stringify(notes));
}

export function loadNotes(): Note[] {
  if (!isClient) return [];
  const notesStr = localStorage.getItem('notes');
  return notesStr ? JSON.parse(notesStr) : [];
}

export function getNote(date: Date): Note | null {
  const notes = loadNotes();
  return notes.find((n) => n.date === formatDate(date)) || null;
}

export function hasNote(date: Date): boolean {
  return getNote(date) !== null;
}

export function saveNote(content: string, date: Date) {
  const notes = loadNotes();
  const existingNote = notes.find((n) => n.date === formatDate(date));
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

  saveNotes(notes);
}

// Event functions
export function saveEvents(events: Event[]) {
  if (!isClient) return;
  localStorage.setItem('events', JSON.stringify(events));
}

export function loadEvents(): Event[] {
  if (!isClient) return [];
  const eventsStr = localStorage.getItem('events');
  return eventsStr ? JSON.parse(eventsStr) : [];
}

export function getEvents(date: Date): Event[] {
  const events = loadEvents();
  return events.filter((e) => e.date === formatDate(date));
}

export function addEvent(title: string, date: Date, color: string): Event {
  const event: Event = {
    id: generateId(),
    title,
    date: formatDate(date),
    color,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  const events = loadEvents();
  events.push(event);
  saveEvents(events);
  return event;
}

export function updateEventStatus(id: string, status: 'active' | 'cancelled' | 'postponed'): Event | null {
  const events = loadEvents();
  const index = events.findIndex(event => event.id === id);
  if (index === -1) return null;

  const updatedEvent = {
    ...events[index],
    status
  };
  events[index] = updatedEvent;
  saveEvents(events);
  return updatedEvent;
}

export function deleteEvent(id: string) {
  const events = loadEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index !== -1) {
    events.splice(index, 1);
    saveEvents(events);
  }
}

export function editEvent(id: string, title: string, date: Date, color: string): Event | null {
  const events = loadEvents();
  const index = events.findIndex(event => event.id === id);
  if (index === -1) return null;

  const updatedEvent = {
    ...events[index],
    title,
    date: formatDate(date),
    color,
  };
  events[index] = updatedEvent;
  saveEvents(events);
  return updatedEvent;
} 