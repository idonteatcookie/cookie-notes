'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearButtonRef = useRef<HTMLButtonElement>(null);
  const monthButtonRef = useRef<HTMLButtonElement>(null);

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
  
  const nextYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(currentMonth.getFullYear() + 1);
    setCurrentMonth(newDate);
  };
  
  const prevYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(currentMonth.getFullYear() - 1);
    setCurrentMonth(newDate);
  };
  
  const changeYear = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    setShowYearDropdown(false);
  };
  
  const changeMonth = (month: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(month);
    setCurrentMonth(newDate);
    setShowMonthDropdown(false);
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(today);
  };

  // 当selectedDate改变时，如果不在当前显示的月份内，更新currentMonth
  useEffect(() => {
    if (!isSameMonth(selectedDate, currentMonth)) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  // 生成年份列表 (当前年份前后10年)
  const currentYear = currentMonth.getFullYear();
  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  
  // 月份列表
  const months = Array.from({ length: 12 }, (_, i) => i);

  // 添加点击外部关闭下拉菜单的处理
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 年份下拉菜单
      if (showYearDropdown && 
          yearDropdownRef.current && 
          yearButtonRef.current && 
          !yearDropdownRef.current.contains(event.target as Node) &&
          !yearButtonRef.current.contains(event.target as Node)) {
        setShowYearDropdown(false);
      }
      
      // 月份下拉菜单
      if (showMonthDropdown && 
          monthDropdownRef.current && 
          monthButtonRef.current && 
          !monthDropdownRef.current.contains(event.target as Node) &&
          !monthButtonRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
      }
    }
    
    // 添加事件监听器
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 清理事件监听器
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showYearDropdown, showMonthDropdown]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center">
          <button
            onClick={prevYear}
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
                d="M11 19l-7-7 7-7 M18 19l-7-7 7-7"
              />
            </svg>
          </button>
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
        </div>
        
        <div className="flex items-center">
          <div className="relative mr-1">
            <button 
              ref={yearButtonRef}
              onClick={() => {
                setShowYearDropdown(!showYearDropdown);
                setShowMonthDropdown(false);
              }}
              className="text-lg font-medium text-secondary-900 hover:text-primary-500 transition-colors"
            >
              {format(currentMonth, 'yyyy年', { locale: zhCN })}
            </button>
            
            {showYearDropdown && (
              <div 
                ref={yearDropdownRef}
                className="absolute z-10 mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto grid grid-cols-3 gap-2 p-2 w-48"
              >
                {yearRange.map(year => (
                  <button
                    key={year}
                    onClick={() => changeYear(year)}
                    className={`text-center py-2 px-2 rounded ${
                      year === currentYear 
                        ? 'bg-primary-500 text-white' 
                        : 'hover:bg-primary-50'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              ref={monthButtonRef}
              onClick={() => {
                setShowMonthDropdown(!showMonthDropdown);
                setShowYearDropdown(false);
              }}
              className="text-lg font-medium text-secondary-900 hover:text-primary-500 transition-colors"
            >
              {format(currentMonth, 'MM月', { locale: zhCN })}
            </button>
            
            {showMonthDropdown && (
              <div 
                ref={monthDropdownRef}
                className="absolute z-10 mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto grid grid-cols-3 gap-2 p-2 w-48"
              >
                {months.map(month => (
                  <button
                    key={month}
                    onClick={() => changeMonth(month)}
                    className={`text-center py-2 px-2 rounded ${
                      month === currentMonth.getMonth() 
                        ? 'bg-primary-500 text-white' 
                        : 'hover:bg-primary-50'
                    }`}
                  >
                    {month + 1}月
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
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
          <button
            onClick={nextYear}
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
                d="M13 5l7 7-7 7 M6 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
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
                relative p-2 text-sm transition-all
                ${isSelected ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-primary-50'}
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
      
      <div className="mt-2 text-center">
        <button 
          onClick={goToToday}
          className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
        >
          返回今天
        </button>
      </div>
    </div>
  );
} 