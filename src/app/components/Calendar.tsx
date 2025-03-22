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
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Event } from '@/lib/storage';

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

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

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
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
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

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              onContextMenu={(e) => onDateContextMenu(day, e)}
              className={`
                relative p-2 text-sm rounded-lg transition-all
                ${isSelected ? 'bg-primary-500 text-white' : 'hover:bg-primary-50'}
                ${!isCurrentMonth && 'text-secondary-300'}
              `}
            >
              <div className="relative">
                {format(day, 'd')}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5 items-center">
                  {content.events.map((event) => (
                    <div
                      key={event.id}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : event.color
                      }`}
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