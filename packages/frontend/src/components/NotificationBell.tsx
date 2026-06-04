import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { notificationApi } from '../api';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const fetchCount = async () => {
    try {
      const res = await notificationApi.unreadCount();
      setCount(res as any);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Badge count={count} size="small">
      <BellOutlined
        style={{ fontSize: 18, cursor: 'pointer' }}
        onClick={() => navigate('/notifications')}
      />
    </Badge>
  );
}
