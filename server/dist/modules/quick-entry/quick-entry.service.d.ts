import { Repository } from 'typeorm';
import { QuickEntry } from './quick-entry.entity';
import { CreateQuickEntryDto, UpdateQuickEntryDto } from './quick-entry.dto';
export declare class QuickEntryService {
    private readonly quickEntryRepository;
    constructor(quickEntryRepository: Repository<QuickEntry>);
    getActiveList(): Promise<QuickEntry[]>;
    getAllList(): Promise<QuickEntry[]>;
    create(dto: CreateQuickEntryDto): Promise<QuickEntry>;
    update(id: number, dto: UpdateQuickEntryDto): Promise<QuickEntry>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
