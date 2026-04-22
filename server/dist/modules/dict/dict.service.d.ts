import { Repository } from 'typeorm';
import { Dict, DictItem } from './dict.entity';
import { CreateDictDto, UpdateDictDto, CreateDictItemDto, UpdateDictItemDto } from './dict.dto';
export declare class DictService {
    private readonly dictRepository;
    private readonly dictItemRepository;
    constructor(dictRepository: Repository<Dict>, dictItemRepository: Repository<DictItem>);
    getDictList(): Promise<Dict[]>;
    getAllDictsWithItems(): Promise<{
        items: DictItem[];
        id: number;
        dict_name: string;
        dict_code: string;
        description: string;
        sort_order: number;
        status: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    createDict(dto: CreateDictDto): Promise<Dict>;
    updateDict(id: number, dto: UpdateDictDto): Promise<Dict>;
    deleteDict(id: number): Promise<{
        success: boolean;
    }>;
    getDictItems(dictId?: number): Promise<DictItem[]>;
    createDictItem(dto: CreateDictItemDto): Promise<DictItem>;
    updateDictItem(id: number, dto: UpdateDictItemDto): Promise<DictItem>;
    deleteDictItem(id: number): Promise<{
        success: boolean;
    }>;
}
