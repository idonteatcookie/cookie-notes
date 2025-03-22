import { format } from 'date-fns';

interface Holiday {
  name: string;
  type: 'holiday' | 'workday';
}

interface HolidayConfig {
  [date: string]: Holiday;
}

// 2024-2025年法定节假日安排
export const holidays: HolidayConfig = {
  // 2024年节假日安排
  // 元旦
  '2024-01-01': { name: '元旦', type: 'holiday' },
  
  // 春节
  '2024-02-10': { name: '春节', type: 'holiday' },
  '2024-02-11': { name: '春节', type: 'holiday' },
  '2024-02-12': { name: '春节', type: 'holiday' },
  '2024-02-13': { name: '春节', type: 'holiday' },
  '2024-02-14': { name: '春节', type: 'holiday' },
  '2024-02-15': { name: '春节', type: 'holiday' },
  '2024-02-16': { name: '春节', type: 'holiday' },
  '2024-02-17': { name: '春节', type: 'holiday' },
  '2024-02-04': { name: '春节调班', type: 'workday' },
  
  // 清明节
  '2024-04-04': { name: '清明节', type: 'holiday' },
  '2024-04-05': { name: '清明节', type: 'holiday' },
  '2024-04-06': { name: '清明节', type: 'holiday' },
  '2024-03-31': { name: '清明调班', type: 'workday' },
  
  // 劳动节
  '2024-05-01': { name: '劳动节', type: 'holiday' },
  '2024-05-02': { name: '劳动节', type: 'holiday' },
  '2024-05-03': { name: '劳动节', type: 'holiday' },
  '2024-05-04': { name: '劳动节', type: 'holiday' },
  '2024-05-05': { name: '劳动节', type: 'holiday' },
  '2024-04-28': { name: '劳动节调班', type: 'workday' },
  '2024-05-11': { name: '劳动节调班', type: 'workday' },
  
  // 端午节
  '2024-06-10': { name: '端午节', type: 'holiday' },
  '2024-06-08': { name: '端午调班', type: 'workday' },
  
  // 中秋节
  '2024-09-15': { name: '中秋节', type: 'holiday' },
  '2024-09-16': { name: '中秋节', type: 'holiday' },
  '2024-09-17': { name: '中秋节', type: 'holiday' },
  '2024-09-14': { name: '中秋调班', type: 'workday' },
  
  // 国庆节
  '2024-10-01': { name: '国庆节', type: 'holiday' },
  '2024-10-02': { name: '国庆节', type: 'holiday' },
  '2024-10-03': { name: '国庆节', type: 'holiday' },
  '2024-10-04': { name: '国庆节', type: 'holiday' },
  '2024-10-05': { name: '国庆节', type: 'holiday' },
  '2024-10-06': { name: '国庆节', type: 'holiday' },
  '2024-10-07': { name: '国庆节', type: 'holiday' },
  '2024-09-29': { name: '国庆调班', type: 'workday' },
  '2024-10-12': { name: '国庆调班', type: 'workday' },

  // 2025年节假日安排
  // 元旦
  '2025-01-01': { name: '元旦', type: 'holiday' },
  
  // 春节
  '2025-01-28': { name: '春节', type: 'holiday' },
  '2025-01-29': { name: '春节', type: 'holiday' },
  '2025-01-30': { name: '春节', type: 'holiday' },
  '2025-01-31': { name: '春节', type: 'holiday' },
  '2025-02-01': { name: '春节', type: 'holiday' },
  '2025-02-02': { name: '春节', type: 'holiday' },
  '2025-02-03': { name: '春节', type: 'holiday' },
  '2025-02-04': { name: '春节', type: 'holiday' },
  '2025-01-26': { name: '春节调班', type: 'workday' },
  '2025-02-08': { name: '春节调班', type: 'workday' },
  
  // 清明节
  '2025-04-04': { name: '清明节', type: 'holiday' },
  '2025-04-05': { name: '清明节', type: 'holiday' },
  '2025-04-06': { name: '清明节', type: 'holiday' },
  
  // 劳动节
  '2025-05-01': { name: '劳动节', type: 'holiday' },
  '2025-05-02': { name: '劳动节', type: 'holiday' },
  '2025-05-03': { name: '劳动节', type: 'holiday' },
  '2025-05-04': { name: '劳动节', type: 'holiday' },
  '2025-05-05': { name: '劳动节', type: 'holiday' },
  '2025-04-27': { name: '劳动节调班', type: 'workday' },
  
  // 端午节
  '2025-05-31': { name: '端午节', type: 'holiday' },
  '2025-06-01': { name: '端午节', type: 'holiday' },
  '2025-06-02': { name: '端午节', type: 'holiday' },
  
  // 中秋节和国庆节
  '2025-10-01': { name: '国庆节', type: 'holiday' },
  '2025-10-02': { name: '国庆节', type: 'holiday' },
  '2025-10-03': { name: '国庆节', type: 'holiday' },
  '2025-10-04': { name: '国庆节', type: 'holiday' },
  '2025-10-05': { name: '国庆节', type: 'holiday' },
  '2025-10-06': { name: '国庆节', type: 'holiday' },
  '2025-10-07': { name: '国庆节', type: 'holiday' },
  '2025-10-08': { name: '国庆节', type: 'holiday' },
  '2025-09-28': { name: '国庆调班', type: 'workday' },
  '2025-10-11': { name: '国庆调班', type: 'workday' },
};

export function getHoliday(date: Date): Holiday | null {
  const dateStr = format(date, 'yyyy-MM-dd');
  return holidays[dateStr] || null;
}

export function isHoliday(date: Date): boolean {
  const holiday = getHoliday(date);
  return holiday?.type === 'holiday';
}

export function isWorkday(date: Date): boolean {
  const holiday = getHoliday(date);
  return holiday?.type === 'workday';
}

export function getHolidayName(date: Date): string | null {
  const holiday = getHoliday(date);
  return holiday?.name || null;
} 