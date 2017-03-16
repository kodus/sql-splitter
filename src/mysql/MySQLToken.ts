import { IToken } from "../core/interfaces/IToken";
import { TokenType } from "../core/enums/TokenType";
import * as fs from "fs";
import * as lodash from "lodash";
import * as path from "path";

export class MySQLToken implements IToken {
    public Token: string;
    public Type: TokenType;
    public StartIndex: number;
    public EndIndex: number;

    public constructor(token: string, type: TokenType, startIndex: number, endIndex: number) {
        this.Token = token;
        this.Type = type;
        this.StartIndex = startIndex;
        this.EndIndex = endIndex;
    }

    public get getToken(): string {
        let _token = this.Token.trim();
        _token = this.Token.toLowerCase();
        return _token;
    }

    public GetReservedTokens(): Array<MySQLToken> {
        let tokens = Array<MySQLToken>();
        let resourceJson: Array<any> = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../resources/mysql/tokens.json"),
            "UTF-8"));

        resourceJson.forEach(token => {
            let _token = token.Token.toLowerCase();
            let _type: TokenType;
            if (_token === "select") {
                _type = TokenType.R_SELECT;
            }
            let tokenObject = new MySQLToken(_token, _type, null, null);
            tokens.push(tokenObject);
        });

        return tokens;
    }

    public IsReservedToken(): boolean {
        let tokens = this.GetReservedTokens();
        let _token = this.getToken;
        let tokenResult = lodash.find(tokens, { Token: _token });

        if (tokenResult === null || tokenResult === undefined) {
            return false;
        }
        return true;
    }
}
