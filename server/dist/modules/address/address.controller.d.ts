import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';
export declare class AddressController {
    private readonly addressService;
    constructor(addressService: AddressService);
    getList(req: any): Promise<import("./address.entity").Address[]>;
    create(req: any, dto: CreateAddressDto): Promise<import("./address.entity").Address[]>;
    update(req: any, id: string, dto: UpdateAddressDto): Promise<{
        success: boolean;
    }>;
    remove(req: any, id: string): Promise<{
        success: boolean;
    }>;
    setDefault(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
