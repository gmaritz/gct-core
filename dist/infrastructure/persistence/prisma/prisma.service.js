"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
class PrismaService {
    static getInstance() {
        if (!this.instance) {
            throw new Error("Prisma client must be initialized before use");
        }
        return this.instance;
    }
    static setInstance(instance) {
        this.instance = instance;
    }
    static async disconnect() {
        if (this.instance) {
            await this.instance.$disconnect();
            this.instance = null;
        }
    }
}
exports.PrismaService = PrismaService;
//# sourceMappingURL=prisma.service.js.map