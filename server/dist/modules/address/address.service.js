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
exports.AddressService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const address_entity_1 = require("./address.entity");
let AddressService = class AddressService {
    constructor(addressRepository) {
        this.addressRepository = addressRepository;
    }
    async getList(userId) {
        return this.addressRepository.find({
            where: { user_id: userId },
            order: { is_default: 'DESC', created_at: 'DESC' },
        });
    }
    async getById(id, userId) {
        return this.addressRepository.findOne({ where: { id, user_id: userId } });
    }
    async create(dto) {
        if (dto.is_default) {
            await this.clearDefault(dto.user_id);
        }
        const address = this.addressRepository.create({
            ...dto,
            is_default: dto.is_default ? 1 : 0,
        });
        const result = await this.addressRepository.save(address);
        return result;
    }
    async update(id, dto, userId) {
        const address = await this.addressRepository.findOne({ where: { id, user_id: userId } });
        if (!address) {
            throw new common_1.NotFoundException('地址不存在');
        }
        if (dto.is_default) {
            await this.clearDefault(userId);
        }
        Object.assign(address, {
            ...dto,
            is_default: dto.is_default ? 1 : 0,
        });
        await this.addressRepository.save(address);
        return { success: true };
    }
    async remove(id, userId) {
        await this.addressRepository.delete({ id, user_id: userId });
        return { success: true };
    }
    async setDefault(id, userId) {
        await this.clearDefault(userId);
        await this.addressRepository.update(id, { is_default: 1 });
        return { success: true };
    }
    async clearDefault(userId) {
        await this.addressRepository.update({ user_id: userId, is_default: 1 }, { is_default: 0 });
    }
};
exports.AddressService = AddressService;
exports.AddressService = AddressService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(address_entity_1.Address)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AddressService);
//# sourceMappingURL=address.service.js.map