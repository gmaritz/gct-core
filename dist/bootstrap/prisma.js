"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = getPrismaClient;
exports.connectPrisma = connectPrisma;
exports.disconnectPrisma = disconnectPrisma;
const client_1 = require("@prisma/client");
let prismaClient = null;
function getPrismaClient() {
    if (!prismaClient) {
        prismaClient = new client_1.PrismaClient();
    }
    return prismaClient;
}
async function connectPrisma() {
    const client = getPrismaClient();
    await client.$connect();
}
async function disconnectPrisma() {
    if (!prismaClient) {
        return;
    }
    await prismaClient.$disconnect();
    prismaClient = null;
}
//# sourceMappingURL=prisma.js.map