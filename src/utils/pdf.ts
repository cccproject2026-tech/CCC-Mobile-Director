export const CERTIFICATE_PDF_WIDTH = 1402;
export const CERTIFICATE_PDF_HEIGHT = 1122;

type SharePdfOptions = {
  fileName: string;
  width?: number;
  height?: number;
};

async function sharePdfUri(uri: string, fileName: string) {
  const FileSystem = await import('expo-file-system/legacy');
  const Sharing = await import('expo-sharing');
  const { Alert, Platform } = await import('react-native');

  const safeName = fileName.toLowerCase().endsWith('.pdf')
    ? fileName
    : `${fileName}.pdf`;
  const baseDir = FileSystem.documentDirectory;

  if (!baseDir) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      ...(Platform.OS === 'ios' ? { UTI: 'com.adobe.pdf' } : null),
    });
    return;
  }

  const targetUri = `${baseDir}${safeName}`;
  await FileSystem.copyAsync({ from: uri, to: targetUri });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert('Download', 'Sharing is not available on this device.');
    return;
  }

  await Sharing.shareAsync(targetUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Download Certificate',
    ...(Platform.OS === 'ios' ? { UTI: 'com.adobe.pdf' } : null),
  });
}

export async function sharePdfFromHtml({
  html,
  fileName,
  width = 612,
  height = 792,
}: SharePdfOptions & {
  html: string;
}) {
  const Print = await import('expo-print');
  const { Alert } = await import('react-native');

  try {
    const { uri } = await Print.printToFileAsync({
      html,
      width,
      height,
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await sharePdfUri(uri, fileName);
  } catch (error) {
    console.error('Failed to generate/share PDF', error);
    Alert.alert(
      'Download',
      'PDF download requires a rebuilt dev client. Run: npx expo run:android',
    );
    throw error;
  }
}

export async function sharePdfFromCapturedImage(
  imageBase64: string,
  fileName: string,
) {
  const Print = await import('expo-print');

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: ${CERTIFICATE_PDF_WIDTH}px;
        height: ${CERTIFICATE_PDF_HEIGHT}px;
        overflow: hidden;
        background: #ffffff;
      }
      img {
        width: ${CERTIFICATE_PDF_WIDTH}px;
        height: ${CERTIFICATE_PDF_HEIGHT}px;
        display: block;
      }
    </style>
  </head>
  <body>
    <img src="data:image/png;base64,${imageBase64}" />
  </body>
</html>`;

  const { uri } = await Print.printToFileAsync({
    html,
    width: CERTIFICATE_PDF_WIDTH,
    height: CERTIFICATE_PDF_HEIGHT,
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await sharePdfUri(uri, fileName);
}
