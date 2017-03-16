import { IQuery } from "./core/interfaces/IQuery";
import { IToken } from "./core/interfaces/IToken";
import { QueryManager } from "./core/QueryManager";
import { TokenManager } from "./core/TokenManager";
import { DatabaseType } from "./core/enums/DatabaseType";
import { MySQLQuery } from "./mysql/MySQLQuery";
import { MySQLToken } from "./mysql/MySQLToken";
import { TokenType } from "./core/enums/TokenType";

export class TSParser {
    public static databaseType: DatabaseType;
    public static lastQueryEndingGlobalIndex: number;
    public static tokenManager: IToken;

    public static parse(query: string, dbType: DatabaseType, delimiter: string): Array<IQuery> {
        this.databaseType = dbType;
        let queries: Array<IQuery> = [];
        let flag = true;
        let restOfQuery = null;
        this.lastQueryEndingGlobalIndex = 0;
        this.tokenManager = this.createEmptyToken();

        while (flag) {
            if (restOfQuery == null) {
                restOfQuery = query;
            }
            let statementAndRest = this.getStatements(restOfQuery, delimiter);

            let statement: IQuery = statementAndRest[0];
            if (statement != null && statement.Query !== null && statement.Query.trim() !== "") {
                queries.push(statement);
            }

            restOfQuery = statementAndRest[1];
            if (restOfQuery == null || restOfQuery.trim() === "") {
                break;
            }
        }
        queries.forEach(element => {
            element.BuildQueryHierarchy();
        });
        return queries;
    }

    private static getStatements(query: string, delimiter: string): Array<any> {
        let charArray: Array<string> = Array.from(query);
        let previousChar: string = null;
        let nextChar: string = null;
        let isInComment = false;
        let commentChar: string = null;
        let isInString = false;
        let stringChar: string = null;
        let isInTag = false;
        let tagChar: string = null;
        let tokens: Array<IToken> = [];
        let resultQueries: Array<any> = [];
        let token = "";
        for (let index = 0; index < charArray.length; index++) {

            let char = charArray[index];
            if (index > 0) {
                previousChar = charArray[index - 1];
            }

            if (index < charArray.length) {
                nextChar = charArray[index + 1];
            }

            // it's in string, go to next char
            if (previousChar !== "\\" && (char === "'" || char === "\"") && isInString === false && isInComment === false) {
                isInString = true;
                stringChar = char;
                continue;
            }

            // it's comment, go to next char
            if (((char === "#" && nextChar === " ") || (char === "-" && nextChar === "-") || (char === "/" && nextChar === "*"))
                && isInString === false) {
                isInComment = true;
                commentChar = char;
                continue;
            }
            // it's end of comment, go to next
            if (isInComment === true && (((commentChar === "#" || commentChar === "-") && char === "\n") ||
                (commentChar === "/" && (char === "*" && nextChar === "/")))) {
                isInComment = false;
                commentChar = null;
                continue;
            }

            // string closed, go to next char
            if (previousChar !== "\\" && char === stringChar && isInString === true) {
                isInString = false;
                stringChar = null;
                continue;
            }

            if (char.toLowerCase() === "d" && isInComment === false && isInString === false) {
                let delimiterResult = this.getDelimiter(index, query);
                if (delimiterResult != null) {
                    // it's delimiter
                    let delimiterSymbol: string = delimiterResult[0];
                    let delimiterEndIndex: number = delimiterResult[1];
                    query = query.substring(delimiterEndIndex);
                    resultQueries = this.getStatements(query, delimiterSymbol);
                    break;
                }
            }

            if (char === "$" && isInComment === false && isInString === false) {
                let queryUntilTagSymbol = query.substring(index);
                if (isInTag === false) {
                    let tagSymbolResult = this.getTag(queryUntilTagSymbol);
                    if (tagSymbolResult != null) {
                        isInTag = true;
                        tagChar = tagSymbolResult[0];
                    }
                } else {
                    let tagSymbolResult = this.getTag(queryUntilTagSymbol);
                    if (tagSymbolResult != null) {
                        let tagSymbol = tagSymbolResult[0];
                        let tagSymbolIndex = tagSymbolResult[1];
                        if (tagSymbol === tagChar) {
                            isInTag = false;
                        }
                    }
                }
            }

            if (delimiter.length > 1 && charArray[index + delimiter.length - 1] !== undefined) {
                for (let i = index + 1; i < index + delimiter.length; i++) {
                    char += charArray[i];
                }
            }

            if((char === " " || char === "," ) && isInComment === false && isInString === false){
                let tokenEndIndex = index;
                let tokenStartIndex = tokenEndIndex - token.length;
                let tokenObject = this.createToken(token, TokenType.UNKNOWN, tokenStartIndex, tokenEndIndex);
                tokens.push(tokenObject);
                token = "";
            }
            else if (isInComment === false && isInString === false) {
                token = token + char;
            }


            // it's a query, continue until you get delimiter hit
            if (char.toLowerCase() === delimiter.toLowerCase() && isInString === false && isInComment === false && isInTag === false) {
                if (this.isGoDelimiter(query, index) === false) {
                    continue;
                }
                let tokenEndIndex = index;
                let tokenStartIndex = tokenEndIndex - token.length;
                let tokenObject = this.createToken(token, TokenType.UNKNOWN, tokenStartIndex, tokenEndIndex);
                tokens.push(tokenObject);

                let splittingIndex = index;
                resultQueries = this.getQueryParts(query, splittingIndex, delimiter, tokens);
                break;

            }

        }
        if (resultQueries.length === 0) {
            if (query != null) {
                query = query.trim();
            }
            let finalQuery = this.createQuery(query, 0, query.length, tokens);
            resultQueries.push(finalQuery, null);
        }

        return resultQueries;
    }

    private static getQueryParts(query: string, splittingIndex: number, delimiter: string, tokens: Array<IToken>): Array<any> {
        let statement: string = query.substring(0, splittingIndex);
        let restOfQueryStartingIndex = splittingIndex + delimiter.length;
        let restOfQuery: string = query.substring(restOfQueryStartingIndex);
        let result: Array<any> = [];
        if (statement != null) {
            statement = statement.trim();
        }
        let currentStatementGlobalEndingIndex = this.lastQueryEndingGlobalIndex + statement.length;
        let queryManager = this.createQuery(statement, this.lastQueryEndingGlobalIndex, currentStatementGlobalEndingIndex, tokens);
        this.lastQueryEndingGlobalIndex = restOfQueryStartingIndex;
        result.push(queryManager);
        result.push(restOfQuery);
        return result;
    }

    private static getDelimiter(index: number, query: string): Array<any> {
        if (this.databaseType === DatabaseType.MYSQL) {
            let delimiterKeyword = "delimiter ";
            let delimiterLength = delimiterKeyword.length;
            let parsedQueryAfterIndexOriginal = query.substring(index);
            let indexOfDelimiterKeyword = parsedQueryAfterIndexOriginal
                .toLowerCase()
                .indexOf(delimiterKeyword);
            if (indexOfDelimiterKeyword === 0) {
                let parsedQueryAfterIndex = query.substring(index);
                let indexOfNewLine = parsedQueryAfterIndex.indexOf("\n");
                if (indexOfNewLine === -1) {
                    indexOfNewLine = query.length;
                }
                parsedQueryAfterIndex = parsedQueryAfterIndex.substring(0, indexOfNewLine);
                parsedQueryAfterIndex = parsedQueryAfterIndex.substring(delimiterLength);
                let delimiterSymbol = parsedQueryAfterIndex.trim();
                delimiterSymbol = this.clearTextUntilComment(delimiterSymbol);
                if (delimiterSymbol != null) {
                    delimiterSymbol = delimiterSymbol.trim();
                    let delimiterSymbolEndIndex = parsedQueryAfterIndexOriginal.indexOf(delimiterSymbol) + index + delimiterSymbol.length;
                    let result: Array<any> = [];
                    result.push(delimiterSymbol);
                    result.push(delimiterSymbolEndIndex);
                    return result;
                } else {
                    return null;
                }

            } else {
                return null;
            }
        }
    }

    private static getTag(query: string): Array<any> {
        if (this.databaseType === DatabaseType.POSTGRESQL) {
            let matchTag = query.match(/^(\$[a-zA-Z]*\$)/i);
            if (matchTag != null && matchTag.length > 1) {
                let result: Array<any> = [];
                let tagSymbol = matchTag[1].trim();
                let indexOfCmd = query.indexOf(tagSymbol);
                result.push(tagSymbol);
                result.push(indexOfCmd);
                return result;
            } else {
                return null;
            }
        }

    }

    private static isGoDelimiter(query: string, index: number): boolean {
        if (this.databaseType === DatabaseType.MSSQL) {
            let match = /(?:\bgo\b\s*)/i.exec(query);
            if (match != null && match.index === index) {
                return true;
            } else {
                return false;
            }
        }
    }

    private static clearTextUntilComment(text: string): string {
        let previousChar: string = null;
        let nextChar: string = null;
        let charArray: Array<string> = Array.from(text);
        let clearedText: string = null;
        for (let index = 0; index < charArray.length; index++) {

            let char = charArray[index];
            if (index > 0) {
                previousChar = charArray[index - 1];
            }

            if (index < charArray.length) {
                nextChar = charArray[index + 1];
            }

            if (((char === "#" && nextChar === " ") || (char === "-" && nextChar === "-") || (char === "/" && nextChar === "*"))) {
                break;
            } else {
                if (clearedText == null) {
                    clearedText = "";
                }
                clearedText += char;
            }

        }

        return clearedText;
    }

    private static createQuery(query: string, startIndex: number, endIndex: number, tokens: Array<IToken>): IQuery {
        if (this.databaseType === DatabaseType.MYSQL) {
            return QueryManager.createQuery(MySQLQuery, query, startIndex, endIndex, tokens);
        }

        return null;
    }

    private static createEmptyToken(): IToken {
        if (this.databaseType === DatabaseType.MYSQL) {
            return TokenManager.createEmptyToken(MySQLToken);
        }

        return null;
    }

    private static createToken(token: string, type: TokenType, startIndex: number, endIndex: number): IToken {
        if (this.databaseType === DatabaseType.MYSQL) {
            return TokenManager.createToken(MySQLToken, token, type, startIndex, endIndex);
        }

        return null;
    }

}
