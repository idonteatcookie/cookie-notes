'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isWeekend,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Event } from '@/lib/storage';
import { getHoliday, isHoliday, isWorkday } from '@/lib/holidays';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onDateContextMenu: (date: Date, event: React.MouseEvent) => void;
  hasContent: (date: Date) => {
    events: Event[];
  };
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  onDateContextMenu,
  hasContent,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 获取当月的所有日期，包括用于填充日历的上月和下月的日期
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // 从周一开始
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  return (
    <div className="w-full bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 text-secondary-600 hover:text-primary-500 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-lg font-medium text-secondary-900">
          {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 text-secondary-600 hover:text-primary-500 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['一', '二', '三', '四', '五', '六', '日'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-secondary-600"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const content = hasContent(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const holiday = getHoliday(day);
          const isHolidayDay = isHoliday(day);
          const isWorkDay = isWorkday(day);
          const isWeekendDay = isWeekend(day);

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              onContextMenu={(e) => onDateContextMenu(day, e)}
              className={`
                relative p-2 text-sm rounded-lg transition-all
                ${isSelected ? 'ring-2 ring-primary-400' : 'hover:bg-primary-50'}
                ${!isCurrentMonth && 'text-secondary-300'}
              `}
            >
              <div className="relative h-6 flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-6">{format(day, 'd')}</span>
                {holiday && (
                  <span className={`
                    absolute -top-1 -right-1 text-[10px] leading-none px-0.5
                    ${isWorkDay ? 'text-red-500' : 'text-primary-500'}
                  `}>
                    {isWorkDay ? '班' : '休'}
                  </span>
                )}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 items-center">
                  {content.events.map((event) => (
                    <div
                      key={event.id}
                      className={`w-1 h-1 rounded-full ${event.color}`}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
} 