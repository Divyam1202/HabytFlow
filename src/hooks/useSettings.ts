import { useState, useEffect } from 'react';

export function useSettings() {
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');

  useEffect(() => {
    const saved = localStorage.getItem('timeFormat') as '12h' | '24h';
    if (saved) setTimeFormat(saved);
  }, []);

  const updateTimeFormat = (format: '12h' | '24h') => {
    setTimeFormat(format);
    localStorage.setItem('timeFormat', format);
    window.dispatchEvent(new Event('settings-update'));
  };

  useEffect(() => {
    const handler = () => {
      const saved = localStorage.getItem('timeFormat') as '12h' | '24h';
      if (saved) setTimeFormat(saved);
    };
    window.addEventListener('settings-update', handler);
    return () => window.removeEventListener('settings-update', handler);
  }, []);

  return { timeFormat, updateTimeFormat };
}

export const formatTime = (time: string, format: '12h' | '24h') => {
  if (!time) return '--:--';
  if (format === '24h') return time;
  const [hours, minutes] = time.split(':');
  if (!hours || !minutes) return time;
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};
