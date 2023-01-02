import { ImageExtension } from '../types/common';

/**
 * Normalizes an input extension, setting a preference for capitalization & extension aliases (e.g. jpg vs jpeg)
 * @param extension - the extension (without a period)
 */
export function normalizeExtension(extension: string): ImageExtension {
  extension = extension.toLowerCase();
  if (extension === ImageExtension.JPEG) {
    return ImageExtension.JPG;
  }
  if (extension === ImageExtension.TIF) {
    return ImageExtension.TIFF;
  }
  if (extension === ImageExtension.HEIC) {
    return ImageExtension.HEIF;
  }
  return <ImageExtension>extension;
}

/**
 *
 * @param extension - the extension (without a period)
 */
export function getMimeTypeForExtension(extension: string): string | null {
  extension = normalizeExtension(extension);
  const mimeMap: { [extension: string]: string } = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    avif: 'image/avif',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    pdf: 'application/pdf',
    tiff: 'image/tiff',
    svg: 'image/svg+xml',
    heif: 'image/heic'
  };

  return mimeMap[extension] ?? null;
}
