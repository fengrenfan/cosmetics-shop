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
exports.BannerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const banner_entity_1 = require("./banner.entity");
let BannerService = class BannerService {
    constructor(bannerRepository) {
        this.bannerRepository = bannerRepository;
    }
    async getActiveList() {
        return this.bannerRepository.find({
            where: { status: 1 },
            order: { sort_order: 'ASC', created_at: 'DESC' },
        });
    }
    async getAllList() {
        return this.bannerRepository.find({
            order: { sort_order: 'ASC', created_at: 'DESC' },
        });
    }
    async create(dto) {
        const banner = this.bannerRepository.create({
            title: dto.title,
            image: dto.image,
            link_type: dto.link_type || 'none',
            link_id: dto.link_id,
            sort_order: dto.sort_order || 0,
            status: 1,
        });
        return this.bannerRepository.save(banner);
    }
    async update(id, dto) {
        const banner = await this.bannerRepository.findOne({ where: { id } });
        if (!banner) {
            throw new common_1.NotFoundException('Banner不存在');
        }
        if (dto.title !== undefined)
            banner.title = dto.title;
        if (dto.image !== undefined)
            banner.image = dto.image;
        if (dto.link_type !== undefined)
            banner.link_type = dto.link_type;
        if (dto.link_id !== undefined)
            banner.link_id = dto.link_id;
        if (dto.sort_order !== undefined)
            banner.sort_order = dto.sort_order;
        if (dto.status !== undefined)
            banner.status = dto.status;
        return this.bannerRepository.save(banner);
    }
    async delete(id) {
        const banner = await this.bannerRepository.findOne({ where: { id } });
        if (!banner) {
            throw new common_1.NotFoundException('Banner不存在');
        }
        await this.bannerRepository.delete(id);
        return { success: true };
    }
};
exports.BannerService = BannerService;
exports.BannerService = BannerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(banner_entity_1.Banner)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BannerService);
//# sourceMappingURL=banner.service.js.map