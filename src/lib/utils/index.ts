import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: string, currencyCode: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
}

export function truncate(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function createUrl(pathname: string, params?: URLSearchParams) {
  const paramsString = params?.toString();
  const queryString = paramsString ? `?${paramsString}` : '';
  return `${pathname}${queryString}`;
}

export function ensureStartsWith(str: string, prefix: string) {
  return str.startsWith(prefix) ? str : `${prefix}${str}`;
}
