import { Repository } from 'typeorm';
import { Banner } from './banner.entity';
export declare class BannerService {
    private readonly bannerRepository;
    constructor(bannerRepository: Repository<Banner>);
    getActiveList(): Promise<Banner[]>;
    getAllList(): Promise<Banner[]>;
    create(dto: {
        title: string;
        image: string;
        link_type?: string;
        link_id?: string;
        sort_order?: number;
    }): Promise<Banner>;
    update(id: number, dto: {
        title?: string;
        image?: string;
        link_type?: string;
        link_id?: string;
        sort_order?: number;
        status?: number;
    }): Promise<Banner>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
