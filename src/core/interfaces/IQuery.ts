import { IToken } from "./IToken";
import { TokenType } from "../enums/TokenType";
import { QueryType } from "../enums/QueryType";

export interface IQuery {
    Query: string;
    Type: QueryType;
    StartIndex: number;
    EndIndex: number;
    Tokens: Array<IToken>;
    SubQueries: Array<IQuery>;
    BuildQueryHierarchy(): IQuery;
}
