// Portfolio App Types

export type TemplateType = 'github' | 'bento' | 'minimal';

export type ThemeType = 'dark' | 'light';

export interface PortfolioOptions {
	template: TemplateType;
	theme: ThemeType;
	showContributions: boolean;
	showLanguages: boolean;
	showProjects: boolean;
	showStats: boolean;
	accentColor: string;
}

// Export formats
export type ExportFormat = 'png' | 'pdf' | 'svg';

export interface ExportOptions {
	format: ExportFormat;
	scale: number;
	width: number;
	height: number;
	transparent: boolean;
}

// Toast/notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
	duration?: number;
}

// Form validation
export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

export function validatePlayerHandle(handle: string): ValidationResult {
	const errors: string[] = [];

	if (!handle.trim()) {
		errors.push('请输入玩家 ID');
	} else if (!/^[a-zA-Z0-9_-]{2,32}$/.test(handle.trim())) {
		errors.push('请使用 2-32 位字母、数字、下划线或连字符');
	}

	return { valid: errors.length === 0, errors };
}
