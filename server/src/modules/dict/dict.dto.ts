import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateDictDto {
  @IsString()
  dict_name: string;

  @IsString()
  dict_code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

export class UpdateDictDto {
  @IsString()
  @IsOptional()
  dict_name?: string;

  @IsString()
  @IsOptional()
  dict_code?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number;

  @IsNumber()
  @IsOptional()
  status?: number;
}

export class CreateDictItemDto {
  @IsNumber()
  dict_id: number;

  @IsString()
  item_label: string;

  @IsString()
  item_value: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number;
}

export class UpdateDictItemDto {
  @IsString()
  @IsOptional()
  item_label?: string;

  @IsString()
  @IsOptional()
  item_value?: string;

  @IsNumber()
  @IsOptional()
  sort_order?: number;

  @IsNumber()
  @IsOptional()
  status?: number;
}
