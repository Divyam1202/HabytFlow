'use client'

import { useEffect } from 'react'

export function ActivityTracker() {
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const updateActivity = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        localStorage.setItem('habitflow_last_active', Date.now().toString());
        timeout = undefined as any;
      }, 5000);
    };

    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });
    window.addEventListener('touchstart', updateActivity, { passive: true });

    // Ensure it's logged when tracking starts
    localStorage.setItem('habitflow_last_active', Date.now().toString());

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return null;
}
