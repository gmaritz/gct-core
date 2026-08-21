import { PlatformInfoService } from "../../../application/platform";

export function createOpenApiInfo(): Record<string, unknown> {
	const platformInfoService = new PlatformInfoService();
	const platformInfo = platformInfoService.getPlatformInfo();

	return {
		title: "GCT Core API",
		version: platformInfo.version,
		description: "Platform foundation endpoints for the GCT Core service.",
		contact: {
			name: "Go Cape Tours",
			email: "support@gct-core.dev",
		},
		license: {
			name: "ISC",
			url: "https://opensource.org/license/isc",
		},
	};
}
