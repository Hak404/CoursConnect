import { useEffect, useState } from 'react';
import { getNotificationUnreadCount } from '../services/api';

export function useUnreadCount(): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let mounted = true;
    getNotificationUnreadCount()
      .then((n) => mounted && setCount(n))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  return count;
}