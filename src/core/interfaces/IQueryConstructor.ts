import { IQuery } from "./IQuery";
import { IToken } from "./IToken";

export interface IQueryConstructor {
    new(query: string, startIndex: number, endIndex: number, tokens: Array<IToken>) : IQuery;
}
