import { ImageExtension } from '../types/common';

const mimeMap = new Map<string, string>([
  ['jpeg', 'image/jpeg'],
  ['jpg', 'image/jpeg'],
  ['avif', 'image/avif'],
  ['png', 'image/png'],
  ['webp', 'image/webp'],
  ['gif', 'image/gif'],
  ['pdf', 'application/pdf'],
  ['tiff', 'image/tiff'],
  ['svg', 'image/svg+xml'],
  ['heif', 'image/heic']
]);

/**
 * Normalizes an input extension, setting a preference for capitalization & extension aliases (e.g. jpg vs jpeg)
 * @param extension - the extension (without a period)
 */
export function normalizeExtension(extension: string): ImageExtension | string {
  extension = extension.toLowerCase();
  switch (extension) {
  case ImageExtension.JPEG:
    return ImageExtension.JPG;
  case ImageExtension.TIF:
    return ImageExtension.TIFF;
  case ImageExtension.HEIC:
    return ImageExtension.HEIF;
  default:
    return extension;
  }
}

/**
 *
 * @param extension - the extension (without a period)
 */
export function getMimeTypeForExtension(extension: string): string | null {
  extension = normalizeExtension(extension);
  return mimeMap.get(extension) ?? null;
}
