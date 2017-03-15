import { IQuery } from "../core/interfaces/IQuery";

export class MySQLQuery implements IQuery {
    public Query: string;
    public StartIndex: number;
    public EndIndex: number;

    public constructor(query: string, startIndex: number, endIndex: number){
        this.Query = query;
        this.StartIndex = startIndex;
        this.EndIndex = endIndex;
    }
}
