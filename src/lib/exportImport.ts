import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as storage from './storage';

function generateExportContent(dates: Date[]): string {
  const allNotes = storage.loadNotes();
  const allTodos = storage.loadTodos();
  const allEvents = storage.loadEvents();
  
  // 生成文本内容
  let content = '工作记录导出\n\n';
  
  dates.forEach(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const formattedDate = format(date, 'yyyy年MM月dd日 EEEE', { locale: zhCN });
    
    // 获取当天的数据
    const dayEvents = allEvents.filter(event => event.date === dateStr);
    const dayTodos = allTodos.filter(todo => todo.date === dateStr);
    const dayNote = allNotes.find(note => note.date === dateStr);
    
    // 如果这一天没有任何内容，就跳过
    if (dayEvents.length === 0 && dayTodos.length === 0 && !dayNote?.content) {
      return;
    }
    
    content += `=== ${formattedDate} ===\n\n`;
    
    // 添加事件
    if (dayEvents.length > 0) {
      content += '【事件】\n';
      dayEvents.forEach(event => {
        content += `- ${event.title}\n`;
      });
      content += '\n';
    }
    
    // 添加待办事项
    if (dayTodos.length > 0) {
      content += '【待办事项】\n';
      dayTodos.forEach(todo => {
        content += `- [${todo.completed ? '✓' : ' '}] ${todo.content}\n`;
      });
      content += '\n';
    }
    
    // 添加日记
    if (dayNote?.content) {
      content += '【日记】\n';
      content += dayNote.content + '\n\n';
    }
    
    content += '----------------------------\n\n';
  });
  
  return content;
}

function downloadContent(content: string, prefix: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${prefix}_${format(new Date(), 'yyyy-MM-dd')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportData(): void {
  // 获取所有数据
  const allNotes = storage.loadNotes();
  const allTodos = storage.loadTodos();
  const allEvents = storage.loadEvents();
  
  // 按日期分组
  const allDates = new Set<string>();
  allNotes.forEach(note => allDates.add(note.date));
  allTodos.forEach(todo => allDates.add(todo.date));
  allEvents.forEach(event => allDates.add(event.date));
  
  // 按日期排序并转换为Date对象
  const sortedDates = Array.from(allDates)
    .sort()
    .map(dateStr => parseISO(dateStr));
  
  const content = generateExportContent(sortedDates);
  downloadContent(content, '工作记录');
}

export function exportWeeklyReport(date: Date): void {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const content = generateExportContent(days);
  downloadContent(content, '周报');
}

export function exportMonthlyReport(date: Date): void {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const content = generateExportContent(days);
  downloadContent(content, '月报');
}

export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        
        // 移除文件开头的标题部分，并按照分隔符分割内容
        const contentWithoutHeader = text.replace(/^工作记录导出\n+/, '');
        const sections = contentWithoutHeader.split(/===[\s\S]*?===/).filter(section => section.trim());
        
        // 获取所有日期
        const dates = contentWithoutHeader.match(/===\s*(.*?)\s*===/g)?.map(date => 
          date.replace(/===\s*|\s*===/g, '').trim()
        ) || [];
        
        // 初始化存储数组
        const notes: storage.Note[] = [];
        const todos: storage.Todo[] = [];
        const events: storage.Event[] = [];
        
        // 解析每一天的数据
        sections.forEach((section, index) => {
          if (!dates[index]) return;
          
          // 解析日期
          const dateMatch = dates[index].match(/(\d{4})年(\d{2})月(\d{2})日/);
          if (!dateMatch) return;
          
          const date = new Date(
            parseInt(dateMatch[1]),
            parseInt(dateMatch[2]) - 1,
            parseInt(dateMatch[3])
          );
          const dateStr = format(date, 'yyyy-MM-dd');
          
          let currentSection = '';
          let noteContent = '';
          
          // 按行解析内容
          const lines = section.trim().split('\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line || line === '----------------------------') continue;
            
            if (line === '【事件】') {
              currentSection = 'events';
              continue;
            } else if (line === '【待办事项】') {
              currentSection = 'todos';
              continue;
            } else if (line === '【日记】') {
              currentSection = 'notes';
              continue;
            }
            
            if (currentSection === 'events' && line.startsWith('-')) {
              const title = line.slice(2).trim();
              events.push({
                id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                title,
                date: dateStr,
                color: 'bg-blue-500',
                createdAt: new Date().toISOString()
              });
            } else if (currentSection === 'todos' && line.startsWith('-')) {
              const completed = line.includes('[✓]');
              const content = line.slice(line.indexOf(']') + 1).trim();
              todos.push({
                id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                content,
                completed,
                date: dateStr,
                createdAt: new Date().toISOString(),
                completedAt: completed ? new Date().toISOString() : undefined
              });
            } else if (currentSection === 'notes') {
              noteContent += (noteContent ? '\n' : '') + line;
            }
          }
          
          // 保存日记
          if (noteContent) {
            const now = new Date().toISOString();
            notes.push({
              id: Math.random().toString(36).substring(2) + Date.now().toString(36),
              content: noteContent,
              date: dateStr,
              createdAt: now,
              updatedAt: now
            });
          }
        });
        
        if (notes.length === 0 && todos.length === 0 && events.length === 0) {
          throw new Error('没有解析到任何数据');
        }
        
        // 清除现有数据并保存新数据
        localStorage.clear();
        localStorage.setItem('notes', JSON.stringify(notes));
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('events', JSON.stringify(events));
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
} 