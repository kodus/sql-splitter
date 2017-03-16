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

    public constructor(query: string, startIndex: number, endIndex: number, tokens: Array<MySQLToken>) {
        this.Query = query;
        this.StartIndex = startIndex;
        this.EndIndex = endIndex;
        this.Tokens = tokens;
        this.SubQueries = [];
        this.setQueryType();
    }

    public BuildQueryHierarchy(): void {
        this.buildHierarchy(null, this.Tokens);
    }

    private setQueryType(): void {
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

    private buildHierarchy(previousReservedToken?: MySQLToken, nextTokens?: Array<MySQLToken>): void {
        let tokens = Array<MySQLToken>();
        let childQueries = Array<MySQLQuery>();
        for (let index = 0; index < nextTokens.length; index++) {
            let token = nextTokens[index];
            let isReserved = token.IsReservedToken();
            if (isReserved === true) {
                let _nextTokens = lodash.slice(nextTokens, index + 1);
                if (token.getToken === "select") {
                    token.Type = TokenType.R_SELECT;
                }
                else if (token.getToken === "from") {
                    token.Type = TokenType.R_FROM;
                }
                this.buildHierarchy(token, _nextTokens);
            }
            else {
                let currentToken: MySQLToken;
                if (previousReservedToken.Type === TokenType.R_SELECT) {
                     currentToken = new MySQLToken(token.Token, TokenType.COLUMN, token.StartIndex, token.EndIndex);
                }
                else if (previousReservedToken.Type === TokenType.R_FROM) {
                     currentToken = new MySQLToken(token.Token, TokenType.TABLE, token.StartIndex, token.EndIndex);
                }

                tokens.push(currentToken);
            }
        }
    }
}
