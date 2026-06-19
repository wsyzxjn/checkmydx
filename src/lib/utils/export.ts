import type { ExportOptions, ExportFormat } from '$lib/types/portfolio';

// Default export options
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
	format: 'png',
	scale: 2,
	width: 1200,
	height: 630,
	transparent: false
};

// Export element to PNG using html-to-image
export async function exportToPng(
	element: HTMLElement,
	filename: string,
	options: Partial<ExportOptions> = {}
): Promise<boolean> {
	try {
		const { toPng } = await import('html-to-image');

		const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };

		const dataUrl = await toPng(element, {
			backgroundColor: mergedOptions.transparent ? undefined : '#0d1117',
			pixelRatio: mergedOptions.scale,
			width: mergedOptions.width || undefined,
			height: mergedOptions.height || undefined,
			cacheBust: true
		});

		downloadDataUrl(dataUrl, `${filename}.png`);
		return true;
	} catch (error) {
		console.error('Failed to export PNG:', error);
		return false;
	}
}

// Export element to JPEG
export async function exportToJpeg(
	element: HTMLElement,
	filename: string,
	options: Partial<ExportOptions> = {}
): Promise<boolean> {
	try {
		const { toJpeg } = await import('html-to-image');

		const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };

		const dataUrl = await toJpeg(element, {
			backgroundColor: '#000000',
			pixelRatio: mergedOptions.scale,
			quality: 0.95
		});

		downloadDataUrl(dataUrl, `${filename}.jpg`);
		return true;
	} catch (error) {
		console.error('Failed to export JPEG:', error);
		return false;
	}
}

// Export element to SVG
export async function exportToSvg(
	element: HTMLElement,
	filename: string
): Promise<boolean> {
	try {
		const { toSvg } = await import('html-to-image');

		const dataUrl = await toSvg(element, {
			backgroundColor: '#000000'
		});

		downloadDataUrl(dataUrl, `${filename}.svg`);
		return true;
	} catch (error) {
		console.error('Failed to export SVG:', error);
		return false;
	}
}

// Generic export function
export async function exportElement(
	element: HTMLElement,
	filename: string,
	format: ExportFormat,
	options: Partial<ExportOptions> = {}
): Promise<boolean> {
	switch (format) {
		case 'png':
			return exportToPng(element, filename, options);
		case 'svg':
			return exportToSvg(element, filename);
		case 'pdf':
			// PDF export would require additional library like jspdf
			console.warn('PDF export not yet implemented');
			return false;
		default:
			return false;
	}
}

// Download data URL as file
function downloadDataUrl(dataUrl: string, filename: string) {
	const link = document.createElement('a');
	link.download = filename;
	link.href = dataUrl;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

// Copy image to clipboard
export async function copyImageToClipboard(element: HTMLElement): Promise<boolean> {
	try {
		const { toBlob } = await import('html-to-image');

		const blob = await toBlob(element, {
			backgroundColor: '#000000',
			pixelRatio: 2
		});

		if (!blob) {
			throw new Error('Failed to create blob');
		}

		await navigator.clipboard.write([
			new ClipboardItem({
				'image/png': blob
			})
		]);

		return true;
	} catch (error) {
		console.error('Failed to copy image:', error);
		return false;
	}
}

// Generate share URL
export function generateShareUrl(
	baseUrl: string,
	username: string,
	options?: { template?: string; theme?: string }
): string {
	const params = new URLSearchParams();

	if (options?.template && options.template !== 'github') {
		params.set('template', options.template);
	}
	if (options?.theme && options.theme !== 'dark') {
		params.set('theme', options.theme);
	}

	const queryString = params.toString();
	return `${baseUrl}/${username}${queryString ? `?${queryString}` : ''}`;
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Fallback for older browsers
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.left = '-9999px';
		document.body.appendChild(textarea);
		textarea.select();
		const success = document.execCommand('copy');
		document.body.removeChild(textarea);
		return success;
	}
}

// Share using Web Share API
export async function shareUrl(
	url: string,
	title: string,
	text: string
): Promise<boolean> {
	if (navigator.share) {
		try {
			await navigator.share({ url, title, text });
			return true;
		} catch (error) {
			// User cancelled or error occurred
			console.log('Share cancelled or failed:', error);
			return false;
		}
	}
	// Fallback to copy
	return copyToClipboard(url);
}
