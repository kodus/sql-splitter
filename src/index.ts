export class TSParser {

    public static parse(query: string, dbType: string, delimiter: string): Array<string> {
        let queries: Array<string> = [];
        let flag = true;
        let restOfQuery = null;
        while (flag) {
            if (restOfQuery == null) {
                restOfQuery = query;
            }
            let statementAndRest = this.getStatements(restOfQuery, dbType, delimiter);

            let statement = statementAndRest[0];
            if (statement != null && statement.trim() !== "") {
                queries.push(statement);
            }

            restOfQuery = statementAndRest[1];
            if (restOfQuery == null || restOfQuery.trim() === "") {
                break;
            }
        }

        return queries;
    }

    private static getStatements(query: string, dbType: string, delimiter: string): Array<string> {
        let charArray: Array<string> = Array.from(query);
        let previousChar: string = null;
        let nextChar: string = null;
        let isInComment = false;
        let commentChar: string = null;
        let isInString = false;
        let stringChar: string = null;
        let isInTag = false;
        let tagChar: string = null;

        let resultQueries: Array<string> = [];
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
                let delimiterResult = this.getDelimiter(index, query, dbType);
                if (delimiterResult != null) {
                    // it's delimiter
                    let delimiterSymbol: string = delimiterResult[0];
                    let delimiterEndIndex: number = delimiterResult[1];
                    query = query.substring(delimiterEndIndex);
                    resultQueries = this.getStatements(query, dbType, delimiterSymbol);
                    break;
                }
            }

            if (char === "$" && isInComment === false && isInString === false) {
                let queryUntilTagSymbol = query.substring(index);
                if (isInTag === false) {
                    let tagSymbolResult = this.getTag(queryUntilTagSymbol, dbType);
                    if (tagSymbolResult != null) {
                        isInTag = true;
                        tagChar = tagSymbolResult[0];
                    }
                } else {
                    let tagSymbolResult = this.getTag(queryUntilTagSymbol, dbType);
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

            // it's a query, continue until you get delimiter hit
            if (char.toLowerCase() === delimiter.toLowerCase() && isInString === false && isInComment === false && isInTag === false) {
                if (this.isGoDelimiter(dbType, query, index) === false) {
                    continue;
                }
                let splittingIndex = index;
                // if (delimiter == ";") {     splittingIndex = index + 1 }
                resultQueries = this.getQueryParts(query, splittingIndex, delimiter);
                break;

            }

        }
        if (resultQueries.length === 0) {
            if (query != null) {
                query = query.trim();
            }
            resultQueries.push(query, null);
        }

        return resultQueries;
    }

    private static getQueryParts(query: string, splittingIndex: number, delimiter: string): Array<string> {
        let statement: string = query.substring(0, splittingIndex);
        let restOfQuery: string = query.substring(splittingIndex + delimiter.length);
        let result: Array<string> = [];
        if (statement != null) {
            statement = statement.trim();
        }
        result.push(statement);
        result.push(restOfQuery);
        return result;
    }

    private static getDelimiter(index: number, query: string, dbType: string): Array<any> {
        if (dbType === "mysql") {
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
                delimiterSymbol = this.clearTextUntilComment(delimiterSymbol, dbType);
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

    private static getTag(query: string, dbType: string): Array<any> {
        if (dbType === "pg") {
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

    private static isGoDelimiter(dbType: string, query: string, index: number): boolean {
        if (dbType === "mssql") {
            let match = /(?:\bgo\b\s*)/i.exec(query);
            if (match != null && match.index === index) {
                return true;
            } else {
                return false;
            }
        }
    }

    private static clearTextUntilComment(text: string, dbType: string): string {
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

}
