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

function isServerError(e: unknown): boolean {
	const msg = e instanceof Error ? e.message : String(e || '');
	return /HTTP\s5\d\d/.test(msg);
}

function delay(ms: number) {
	return new Promise((res) => setTimeout(res, ms));
}

export async function ssGetCurrencies(): Promise<SimpleSwapCurrency[]> {
	const resp = await fetch(`${API_URL}/simpleswap/currencies`);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка загрузки валют');
	return data.currencies;
}

export async function ssGetPairs(symbol: string, fixed = false): Promise<string[]> {
	const resp = await fetch(`${API_URL}/simpleswap/pairs?symbol=${encodeURIComponent(symbol)}&fixed=${fixed ? 'true' : 'false'}`);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка загрузки пар');
	return data.pairs as string[];
}

export async function ssGetMin(from: string, to: string, fixed = false): Promise<number> {
	const resp = await fetch(`${API_URL}/simpleswap/min?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&fixed=${fixed ? 'true' : 'false'}`);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка получения минимума');
	return Number(data.min);
}

export async function ssEstimate(from: string, to: string, amount: string | number, fixed = false): Promise<SimpleSwapEstimate> {
	let lastErr: any = null;
	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			const resp = await fetch(`${API_URL}/simpleswap/estimate?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(String(amount))}&fixed=${fixed ? 'true' : 'false'}`);
			const data = await parseJsonOrThrow(resp);
			if (!data.success) throw new Error(data.error || 'Ошибка получения оценки');
			return data.estimate;
		} catch (e) {
			lastErr = e;
			if (isServerError(e) && attempt < 2) {
				await delay(400 * (attempt + 1));
				continue;
			}
			break;
		}
	}
	throw lastErr || new Error('Ошибка получения оценки');
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

// ===== SimpleSwap Public API v3 =====
export async function ssV3GetCurrencies() {
	const resp = await fetch(`${API_URL}/simpleswap/v3/currencies`);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка загрузки валют v3');
	return data.currencies as Array<{ ticker: string; network?: string; name?: string; }>;
}

export async function ssV3GetPairsAll() {
	const resp = await fetch(`${API_URL}/simpleswap/v3/pairs-all`);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка загрузки пар v3');
	return data.pairs as Array<{ from: { ticker: string; network?: string }, to: { ticker: string; network?: string } } | string[]>;
}

export async function ssV3GetPairsFor(ticker: string, network?: string) {
	const qs = new URLSearchParams({ ticker }).toString();
	const url = `${API_URL}/simpleswap/v3/pairs-for?${network ? `ticker=${encodeURIComponent(ticker)}&network=${encodeURIComponent(network)}` : `ticker=${encodeURIComponent(ticker)}`}`;
	const resp = await fetch(url);
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка загрузки пар v3');
	return data.pairs as string[];
}

export async function ssV3Estimate(body: { from: { ticker: string; network?: string }, to: { ticker: string; network?: string }, amount?: string }) {
	const resp = await fetch(`${API_URL}/simpleswap/v3/estimates`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const data = await parseJsonOrThrow(resp);
	if (!data.success) throw new Error(data.error || 'Ошибка оценки v3');
	return data.estimate;
} 