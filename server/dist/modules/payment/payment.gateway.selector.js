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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewaySelector = void 0;
const common_1 = require("@nestjs/common");
const payment_gateway_mock_1 = require("./payment.gateway.mock");
const payment_gateway_real_1 = require("./payment.gateway.real");
let PaymentGatewaySelector = class PaymentGatewaySelector {
    constructor(mockGateway, realGateway) {
        this.mockGateway = mockGateway;
        this.realGateway = realGateway;
    }
    getCurrentMode() {
        return (process.env.PAY_MODE || 'mock').toLowerCase();
    }
    getGateway() {
        const mode = this.getCurrentMode();
        if (mode === 'mock')
            return this.mockGateway;
        if (mode === 'sandbox' || mode === 'prod')
            return this.realGateway;
        throw new common_1.BadRequestException(`不支持的 PAY_MODE: ${mode}`);
    }
};
exports.PaymentGatewaySelector = PaymentGatewaySelector;
exports.PaymentGatewaySelector = PaymentGatewaySelector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payment_gateway_mock_1.PaymentGatewayMock,
        payment_gateway_real_1.PaymentGatewayReal])
], PaymentGatewaySelector);
//# sourceMappingURL=payment.gateway.selector.js.map