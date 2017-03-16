import { ITokenConstructor } from "./interfaces/ITokenConstructor";
import { IToken } from "./interfaces/IToken";
import { TokenType } from "./enums/TokenType";

export class TokenManager {
    public static createEmptyToken(ctor: ITokenConstructor): IToken {
        return new ctor(null, null, null, null);
    }

    public static createToken(ctor: ITokenConstructor, token: string, type: TokenType, startIndex: number, endIndex: number): IToken {
        return new ctor(token, type, startIndex, endIndex);
    }
}
