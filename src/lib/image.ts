import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Lado máximo de la imagen que se envía a la IA. */
export const MAX_IMAGE_EDGE = 1024;

export type PreparedImage = {
  uri: string;
  base64: string;
  mimeType: string;
};

/**
 * Reduce y comprime la foto antes de enviarla.
 *
 * El Pixel 9 Pro XL hace fotos de hasta 50 MP. Enviarlas completas en base64
 * puede consumir cientos de MB y cerrar la app, así que se decodifican ya
 * reducidas (`maxWidth`/`maxHeight`) para no cargar nunca la imagen completa
 * en memoria.
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
    throw new Error('No se pudo leer la imagen. Inténtalo de nuevo.');
  }

  return {
    uri: result.uri,
    base64: result.base64,
    mimeType: 'image/jpeg',
  };
}
