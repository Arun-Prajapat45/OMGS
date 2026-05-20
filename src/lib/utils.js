import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `OMGS-${timestamp}-${random}`;
}

export function getDiscountPercentage(original, discounted) {
  if (!original || !discounted) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

export function truncate(str, length = 100) {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function calculateImageQuality(width, height, printWidth, printHeight, dpi = 300) {
  const requiredWidth = printWidth * dpi;
  const requiredHeight = printHeight * dpi;
  const qualityRatio = Math.min(
    width / requiredWidth,
    height / requiredHeight
  );
  if (qualityRatio >= 1) return { status: 'excellent', message: 'Image quality is excellent!', score: 100 };
  if (qualityRatio >= 0.6) return { status: 'good', message: 'Image quality is good', score: 80 };
  return {
    status: 'fair',
    message: 'Image is accepted. Quality may be lower for large print sizes.',
    score: 40,
  };
}

export function dataURLtoBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

export function getAspectRatio(width, height) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}
