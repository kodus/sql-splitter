import { IQueryConstructor } from "./interfaces/IQueryConstructor";
import { IQuery } from "./interfaces/IQuery";

export class QueryManager {
    public static createQuery(ctor: IQueryConstructor, query: string, startIndex: number, endIndex: number): IQuery {
        return new ctor(query, startIndex, endIndex);
    }
}
