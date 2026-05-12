"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_module_1 = require("../order/order.module");
const payment_controller_1 = require("./payment.controller");
const payment_service_1 = require("./payment.service");
const payment_gateway_mock_1 = require("./payment.gateway.mock");
const payment_gateway_real_1 = require("./payment.gateway.real");
const payment_gateway_selector_1 = require("./payment.gateway.selector");
const payment_entity_1 = require("./payment.entity");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([payment_entity_1.PaymentRecord]), order_module_1.OrderModule],
        controllers: [payment_controller_1.PaymentController],
        providers: [payment_service_1.PaymentService, payment_gateway_mock_1.PaymentGatewayMock, payment_gateway_real_1.PaymentGatewayReal, payment_gateway_selector_1.PaymentGatewaySelector],
        exports: [payment_service_1.PaymentService],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map