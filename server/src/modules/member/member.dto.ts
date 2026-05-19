import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMemberLevelDto {
  @IsString()
  name: string;

  @IsNumber()
  discount_rate: number;

  @IsOptional()
  @IsString()
  benefit_desc?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;
}

export class UpdateMemberLevelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  discount_rate?: number;

  @IsOptional()
  @IsString()
  benefit_desc?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;

  @IsOptional()
  @IsInt()
  status?: number;
}

export class CreatePerformancePeriodDto {
  @IsString()
  period_code: string;

  @IsString()
  name: string;

  @IsString()
  start_date: string;

  @IsString()
  end_date: string;

  @IsOptional()
  @IsNumber()
  qualified_threshold?: number;

  @IsOptional()
  @IsInt()
  status?: number;
}

export class UpdatePerformancePeriodDto {
  @IsOptional()
  @IsString()
  period_code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  qualified_threshold?: number;

  @IsOptional()
  @IsInt()
  status?: number;
}

export class UpdateDepartmentPerformanceDto {
  @IsOptional()
  @IsString()
  dept_name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  total_members?: number;

  @IsOptional()
  @IsNumber()
  total_performance?: number;

  @IsOptional()
  @IsNumber()
  effective_performance?: number;

  @IsOptional()
  @IsInt()
  status?: number;
}

export class UpdateUserMemberDto {
  @IsOptional()
  @IsInt()
  member_level_id?: number;

  @IsOptional()
  @IsInt()
  parent_id?: number;
}
