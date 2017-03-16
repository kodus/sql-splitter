import { IToken } from "./IToken";
import { TokenType } from "../enums/TokenType";

export interface ITokenConstructor {
    new(token: string, type: TokenType, startIndex: number, endIndex: number) : IToken;
}
