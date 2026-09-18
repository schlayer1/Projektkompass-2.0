import { ProjectBoard } from '../types/project';
import { saveBoardToFirestore } from './boardService';

const OFFLINE_QUEUE_KEY = 'pk_kahla_offline_boards_queue';

export interface QueuedBoardItem {
  id: string;
  board: ProjectBoard;
  queuedAt: string;
}

export function getOfflineQueue(): QueuedBoardItem[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Fehler beim Lesen der Offline-Queue:', e);
    return [];
  }
}

export function saveOfflineQueue(queue: QueuedBoardItem[]): void {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Fehler beim Schreiben der Offline-Queue:', e);
  }
}

export function enqueueBoardOffline(board: ProjectBoard): QueuedBoardItem {
  const queue = getOfflineQueue();
  // Vorhandenes Update desselben Boards ersetzen
  const existingIdx = queue.findIndex((item) => item.board.id === board.id || item.board.boardCode === board.boardCode);
  const item: QueuedBoardItem = {
    id: 'offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    board,
    queuedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = item;
  } else {
    queue.push(item);
  }

  saveOfflineQueue(queue);
  window.dispatchEvent(new CustomEvent('pk-offline-queue-updated', { detail: { count: queue.length } }));
  return item;
}

export async function processOfflineQueue(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;
  const remaining: QueuedBoardItem[] = [];

  for (const item of queue) {
    try {
      await saveBoardToFirestore(item.board, false);
      synced++;
    } catch (err) {
      console.warn('Nachsynchronisation fehlgeschlagen:', item, err);
      failed++;
      remaining.push(item);
    }
  }

  saveOfflineQueue(remaining);
  window.dispatchEvent(
    new CustomEvent('pk-offline-queue-synced', {
      detail: { synced, remainingCount: remaining.length },
    })
  );

  return { synced, failed };
}
