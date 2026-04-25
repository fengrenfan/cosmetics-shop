export declare class GetPointsDto {
    user_id: number;
}
export declare class CalculatePointsDto {
    total_amount: number;
    points?: number;
}
export declare class DeductPointsDto {
    user_id: number;
    points: number;
    order_id: number;
}
export declare class AddPointsDto {
    user_id: number;
    points: number;
    order_id?: number;
    remark?: string;
}
