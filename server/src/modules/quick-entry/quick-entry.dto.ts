export class CreateQuickEntryDto {
  title: string;
  icon?: string;
  type?: string;
  target_id?: string;
  sort_order?: number;
  status?: number;
}

export class UpdateQuickEntryDto {
  title?: string;
  icon?: string;
  type?: string;
  target_id?: string;
  sort_order?: number;
  status?: number;
}
