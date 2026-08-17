import { Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    validate(payload: any): Promise<{
        id: any;
        role: string;
    }>;
}
export {};
