const isNode = typeof window === 'undefined';

const getStoredToken = () => {
	if (isNode) return '';
	return (
		window.localStorage.getItem('ssi_access_token') ||
		window.localStorage.getItem('base44_access_token') ||
		window.localStorage.getItem('token') ||
		''
	);
};

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	if (isNode) return;
	['ssi_access_token', 'base44_access_token', 'token'].forEach((key) => {
		window.localStorage.removeItem(key);
	});
};

const meta = /** @type {{ env?: Record<string, string | undefined> }} */ (/** @type {unknown} */ (import.meta));
const env = meta.env ?? {};

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}
	return {
		appId: env.VITE_BASE44_APP_ID,
		token: getStoredToken(),
		functionsVersion: env.VITE_BASE44_FUNCTIONS_VERSION,
		appBaseUrl: env.VITE_BASE44_APP_BASE_URL,
	}
};

export const appParams = {
	...getAppParams()
};
