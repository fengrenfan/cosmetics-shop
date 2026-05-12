import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderService } from './order.service';
export declare class OrderTask {
    private readonly orderRepository;
    private readonly orderService;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, orderService: OrderService);
    handlePendingTimeout(): Promise<void>;
}
