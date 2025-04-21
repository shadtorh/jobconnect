let vapiSingleton = null;
let vapiInitialized = false;
let vapiCallbacks = [];

// Initialize Vapi only once
export async function initializeVapi() {
	if (vapiInitialized) return vapiSingleton;

	try {
		vapiInitialized = true;
		console.log("Initializing Vapi...");

		// Dynamically import to avoid duplication
		const { default: Vapi } = await import("@vapi-ai/web");
		const apiKey = import.meta.env.VITE_VAPI_API_KEY;

		if (!apiKey) {
			throw new Error("Missing VAPI_API_KEY in environment variables");
		}

		console.log("Creating Vapi instance...");
		const instance = new Vapi(apiKey);

		vapiSingleton = instance;
		console.log("Vapi initialization successful");

		// Notify listeners
		vapiCallbacks.forEach((cb) => cb(instance));
		vapiCallbacks = [];

		return instance;
	} catch (error) {
		console.error("Vapi initialization error:", error);
		vapiSingleton = null;

		// Notify listeners of error
		vapiCallbacks.forEach((cb) => cb(null));
		vapiCallbacks = [];

		return null;
	}
}

export function getVapiInstance() {
	if (!vapiInitialized) {
		initializeVapi();
	}
	return vapiSingleton;
}

export function onVapiReady(callback) {
	if (vapiSingleton) {
		// Already initialized, call immediately
		callback(vapiSingleton);
	} else {
		// Add to callback queue
		vapiCallbacks.push(callback);
	}

	return () => {
		vapiCallbacks = vapiCallbacks.filter((cb) => cb !== callback);
	};
}

// Start initialization right away
initializeVapi();
