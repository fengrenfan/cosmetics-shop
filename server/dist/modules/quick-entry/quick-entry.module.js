"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickEntryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quick_entry_entity_1 = require("./quick-entry.entity");
const quick_entry_service_1 = require("./quick-entry.service");
const quick_entry_controller_1 = require("./quick-entry.controller");
let QuickEntryModule = class QuickEntryModule {
};
exports.QuickEntryModule = QuickEntryModule;
exports.QuickEntryModule = QuickEntryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([quick_entry_entity_1.QuickEntry])],
        controllers: [quick_entry_controller_1.QuickEntryController],
        providers: [quick_entry_service_1.QuickEntryService],
        exports: [quick_entry_service_1.QuickEntryService],
    })
], QuickEntryModule);
//# sourceMappingURL=quick-entry.module.js.map