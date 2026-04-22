export declare class UploadController {
    constructor();
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
