import { Repository } from 'typeorm';
import { Address } from './address.entity';
export declare class AddressService {
    private readonly addressRepository;
    constructor(addressRepository: Repository<Address>);
    getList(userId: number): Promise<Address[]>;
    getById(id: number, userId: number): Promise<Address>;
    create(dto: any): Promise<Address[]>;
    update(id: number, dto: any, userId: number): Promise<{
        success: boolean;
    }>;
    remove(id: number, userId: number): Promise<{
        success: boolean;
    }>;
    setDefault(id: number, userId: number): Promise<{
        success: boolean;
    }>;
    private clearDefault;
}
