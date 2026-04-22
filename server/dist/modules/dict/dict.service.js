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
exports.DictService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dict_entity_1 = require("./dict.entity");
let DictService = class DictService {
    constructor(dictRepository, dictItemRepository) {
        this.dictRepository = dictRepository;
        this.dictItemRepository = dictItemRepository;
    }
    async getDictList() {
        return this.dictRepository.find({
            order: { sort_order: 'ASC', id: 'ASC' },
        });
    }
    async getAllDictsWithItems() {
        const dicts = await this.dictRepository.find({
            order: { sort_order: 'ASC', id: 'ASC' },
        });
        const items = await this.dictItemRepository.find({
            order: { sort_order: 'ASC', id: 'ASC' },
        });
        return dicts.map(dict => ({
            ...dict,
            items: items.filter(item => item.dict_id === dict.id),
        }));
    }
    async createDict(dto) {
        const dict = this.dictRepository.create({
            dict_name: dto.dict_name,
            dict_code: dto.dict_code,
            description: dto.description,
            sort_order: dto.sort_order || 0,
            status: 1,
        });
        return this.dictRepository.save(dict);
    }
    async updateDict(id, dto) {
        const dict = await this.dictRepository.findOne({ where: { id } });
        if (!dict) {
            throw new common_1.NotFoundException('字典不存在');
        }
        if (dto.dict_name !== undefined)
            dict.dict_name = dto.dict_name;
        if (dto.dict_code !== undefined)
            dict.dict_code = dto.dict_code;
        if (dto.description !== undefined)
            dict.description = dto.description;
        if (dto.sort_order !== undefined)
            dict.sort_order = dto.sort_order;
        if (dto.status !== undefined)
            dict.status = dto.status;
        return this.dictRepository.save(dict);
    }
    async deleteDict(id) {
        const dict = await this.dictRepository.findOne({ where: { id } });
        if (!dict) {
            throw new common_1.NotFoundException('字典不存在');
        }
        await this.dictItemRepository.delete({ dict_id: id });
        await this.dictRepository.delete(id);
        return { success: true };
    }
    async getDictItems(dictId) {
        const where = dictId ? { dict_id: dictId } : {};
        return this.dictItemRepository.find({
            where,
            order: { sort_order: 'ASC', id: 'ASC' },
        });
    }
    async createDictItem(dto) {
        const dict = await this.dictRepository.findOne({ where: { id: dto.dict_id } });
        if (!dict) {
            throw new common_1.NotFoundException('字典不存在');
        }
        const item = this.dictItemRepository.create({
            dict_id: dto.dict_id,
            item_label: dto.item_label,
            item_value: dto.item_value,
            sort_order: dto.sort_order || 0,
            status: 1,
        });
        return this.dictItemRepository.save(item);
    }
    async updateDictItem(id, dto) {
        const item = await this.dictItemRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('字典项不存在');
        }
        if (dto.item_label !== undefined)
            item.item_label = dto.item_label;
        if (dto.item_value !== undefined)
            item.item_value = dto.item_value;
        if (dto.sort_order !== undefined)
            item.sort_order = dto.sort_order;
        if (dto.status !== undefined)
            item.status = dto.status;
        return this.dictItemRepository.save(item);
    }
    async deleteDictItem(id) {
        const item = await this.dictItemRepository.findOne({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException('字典项不存在');
        }
        await this.dictItemRepository.delete(id);
        return { success: true };
    }
};
exports.DictService = DictService;
exports.DictService = DictService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dict_entity_1.Dict)),
    __param(1, (0, typeorm_1.InjectRepository)(dict_entity_1.DictItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DictService);
//# sourceMappingURL=dict.service.js.map