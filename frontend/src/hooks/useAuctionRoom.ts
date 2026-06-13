import { useCallback, useEffect, useRef, useState } from 'react';
import { connectAuctionSocket, enterAuctionRoom, sendBid } from '../api/auctionRoom';
import type { RoomView } from '../types/auction';

export function useAuctionRoom(stallId: string | undefined, onClosed?: () => void) {
  const [roomView, setRoomView] = useState<RoomView | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<WebSocket | null>(null);
  const lastPayloadRef = useRef('');
  const onClosedRef = useRef(onClosed);
  const finishedRef = useRef(false);
  const closedNotifiedRef = useRef(false);

  useEffect(() => {
    onClosedRef.current = onClosed;
  }, [onClosed]);

  const notifyClosed = useCallback(() => {
    if (closedNotifiedRef.current) return;
    closedNotifiedRef.current = true;
    onClosedRef.current?.();
  }, []);

  useEffect(() => {
    if (!stallId) return;

    let cancelled = false;
    finishedRef.current = false;
    closedNotifiedRef.current = false;

    const bootstrap = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await enterAuctionRoom(stallId);
        if (cancelled) return;
        setRoomView(response.room);
        if (response.room.finished) {
          finishedRef.current = true;
        }

        const socket = connectAuctionSocket(
          stallId,
          (message) => {
            if (message.type === 'room') {
              const raw = JSON.stringify(message.payload);
              if (raw === lastPayloadRef.current) return;
              lastPayloadRef.current = raw;
              setRoomView(message.payload);
              setError('');
              if (message.payload.finished) {
                finishedRef.current = true;
              }
            } else if (message.type === 'error') {
              setError(message.message);
            } else if (message.type === 'closed') {
              notifyClosed();
            }
          },
          () => {
            if (finishedRef.current) {
              notifyClosed();
            }
          },
        );
        socketRef.current = socket;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '进入房间失败。');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
        socketRef.current = null;
      }
      lastPayloadRef.current = '';
    };
  }, [stallId, notifyClosed]);

  const submitBid = useCallback((amount: number) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError('未连接到拍卖房间。');
      return;
    }
    sendBid(socketRef.current, amount);
  }, []);

  return { roomView, loading, error, submitBid };
}
