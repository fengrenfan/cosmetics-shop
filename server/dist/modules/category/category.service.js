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
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./category.entity");
const cosmeticsCategories = [
    { name: '护肤', sort_order: 1, children: [
            { name: '面膜', sort_order: 1 },
            { name: '乳液/面霜', sort_order: 2 },
            { name: '精华', sort_order: 3 },
            { name: '洁面', sort_order: 4 },
            { name: '防晒', sort_order: 5 },
            { name: '爽肤水', sort_order: 6 },
            { name: '眼霜', sort_order: 7 },
        ] },
    { name: '彩妆', sort_order: 2, children: [
            { name: '口红', sort_order: 1 },
            { name: '唇釉', sort_order: 2 },
            { name: '眼影', sort_order: 3 },
            { name: '粉底', sort_order: 4 },
            { name: '遮瑕', sort_order: 5 },
            { name: '睫毛膏', sort_order: 6 },
            { name: '眉笔/眉粉', sort_order: 7 },
            { name: '腮红', sort_order: 8 },
            { name: '高光/修容', sort_order: 9 },
            { name: '定妆', sort_order: 10 },
        ] },
    { name: '香水', sort_order: 3, children: [
            { name: '女士香水', sort_order: 1 },
            { name: '男士香水', sort_order: 2 },
            { name: '中性香水', sort_order: 3 },
        ] },
    { name: '美发', sort_order: 4, children: [
            { name: '洗发水', sort_order: 1 },
            { name: '护发素', sort_order: 2 },
            { name: '发膜', sort_order: 3 },
            { name: '造型工具', sort_order: 4 },
        ] },
    { name: '美甲', sort_order: 5, children: [
            { name: '指甲油', sort_order: 1 },
            { name: '美甲工具', sort_order: 2 },
            { name: '卸甲', sort_order: 3 },
        ] },
    { name: '工具/配件', sort_order: 6, children: [
            { name: '化妆刷', sort_order: 1 },
            { name: '美妆蛋', sort_order: 2 },
            { name: '睫毛夹', sort_order: 3 },
            { name: '面膜刷', sort_order: 4 },
            { name: '化妆包', sort_order: 5 },
        ] },
];
let CategoryService = class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async onModuleInit() {
        const count = await this.categoryRepository.count();
        if (count === 0) {
            console.log('📦 初始化化妆品类目数据...');
            for (const cat of cosmeticsCategories) {
                const parent = await this.categoryRepository.save({
                    name: cat.name,
                    parent_id: 0,
                    level: 1,
                    sort_order: cat.sort_order,
                    icon: '',
                    status: 1,
                });
                if (cat.children?.length) {
                    for (const child of cat.children) {
                        await this.categoryRepository.save({
                            name: child.name,
                            parent_id: parent.id,
                            level: 2,
                            sort_order: child.sort_order,
                            icon: '',
                            status: 1,
                        });
                    }
                }
            }
            console.log('✅ 化妆品类目数据初始化完成');
        }
    }
    async getTree() {
        const allCategories = await this.categoryRepository.find({
            where: { status: 1 },
            order: { sort_order: 'ASC', id: 'ASC' },
        });
        return this.buildTree(allCategories, 0);
    }
    async getList() {
        return this.categoryRepository.find({
            order: { sort_order: 'ASC', id: 'ASC' },
        });
    }
    async create(dto) {
        const parentId = dto.parent_id || 0;
        let level = 1;
        if (parentId > 0) {
            const parent = await this.categoryRepository.findOne({ where: { id: parentId } });
            if (parent) {
                level = parent.level + 1;
            }
        }
        const category = this.categoryRepository.create({
            name: dto.name,
            parent_id: parentId,
            level,
            sort_order: dto.sort_order || 0,
            icon: dto.icon,
            status: 1,
        });
        return this.categoryRepository.save(category);
    }
    async update(id, dto) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('分类不存在');
        }
        if (dto.name !== undefined)
            category.name = dto.name;
        if (dto.parent_id !== undefined)
            category.parent_id = dto.parent_id;
        if (dto.sort_order !== undefined)
            category.sort_order = dto.sort_order;
        if (dto.icon !== undefined)
            category.icon = dto.icon;
        if (dto.status !== undefined)
            category.status = dto.status;
        if (dto.parent_id !== undefined) {
            const parentId = dto.parent_id;
            let level = 1;
            if (parentId > 0) {
                const parent = await this.categoryRepository.findOne({ where: { id: parentId } });
                if (parent) {
                    level = parent.level + 1;
                }
            }
            category.level = level;
        }
        return this.categoryRepository.save(category);
    }
    async delete(id) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('分类不存在');
        }
        const children = await this.categoryRepository.find({ where: { parent_id: id } });
        if (children.length > 0) {
            throw new common_1.NotFoundException('请先删除子分类');
        }
        await this.categoryRepository.delete(id);
        return { success: true };
    }
    buildTree(categories, parentId, level = 1) {
        return categories
            .filter((c) => c.parent_id === parentId)
            .map((c) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            level,
            status: c.status,
            parent_id: c.parent_id,
            sort_order: c.sort_order,
            hasChildren: categories.some(child => child.parent_id === c.id),
            children: this.buildTree(categories, c.id, level + 1),
        }));
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryService);
//# sourceMappingURL=category.service.js.map