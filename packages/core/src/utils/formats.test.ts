import { getMimeTypeForExtension, normalizeExtension } from './formats';

describe('normalizeExtension', () => {
  it('should return JPG for JPEG input', () => {
    expect(normalizeExtension('JPEG')).toBe('jpg');
  });

  it('should return TIFF for TIF input', () => {
    expect(normalizeExtension('TIF')).toBe('tiff');
  });

  it('should return HEIF for HEIC input', () => {
    expect(normalizeExtension('HEIC')).toBe('heif');
  });

  it('should return lowercase input for other extensions', () => {
    expect(normalizeExtension('PNG')).toBe('png');
  });
});

describe('getMimeTypeForExtension', () => {
  it('should return the correct MIME type for a given extension', () => {
    expect(getMimeTypeForExtension('JPG')).toBe('image/jpeg');
    expect(getMimeTypeForExtension('PNG')).toBe('image/png');
    expect(getMimeTypeForExtension('GIF')).toBe('image/gif');
  });

  it('should return null for an extension that is not in the map', () => {
    expect(getMimeTypeForExtension('BMP')).toBe(null);
  });
});