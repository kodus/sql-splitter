import { IQuery } from "../core/interfaces/IQuery";
import { TokenType } from "../core/enums/TokenType";
import { QueryType } from "../core/enums/QueryType";
import { TokenManager } from "../core/TokenManager";
import { MySQLToken } from "./MySQLToken";
import * as lodash from "lodash";

export class MySQLQuery implements IQuery {
    public Query: string;
    public Type: QueryType;
    public StartIndex: number;
    public EndIndex: number;
    public Tokens: Array<MySQLToken>;
    public SubQueries: Array<MySQLQuery>;

    private static buildHierarchy(query: MySQLQuery, nextTokens?: Array<MySQLToken>): void {
        let childQueries = Array<MySQLQuery>();
        let previousReservedToken: MySQLToken;
        for (let index = 0; index < nextTokens.length; index++) {
            let token = nextTokens[index];
            token.Token = token.Token.trim();
            if (token.Token === "") {
                continue;
            }
            let isReserved = token.IsReservedToken();
            if (isReserved === true) {
                let _nextTokens = lodash.slice(nextTokens, index + 1);
                if (token.getToken === "select") {
                    token.Type = TokenType.R_SELECT;
                }
                else if (token.getToken === "from") {
                    token.Type = TokenType.R_FROM;
                }
                else if (token.getToken === "limit") {
                    token.Type = TokenType.R_LIMIT;
                }
                previousReservedToken = token;
            }
            else {
                let currentToken: MySQLToken;
                if (previousReservedToken.Type === TokenType.R_SELECT) {
                    currentToken = new MySQLToken(token.Token, TokenType.COLUMN, token.StartIndex, token.EndIndex);
                }
                else if (previousReservedToken.Type === TokenType.R_FROM) {
                    currentToken = new MySQLToken(token.Token, TokenType.TABLE, token.StartIndex, token.EndIndex);
                }
                else if (previousReservedToken.Type === TokenType.R_LIMIT) {
                    currentToken = new MySQLToken(token.Token, TokenType.LIMIT, token.StartIndex, token.EndIndex);
                }

                query.Tokens.push(currentToken);
            }
        }
    }

    public constructor(query: string, startIndex: number, endIndex: number, tokens: Array<MySQLToken>) {
        this.Query = query;
        this.StartIndex = startIndex;
        this.EndIndex = endIndex;
        this.Tokens = tokens;
        this.SubQueries = [];
        this.setQueryType();
    }

    public BuildQueryHierarchy(): void {
        let query = new MySQLQuery(this.Query, this.StartIndex, this.EndIndex, []);
        query.Type = this.Type;
        MySQLQuery.buildHierarchy(query, this.Tokens);
        console.log(query);
    }

    private setQueryType(): void {
        if (this.Tokens !== null && this.Tokens !== undefined && this.Tokens.length > 0) {
            let token = this.Tokens[0];
            let _token = token.getToken;
            if (_token.indexOf("select")) {
                this.Type = QueryType.SELECT;
            }
            else if (_token.indexOf("insert")) {
                this.Type = QueryType.INSERT;
            }
            else if (_token.indexOf("update")) {
                this.Type = QueryType.UPDATE;
            }
            else if (_token.indexOf("delete")) {
                this.Type = QueryType.DELETE;
            }
        }
    }
}
