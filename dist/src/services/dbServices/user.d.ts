export default class user {
    static registerUser: (userData: any) => Promise<any>;
    static loginUser: (email: string, password: string) => Promise<any>;
    static refreshToken: (refreshToken: string) => Promise<{
        accessToken: string;
    }>;
}
//# sourceMappingURL=user.d.ts.map