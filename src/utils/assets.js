import { MEDIA_BASE_URL } from '../config';

function encodePath(path) {
  return path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

export function resolveAssetUrl(path) {
  if (!path) return '';
  if (/^(blob:|data:|https?:\/\/)/i.test(path)) return path;

  const baseUrl = MEDIA_BASE_URL.replace(/\/$/, '');
  if (!baseUrl) return '';

  return `${baseUrl}/${encodePath(path.replace(/^\/+/, ''))}`;
}

export function getImageUrl({ imageName, type }) {
  if (!imageName) return '';
  if (/^(blob:|data:|https?:\/\/)/i.test(imageName)) return imageName;

  const baseUrl = MEDIA_BASE_URL.replace(/\/$/, '');
  const imagePath = encodePath(imageName.replace(/^\/+/, ''));
  const typeQuery = type ? `?type=${encodeURIComponent(type)}` : '';

  return `${baseUrl}/${imagePath}${typeQuery}`;
}
