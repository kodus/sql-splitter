import { IQuery } from "./IQuery";

export interface IQueryConstructor {
    new(query: string, startIndex: number, endIndex: number) : IQuery;
}
