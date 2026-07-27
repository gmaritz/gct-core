"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClient = getPrismaClient;
exports.connectPrisma = connectPrisma;
exports.disconnectPrisma = disconnectPrisma;
exports.isPrismaReady = isPrismaReady;
const client_1 = require("@prisma/client");
let prismaClient = null;
let prismaReady = false;
function getPrismaClient() {
    if (!prismaClient) {
        prismaClient = new client_1.PrismaClient();
    }
    return prismaClient;
}
async function connectPrisma() {
    const client = getPrismaClient();
    await client.$connect();
    prismaReady = true;
}
async function disconnectPrisma() {
    if (!prismaClient) {
        prismaReady = false;
        return;
    }
    await prismaClient.$disconnect();
    prismaClient = null;
    prismaReady = false;
}
function isPrismaReady() {
    return prismaReady;
}
//# sourceMappingURL=prisma.js.map