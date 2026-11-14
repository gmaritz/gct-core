export interface DevelopmentIngressConfig {
	readonly peerAddress: "127.0.0.1";
	readonly credential: string;
}

export function loadDevelopmentIngressConfig(
	env: NodeJS.ProcessEnv,
	environment: string,
): DevelopmentIngressConfig | undefined {
	const enabled = env.GCT_DEV_NGROK_INGRESS;
	if (enabled !== undefined && enabled !== "true" && enabled !== "false") {
		throw new Error("GCT_DEV_NGROK_INGRESS must be true or false.");
	}
	if (enabled !== "true") return undefined;
	if (environment !== "development" || env.NODE_ENV !== "development" || env.PAYFAST_ENVIRONMENT !== "SANDBOX") {
		throw new Error("GCT_DEV_NGROK_INGRESS requires NODE_ENV=development and PAYFAST_ENVIRONMENT=SANDBOX.");
	}
	if (env.GCT_DEV_INGRESS_PEER_IP !== "127.0.0.1") {
		throw new Error("GCT_DEV_INGRESS_PEER_IP must be 127.0.0.1.");
	}
	if (!env.GCT_DEV_INGRESS_TOKEN || !/^[a-f0-9]{64}$/.test(env.GCT_DEV_INGRESS_TOKEN)) {
		throw new Error("GCT_DEV_INGRESS_TOKEN must be 64 lowercase hexadecimal characters.");
	}
	return Object.freeze({ peerAddress: "127.0.0.1", credential: env.GCT_DEV_INGRESS_TOKEN });
}
