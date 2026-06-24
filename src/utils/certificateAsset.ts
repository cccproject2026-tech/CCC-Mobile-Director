import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

const CERTIFICATE_TEMPLATE = require('@/assets/images/certi.png');

let cachedTemplateBase64: string | null = null;

export async function getCertificateTemplateBase64(): Promise<string> {
  if (cachedTemplateBase64) return cachedTemplateBase64;

  const asset = Asset.fromModule(CERTIFICATE_TEMPLATE);
  await asset.downloadAsync();

  const uri = asset.localUri || asset.uri;
  if (!uri) {
    throw new Error('Certificate template asset is unavailable.');
  }

  cachedTemplateBase64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return cachedTemplateBase64;
}
