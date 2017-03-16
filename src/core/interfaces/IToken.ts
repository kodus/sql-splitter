import { TokenType } from "../enums/TokenType";

export interface IToken {
    Token: string;
    Type: TokenType;
    StartIndex: number;
    EndIndex: number;
    GetReservedTokens(): Array<IToken>;
    IsReservedToken(): boolean;
}
