import type { VendorAccount, VendorStall } from '../types/vendor';

const ACCOUNTS_KEY = 'porobidder.vendor.accounts';
const SESSION_KEY = 'porobidder.vendor.session';
const STALLS_KEY = 'porobidder.vendor.stalls';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getVendorSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setVendorSession(vendorId: string): void {
  localStorage.setItem(SESSION_KEY, vendorId);
}

export function clearVendorSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function listVendorAccounts(): VendorAccount[] {
  return readJson<VendorAccount[]>(ACCOUNTS_KEY, []);
}

export function saveVendorAccount(account: VendorAccount): void {
  const accounts = listVendorAccounts();
  const index = accounts.findIndex((item) => item.vendorId === account.vendorId);
  if (index >= 0) {
    accounts[index] = account;
  } else {
    accounts.push(account);
  }
  writeJson(ACCOUNTS_KEY, accounts);
}

export function findVendorAccount(vendorId: string): VendorAccount | null {
  return listVendorAccounts().find((item) => item.vendorId === vendorId) ?? null;
}

export function listAllStalls(): VendorStall[] {
  return readJson<VendorStall[]>(STALLS_KEY, []);
}

export function saveAllStalls(stalls: VendorStall[]): void {
  writeJson(STALLS_KEY, stalls);
}
