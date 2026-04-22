"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickEntryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const quick_entry_entity_1 = require("./quick-entry.entity");
let QuickEntryService = class QuickEntryService {
    constructor(quickEntryRepository) {
        this.quickEntryRepository = quickEntryRepository;
    }
    async getActiveList() {
        return this.quickEntryRepository.find({
            where: { status: 1 },
            order: { sort_order: 'ASC', created_at: 'DESC' },
        });
    }
    async getAllList() {
        return this.quickEntryRepository.find({
            order: { sort_order: 'ASC', created_at: 'DESC' },
        });
    }
    async create(dto) {
        const quickEntry = this.quickEntryRepository.create({
            title: dto.title,
            icon: dto.icon,
            type: dto.type || 'none',
            target_id: dto.target_id,
            sort_order: dto.sort_order || 0,
            status: dto.status ?? 1,
        });
        return this.quickEntryRepository.save(quickEntry);
    }
    async update(id, dto) {
        const quickEntry = await this.quickEntryRepository.findOne({ where: { id } });
        if (!quickEntry) {
            throw new common_1.NotFoundException('快捷入口不存在');
        }
        if (dto.title !== undefined)
            quickEntry.title = dto.title;
        if (dto.icon !== undefined)
            quickEntry.icon = dto.icon;
        if (dto.type !== undefined)
            quickEntry.type = dto.type;
        if (dto.target_id !== undefined)
            quickEntry.target_id = dto.target_id;
        if (dto.sort_order !== undefined)
            quickEntry.sort_order = dto.sort_order;
        if (dto.status !== undefined)
            quickEntry.status = dto.status;
        return this.quickEntryRepository.save(quickEntry);
    }
    async delete(id) {
        const quickEntry = await this.quickEntryRepository.findOne({ where: { id } });
        if (!quickEntry) {
            throw new common_1.NotFoundException('快捷入口不存在');
        }
        await this.quickEntryRepository.delete(id);
        return { success: true };
    }
};
exports.QuickEntryService = QuickEntryService;
exports.QuickEntryService = QuickEntryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quick_entry_entity_1.QuickEntry)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], QuickEntryService);
//# sourceMappingURL=quick-entry.service.js.map