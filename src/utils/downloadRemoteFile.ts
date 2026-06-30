import { Alert, Linking, Platform } from 'react-native';

function sanitizeFileName(name: string): string {
    const trimmed = name.trim().replace(/[/\\?%*:|"<>]/g, '_');
    return trimmed || 'document';
}

function mimeTypeFromFileName(fileName: string): string {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.doc')) return 'application/msword';
    if (lower.endsWith('.docx')) {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    if (lower.endsWith('.mp4')) return 'video/mp4';
    if (lower.endsWith('.mov')) return 'video/quicktime';
    return 'application/octet-stream';
}

export function fileNameFromUrl(url: string, fallback = 'document'): string {
    try {
        const path = decodeURIComponent(new URL(url).pathname);
        const base = path.split('/').pop()?.trim();
        if (base) return base;
    } catch {
        // fall through
    }
    return fallback;
}

/** Download a remote file to device storage, then open the OS share/save sheet. */
export async function downloadAndShareRemoteFile(url: string, fileName: string): Promise<void> {
    const FileSystem = await import('expo-file-system/legacy');
    const Sharing = await import('expo-sharing');

    const safeName = sanitizeFileName(fileName);
    const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

    if (!baseDir) {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) await Linking.openURL(url);
        return;
    }

    const targetUri = `${baseDir}${safeName}`;
    const download = await FileSystem.downloadAsync(url, targetUri);
    const mimeType = mimeTypeFromFileName(safeName);
    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
        await Sharing.shareAsync(download.uri, {
            mimeType,
            dialogTitle: `Download ${safeName}`,
            ...(Platform.OS === 'ios' && mimeType === 'application/pdf'
                ? { UTI: 'com.adobe.pdf' }
                : null),
        });
        return;
    }

    Alert.alert('Download complete', `${safeName} is saved on this device.`);
}
