const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');

export interface SimpleSwapCurrency {
	name: string;
	symbol: string;
	network?: string;
	is_enabled?: boolean;
	is_fiat?: boolean;
	precision?: number;
	address_explorer?: string;
	tx_explorer?: string;
}

export interface SimpleSwapEstimate {
	currency_from: string;
	currency_to: string;
	amount: string;
	estimated_amount: string;
	rate_id?: string;
	fixed?: boolean;
}

export interface SimpleSwapCreatePayload {
	currency_from: string;
	currency_to: string;
	amount: string | number;
	address_to: string;
	fixed?: boolean;
	rate_id?: string;
	extra_id?: string;
	refund_address?: string;
	refund_extra_id?: string;
	user_referral?: string;
}

export interface SimpleSwapCreateResponse {
	success: boolean;
	exchange: {
		id: string;
		amount_from: string;
		amount_to: string;
		currency_from: string;
		currency_to: string;
		address_to: string;
		address_from?: string;
		extra_id?: string;
		status: string;
		created_at: string;
		payin_address?: string;
		payin_extra_id?: string;
	};
}

async function parseJsonOrThrow(resp: Response) {
	const ct = resp.headers.get('content-type') || '';
	if (!resp.ok) {
		const text = await resp.text().catch(() => '');
		throw new Error(`HTTP ${resp.status} ${resp.statusText}: ${text.slice(0, 200)}`);
	}
	if (!ct.includes('application/json')) {
		const text = await resp.text().catch(() => '');
		throw new Error(`Invalid content-type: ${ct || 'unknown'}. Body: ${text.slice(0, 200)}`);
	}
	return resp.json();
}

export async function ssGetCurrencies(): Promise<SimpleSwapCurrency[]> {
	const resp = await fetch(`${API_URL}/simpleswap/currencies`);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка загрузки валют');
	return data.currencies;
}

export async function ssGetMin(from: string, to: string, fixed = false): Promise<number> {
	const resp = await fetch(`${API_URL}/simpleswap/min?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&fixed=${fixed ? 'true' : 'false'}`);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка получения минимума');
	return Number(data.min);
}

export async function ssEstimate(from: string, to: string, amount: string | number, fixed = false): Promise<SimpleSwapEstimate> {
	const resp = await fetch(`${API_URL}/simpleswap/estimate?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(String(amount))}&fixed=${fixed ? 'true' : 'false'}`);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка получения оценки');
	return data.estimate;
}

export async function ssCreateExchange(payload: SimpleSwapCreatePayload): Promise<SimpleSwapCreateResponse> {
	const body = { ...payload, user_referral: localStorage.getItem('referralCode') || undefined };
	const resp = await fetch(`${API_URL}/simpleswap/create`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка создания обмена');
	return data as SimpleSwapCreateResponse;
}

export async function ssGetStatus(id: string) {
	const resp = await fetch(`${API_URL}/simpleswap/status/${encodeURIComponent(id)}`);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка статуса обмена');
	return data.status;
} 