import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Maximum pixel edge sent to the vision AI engine. */
export const MAX_IMAGE_EDGE = 1024;

export type PreparedImage = {
  uri: string;
  base64: string;
  mimeType: string;
  capturedAt: string;
};

/**
 * Downscales and compresses a captured photo before analysis.
 *
 * The Google Pixel 9 Pro XL main sensor captures up to 50 MP (12.5 MP binned).
 * Encoding full-resolution frames to base64 would spike memory in Expo Go, so
 * we decode and resize in a single native pass (`maxWidth` / `maxHeight`).
 */
export async function prepareImage(uri: string): Promise<PreparedImage> {
  const context = ImageManipulator.manipulate(uri, {
    maxWidth: MAX_IMAGE_EDGE,
    maxHeight: MAX_IMAGE_EDGE,
  });

  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    format: SaveFormat.JPEG,
    compress: 0.72,
    base64: true,
  });

  if (!result.base64) {
    throw new Error('Could not read the captured image. Please try again.');
  }

  return {
    uri: result.uri,
    base64: result.base64,
    mimeType: 'image/jpeg',
    capturedAt: new Date().toISOString(),
  };
}
