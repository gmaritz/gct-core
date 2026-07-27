import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;
let prismaReady = false;

export function getPrismaClient(): PrismaClient {
	if (!prismaClient) {
		prismaClient = new PrismaClient();
	}

	return prismaClient;
}

export async function connectPrisma(): Promise<void> {
	const client = getPrismaClient();
	await client.$connect();
	prismaReady = true;
}

export async function disconnectPrisma(): Promise<void> {
	if (!prismaClient) {
		prismaReady = false;
		return;
	}

	await prismaClient.$disconnect();
	prismaClient = null;
	prismaReady = false;
}

export function isPrismaReady(): boolean {
	return prismaReady;
}
