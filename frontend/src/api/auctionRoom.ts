import { getAuthToken } from './client';
import { apiRequest } from './client';
import type { RoomMessage, RoomView } from '../types/auction';

export type EnterAuctionResponse = {
  room: RoomView;
};

export function enterAuctionRoom(stallId: string): Promise<EnterAuctionResponse> {
  return apiRequest<EnterAuctionResponse>(`/api/stalls/${stallId}/auction/enter`, {
    method: 'POST',
  });
}

function getWsBase(): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}`;
}

export function connectAuctionSocket(
  stallId: string,
  onMessage: (message: RoomMessage) => void,
  onClose?: () => void,
): WebSocket {
  const token = encodeURIComponent(getAuthToken());
  const socket = new WebSocket(`${getWsBase()}/ws/stalls/${stallId}?token=${token}`);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data as string) as RoomMessage;
    onMessage(message);
  };

  socket.onclose = () => {
    onClose?.();
  };

  return socket;
}

export function sendBid(socket: WebSocket, amount: number): void {
  socket.send(JSON.stringify({ type: 'bid', amount }));
}
