import { IQueryConstructor } from "./interfaces/IQueryConstructor";
import { IQuery } from "./interfaces/IQuery";
import { IToken } from "./interfaces/IToken";

export class QueryManager {
    public static createQuery(ctor: IQueryConstructor, query: string, startIndex: number, endIndex: number, tokens: Array<IToken>): IQuery {
        return new ctor(query, startIndex, endIndex, tokens);
    }
}
