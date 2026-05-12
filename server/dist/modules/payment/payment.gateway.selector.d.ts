import { PaymentGatewayMock } from './payment.gateway.mock';
import { PaymentGatewayReal } from './payment.gateway.real';
import { PaymentGatewayAdapter } from './payment.gateway.types';
export declare class PaymentGatewaySelector {
    private readonly mockGateway;
    private readonly realGateway;
    constructor(mockGateway: PaymentGatewayMock, realGateway: PaymentGatewayReal);
    getCurrentMode(): string;
    getGateway(): PaymentGatewayAdapter;
}
