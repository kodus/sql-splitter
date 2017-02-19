"use strict";
class TSParser {
    static parse(query, dbType, delimiter) {
        var queries = [];
        var flag = true;
        while (flag) {
            if (restOfQuery == null) {
                restOfQuery = query;
            }
            var statementAndRest = this.getStatements(restOfQuery, dbType, delimiter);
            var statement = statementAndRest[0];
            if (statement != null && statement.trim() != "") {
                queries.push(statement);
            }
            var restOfQuery = statementAndRest[1];
            if (restOfQuery == null || restOfQuery.trim() == "") {
                break;
            }
        }
        return queries;
    }
    static getStatements(query, dbType, delimiter) {
        var charArray = Array.from(query);
        var previousChar = null;
        var nextChar = null;
        var isInComment = false;
        var commentChar = null;
        var isInString = false;
        var stringChar = null;
        var isInTag = false;
        var tagChar = null;
        var resultQueries = [];
        for (var index = 0; index < charArray.length; index++) {
            var char = charArray[index];
            if (index > 0) {
                previousChar = charArray[index - 1];
            }
            if (index < charArray.length) {
                nextChar = charArray[index + 1];
            }
            // it's in string, go to next char
            if (previousChar != '\\' && (char == '\'' || char == '"') && isInString == false && isInComment == false) {
                isInString = true;
                stringChar = char;
                continue;
            }
            // it's comment, go to next char
            if (((char == '#' && nextChar == ' ') || (char == '-' && nextChar == '-') || (char == '/' && nextChar == '*')) && isInString == false) {
                isInComment = true;
                commentChar = char;
                continue;
            }
            // it's end of comment, go to next
            if (isInComment == true && (((commentChar == '#' || commentChar == '-') && char == '\n') || (commentChar == '/' && (char == '*' && nextChar == '/')))) {
                isInComment = false;
                commentChar = null;
                continue;
            }
            // string closed, go to next char
            if (previousChar != '\\' && char == stringChar && isInString == true) {
                isInString = false;
                stringChar = null;
                continue;
            }
            if (char.toLowerCase() == 'd' && isInComment == false && isInString == false) {
                var delimiterResult = this.getDelimiter(query, dbType);
                if (delimiterResult != null) {
                    // it's delimiter
                    var delimiterSymbol = delimiterResult[0];
                    var delimiterEndIndex = delimiterResult[1];
                    query = query.substring(delimiterEndIndex);
                    resultQueries = this.getStatements(query, dbType, delimiterSymbol);
                    break;
                }
            }
            if (char == "$" && isInComment == false && isInString == false) {
                var queryUntilTagSymbol = query.substring(index);
                if (isInTag == false) {
                    var tagSymbolResult = this.getTag(queryUntilTagSymbol, dbType);
                    if (tagSymbolResult != null) {
                        isInTag = true;
                        tagChar = tagSymbolResult[0];
                    }
                }
                else {
                    var tagSymbolResult = this.getTag(queryUntilTagSymbol, dbType);
                    if (tagSymbolResult != null) {
                        var tagSymbol = tagSymbolResult[0];
                        var tagSymbolIndex = tagSymbolResult[1];
                        if (tagSymbol == tagChar) {
                            isInTag = false;
                        }
                    }
                }
            }
            if (delimiter.length > 1 && charArray[index + delimiter.length - 1] != undefined) {
                for (var i = index + 1; i < index + delimiter.length; i++) {
                    char += charArray[i];
                }
            }
            // it's a query, continue until you get delimiter hit
            if (char.toLowerCase() == delimiter.toLowerCase() && isInString == false && isInComment == false && isInTag == false) {
                if (this.isGoDelimiter(dbType, query, index) == false) {
                    continue;
                }
                var splittingIndex = index;
                // if (delimiter == ";") {
                //     splittingIndex = index + 1
                // }
                resultQueries = this.getQueryParts(query, splittingIndex, delimiter);
                break;
            }
        }
        if (resultQueries.length == 0) {
            resultQueries.push(query, null);
        }
        return resultQueries;
    }
    static getQueryParts(query, splittingIndex, delimiter) {
        var statement = query.substring(0, splittingIndex);
        var restOfQuery = query.substring(splittingIndex + delimiter.length);
        var result = [];
        if (statement != null) {
            statement = statement.trim();
        }
        result.push(statement);
        result.push(restOfQuery);
        return result;
    }
    static getDelimiter(query, dbType) {
        if (dbType == 'mysql') {
            var matchDelimiter = query.match(/^\s*(?:\bDELIMITER\b\s+(.+\s*)\s*)/i);
            if (matchDelimiter != null && matchDelimiter.length > 1) {
                var result = [];
                var delimiterSymbol = matchDelimiter[1].trim();
                var indexOfCmd = query.indexOf(delimiterSymbol);
                result.push(delimiterSymbol);
                result.push(indexOfCmd + delimiterSymbol.length);
                return result;
            }
            else {
                return null;
            }
        }
    }
    static getTag(query, dbType) {
        if (dbType == 'pg') {
            var matchTag = query.match(/^(\$[a-zA-Z]*\$)/i);
            if (matchTag != null && matchTag.length > 1) {
                var result = [];
                var tagSymbol = matchTag[1].trim();
                var indexOfCmd = query.indexOf(tagSymbol);
                result.push(tagSymbol);
                result.push(indexOfCmd);
                return result;
            }
            else {
                return null;
            }
        }
    }
    static isGoDelimiter(dbType, query, index) {
        if (dbType == 'mssql') {
            var match = /(?:\bgo\b\s*)/i.exec(query);
            if (match != null && match.index == index) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}
exports.TSParser = TSParser;
//# sourceMappingURL=TSParser.js.map