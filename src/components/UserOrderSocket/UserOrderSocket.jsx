import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://e-restaurant-api.mobios.lk';

export function useUserOrderSocket(phone) {
  const socketRef = useRef(null);
  const [latestStatus, setLatestStatus] = useState(null);

  useEffect(() => {

    console.log('pnnasdnasd',phone)
    if (!phone) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);

      socket.emit('subscribe_user', { phone }, (res) => {
        console.log('Subscribed user:', res);
      });
    });

    socket.on('order_status_updated', (payload) => {
      console.log('User received status update:', payload);
      setLatestStatus(payload);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [phone]);

  return latestStatus;
}

export function UserOrderSocket({ phone }) {
  const latestStatus = useUserOrderSocket(phone);

  return (
    <div>
      <h3>Order Status</h3>
      <pre>{JSON.stringify(latestStatus, null, 2)}</pre>
    </div>
  );
}
