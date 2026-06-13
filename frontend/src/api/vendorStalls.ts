import type { GameId } from '../constants/games';
import { apiRequest } from './client';
import { vendorApiRequest } from './vendorAuth';
import { normalizeStall } from '../lib/vendorStallHelpers';
import type { VendorStall, VendorStallInput } from '../types/vendor';

type StallResponse = VendorStall;

function toQuery(gameId?: GameId): string {
  return gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
}

function buildSaveBody(input: Partial<VendorStallInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.roomName !== undefined) body.roomName = input.roomName;
  if (input.gameId !== undefined) body.gameId = input.gameId;
  if (input.managerCount !== undefined) body.managerCount = input.managerCount;
  if (input.teamSize !== undefined) body.teamSize = input.teamSize;
  if (input.startingBudget !== undefined) body.startingBudget = input.startingBudget;
  if (input.players !== undefined) body.players = input.players;
  if (input.isOpen !== undefined) body.isOpen = input.isOpen;
  return body;
}

export async function listVendorStalls(vendorId: string, gameId?: GameId): Promise<VendorStall[]> {
  void vendorId;
  const stalls = await vendorApiRequest<StallResponse[]>(`/api/vendor/stalls${toQuery(gameId)}`);
  return stalls.map((stall) => normalizeStall(stall));
}

export async function getVendorStall(vendorId: string, stallId: string): Promise<VendorStall | null> {
  void vendorId;
  try {
    const stall = await vendorApiRequest<StallResponse>(`/api/vendor/stalls/${stallId}`);
    return normalizeStall(stall);
  } catch (err) {
    if (err instanceof Error && err.message === 'STALL_NOT_FOUND') {
      return null;
    }
    throw err;
  }
}

export async function listOpenStalls(gameId?: GameId): Promise<VendorStall[]> {
  const stalls = await apiRequest<StallResponse[]>(`/api/stalls/open${toQuery(gameId)}`);
  return stalls.map((stall) => normalizeStall(stall));
}

export async function joinStallByInviteCode(
  inviteCode: string,
  managerId: string,
  gameId: GameId,
  expectedStallId?: string,
): Promise<VendorStall> {
  void managerId;
  const stall = await apiRequest<StallResponse>('/api/stalls/join', {
    method: 'POST',
    body: JSON.stringify({
      inviteCode,
      gameId,
      stallId: expectedStallId,
    }),
  });
  return normalizeStall(stall);
}

export async function listManagerJoinedStalls(
  managerId: string,
  gameId?: GameId,
): Promise<VendorStall[]> {
  void managerId;
  const stalls = await apiRequest<StallResponse[]>(`/api/stalls/joined${toQuery(gameId)}`);
  return stalls.map((stall) => normalizeStall(stall));
}

export async function createVendorStall(
  vendorId: string,
  input: VendorStallInput,
): Promise<VendorStall> {
  void vendorId;
  const stall = await vendorApiRequest<StallResponse>('/api/vendor/stalls', {
    method: 'POST',
    body: JSON.stringify(buildSaveBody(input)),
  });
  return normalizeStall(stall);
}

export async function updateVendorStall(
  vendorId: string,
  stallId: string,
  patch: Partial<VendorStallInput>,
): Promise<VendorStall> {
  void vendorId;
  const stall = await vendorApiRequest<StallResponse>(`/api/vendor/stalls/${stallId}`, {
    method: 'PUT',
    body: JSON.stringify(buildSaveBody(patch)),
  });
  return normalizeStall(stall);
}

export async function deleteVendorStall(vendorId: string, stallId: string): Promise<void> {
  void vendorId;
  await vendorApiRequest<void>(`/api/vendor/stalls/${stallId}`, { method: 'DELETE' });
}
