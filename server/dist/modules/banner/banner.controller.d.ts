import { BannerService } from './banner.service';
export declare class BannerController {
    private readonly bannerService;
    constructor(bannerService: BannerService);
    getList(): Promise<import("./banner.entity").Banner[]>;
    getAdminList(): Promise<import("./banner.entity").Banner[]>;
    create(dto: {
        title: string;
        subtitle?: string;
        tag?: string;
        image: string;
        link_type?: string;
        link_id?: string;
        sort_order?: number;
    }): Promise<import("./banner.entity").Banner>;
    update(id: number, dto: {
        title?: string;
        subtitle?: string;
        tag?: string;
        image?: string;
        link_type?: string;
        link_id?: string;
        sort_order?: number;
        status?: number;
    }): Promise<import("./banner.entity").Banner>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
