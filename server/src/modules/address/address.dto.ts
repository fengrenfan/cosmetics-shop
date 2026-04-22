import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  province: string;

  @IsString()
  city: string;

  @IsString()
  district: string;

  @IsString()
  detail_address: string;

  @IsOptional()
  @IsString()
  postal_code?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

export class UpdateAddressDto extends CreateAddressDto {}
