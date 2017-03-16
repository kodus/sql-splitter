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

    private static buildHierarchy(query: MySQLQuery, nextTokens: Array<MySQLToken>): void {
        let childQueries = Array<MySQLQuery>();
        let previousReservedToken: MySQLToken;
        for (let index = 0; index < nextTokens.length; index++) {
            let token = nextTokens[index];
            let _nextTokens = lodash.slice(nextTokens, index + 1);
            token.Token = token.Token.trim();
            if (token.Token === "") {
                continue;
            }
            let isReserved = token.IsReservedToken();
            if (isReserved === true) {
                if (token.getToken === "select") {
                    token.Type = TokenType.R_SELECT;
                }
                else if (token.getToken === "from") {
                    token.Type = TokenType.R_FROM;
                }
                else if (token.getToken === "limit") {
                    token.Type = TokenType.R_LIMIT;
                }
                else if (token.getToken === "inner") {
                    token.Type = TokenType.R_INNER;
                }
                else if (token.getToken === "join") {
                    if (previousReservedToken.Type === TokenType.R_INNER) {
                        token.Type = TokenType.R_INNER_JOIN;
                    }
                    else {
                        token.Type = TokenType.R_JOIN;
                    }
                }
                else if (token.getToken === "on") {
                    if (previousReservedToken.Type === TokenType.R_INNER_JOIN) {
                        token.Type = TokenType.R_ON;
                    }
                }
                else if (token.getToken === "as") {
                    token.Type = TokenType.ALIAS;
                }
                else if (token.getToken === "where") {
                    token.Type = TokenType.R_WHERE;
                }
                else if (token.getToken === "(") {
                    let subquery = new MySQLQuery(null, token.StartIndex + 1, null, []);
                    query.SubQueries.push(subquery);
                    this.buildHierarchy(subquery, _nextTokens);
                    for (let i = 0; i < _nextTokens.length; i++) {
                        let alreadyParsedToken = _nextTokens[i];
                        index++;
                        if (alreadyParsedToken.getToken === ")") {
                            break;
                        }
                    }
                    continue;
                }
                else if (token.getToken === ")") {
                    break;
                }


                if (token.Type !== TokenType.UNKNOWN) {
                    previousReservedToken = token;
                }
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
                else if (previousReservedToken.Type === TokenType.R_INNER_JOIN) {
                    currentToken = new MySQLToken(token.Token, TokenType.TABLE, token.StartIndex, token.EndIndex);
                }
                else if (previousReservedToken.Type === TokenType.R_JOIN) {
                    currentToken = new MySQLToken(token.Token, TokenType.TABLE, token.StartIndex, token.EndIndex);
                }
                else if (previousReservedToken.Type === TokenType.R_ON) {
                    currentToken = new MySQLToken(token.Token, TokenType.COLUMN, token.StartIndex, token.EndIndex);
                }
                else if (previousReservedToken.Type === TokenType.ALIAS) {
                    currentToken = new MySQLToken(token.Token, TokenType.ALIAS, token.StartIndex, token.EndIndex);
                }
                else if (previousReservedToken.Type === TokenType.R_WHERE) {
                    currentToken = new MySQLToken(token.Token, TokenType.COLUMN, token.StartIndex, token.EndIndex);
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

    public BuildQueryHierarchy(): MySQLQuery {
        let query = new MySQLQuery(this.Query, this.StartIndex, this.EndIndex, []);
        query.Type = this.Type;
        MySQLQuery.buildHierarchy(query, this.Tokens);
        return query;
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
