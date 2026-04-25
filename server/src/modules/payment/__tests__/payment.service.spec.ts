import { PaymentService } from '../payment.service';

describe('PaymentService', () => {
  const paymentRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const orderService = {
    getById: jest.fn(),
    markPaying: jest.fn(),
    markPaid: jest.fn(),
    markPayFailed: jest.fn(),
  };
  const paymentGateway = {
    createClientPayload: jest.fn(),
    buildSuccessNotify: jest.fn(),
    parseNotify: jest.fn(),
  };
  const paymentGatewaySelector = {
    getGateway: jest.fn(),
    getCurrentMode: jest.fn(),
  };

  let service: PaymentService;

  beforeEach(() => {
    jest.clearAllMocks();
    paymentGatewaySelector.getGateway.mockReturnValue(paymentGateway);
    paymentGatewaySelector.getCurrentMode.mockReturnValue('mock');
    service = new PaymentService(paymentRepository as any, orderService as any, paymentGatewaySelector as any);
  });

  it('creates payment record and returns pay params', async () => {
    orderService.getById.mockResolvedValue({
      id: 11,
      order_no: 'COS202604250001',
      user_id: 100,
      status: 'pending',
      pay_status: 'unpaid',
      pay_amount: 88.5,
      out_trade_no: null,
    });
    orderService.markPaying.mockResolvedValue({
      id: 11,
      order_no: 'COS202604250001',
      user_id: 100,
      pay_status: 'paying',
      pay_amount: 88.5,
    });
    paymentGateway.createClientPayload.mockResolvedValue({ invoke_type: 'miniapp_request_payment' });
    paymentRepository.findOne.mockResolvedValue(null);
    paymentRepository.create.mockImplementation((v) => v);
    paymentRepository.save.mockResolvedValue({ id: 1 });

    const result = await service.create(100, { order_id: 11, pay_channel: 'wechat', pay_scene: 'miniapp' });

    expect(result.order_id).toBe(11);
    expect(result.pay_channel).toBe('wechat');
    expect(result.pay_params).toEqual({ invoke_type: 'miniapp_request_payment' });
    expect(orderService.markPaying).toHaveBeenCalled();
    expect(paymentRepository.save).toHaveBeenCalled();
  });

  it('handles success notify idempotently', async () => {
    paymentRepository.findOne.mockResolvedValue({
      id: 1,
      order_id: 22,
      pay_channel: 'wechat',
      status: 'paid',
      out_trade_no: 'P202604250001',
    });

    paymentGateway.parseNotify.mockReturnValue({
      success: true,
      out_trade_no: 'P202604250001',
      third_trade_no: 'wx_123',
      paid_at: new Date().toISOString(),
    });

    const result = await service.handleNotify('wechat', { out_trade_no: 'P202604250001' });

    expect(result).toEqual({ success: true, idempotent: true });
    expect(orderService.markPaid).not.toHaveBeenCalled();
  });
});
