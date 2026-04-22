export declare class CreateAddressDto {
    user_id?: number;
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail_address: string;
    postal_code?: string;
    is_default?: boolean;
}
export declare class UpdateAddressDto extends CreateAddressDto {
}
