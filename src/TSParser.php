<?php

class TSParser
{
    /**
     * @param string $query
     * @param string $dbType
     * @param string $delimiter
     * 
     * @returns string[]
     */
    public static function parse(string $query, string $dbType, string $delimiter) {
        $queries = [];
        $flag = true;
        $restOfQuery = null;
        while ($flag) {
            if ($restOfQuery == null) {
                $restOfQuery = $query;
            }
            $statementAndRest = self::getStatements($restOfQuery, $dbType, $delimiter);
            $statement = $statementAndRest[0];
            if ($statement != null && $statement.trim() != "") {
                $queries.push($statement);
            }
            $restOfQuery = $statementAndRest[1];
            if ($restOfQuery == null || $restOfQuery.trim() == "") {
                break;
            }
        }
        return $queries;
    }

    /**
     * @param string $query
     * @param string $dbType
     * @param string $delimiter
     *
     * @return string[]
     */
    private static function getStatements(string $query, string $dbType, string $delimiter) {
        $charArray = Array.from($query);
        $previousChar = null;
        $nextChar = null;
        $isInComment = false;
        $commentChar = null;
        $isInString = false;
        $stringChar = null;
        $isInTag = false;
        $tagChar = null;
        $resultQueries = [];
        for ($index = 0; $index < $charArray.length; $index++) {
            $char = $charArray[$index];
            if ($index > 0) {
                $previousChar = $charArray[$index - 1];
            }
            if ($index < $charArray.length) {
                $nextChar = $charArray[$index + 1];
            }
            // it's in string, go to next char
            if ($previousChar != '\\' && ($char == '\'' || $char == '"') && $isInString == false && $isInComment == false) {
                $isInString = true;
                $stringChar = $char;
                continue;
            }
            // it's comment, go to next char
            if ((($char == '#' && $nextChar == ' ') || ($char == '-' && $nextChar == '-') || ($char == '/' && $nextChar == '*')) && $isInString == false) {
                $isInComment = true;
                $commentChar = $char;
                continue;
            }
            // it's end of comment, go to next
            if ($isInComment == true && ((($commentChar == '#' || $commentChar == '-') && $char == '\n') || ($commentChar == '/' && ($char == '*' && $nextChar == '/')))) {
                $isInComment = false;
                $commentChar = null;
                continue;
            }
            // string closed, go to next char
            if ($previousChar != '\\' && $char == $stringChar && $isInString == true) {
                $isInString = false;
                $stringChar = null;
                continue;
            }
            if ($char.toLowerCase() == 'd' && $isInComment == false && $isInString == false) {
                $delimiterResult = self::getDelimiter($index, $query, $dbType);
                if ($delimiterResult != null) {
                    // it's delimiter
                    list($delimiterSymbol, $delimiterEndIndex) = $delimiterResult;
                    $query = $query.substr($delimiterEndIndex);
                    $resultQueries = self::getStatements($query, $dbType, $delimiterSymbol);
                    break;
                }
            }
            if ($char == "$" && $isInComment == false && $isInString == false) {
                $queryUntilTagSymbol = $query.substr($index);
                if ($isInTag == false) {
                    $tagSymbolResult = self::getTag($queryUntilTagSymbol, $dbType);
                    if ($tagSymbolResult != null) {
                        $isInTag = true;
                        $tagChar = $tagSymbolResult[0];
                    }
                }
                else {
                    $tagSymbolResult = self::getTag($queryUntilTagSymbol, $dbType);
                    if ($tagSymbolResult != null) {
                        $tagSymbol = $tagSymbolResult[0];
                        $tagSymbolIndex = $tagSymbolResult[1];
                        if ($tagSymbol == $tagChar) {
                            $isInTag = false;
                        }
                    }
                }
            }
            if ($delimiter.length > 1 && $charArray[$index + $delimiter.length - 1] != undefined) {
                for ($i = $index + 1; $i < $index + $delimiter.length; $i++) {
                    $char += $charArray[$i];
                }
            }
            // it's a query, continue until you get delimiter hit
            if ($char.toLowerCase() == $delimiter.toLowerCase() && $isInString == false && $isInComment == false && $isInTag == false) {
                if (self::isGoDelimiter($dbType, $query, $index) == false) {
                    continue;
                }
                $splittingIndex = $index;
                // if (delimiter == ";") {     $splittingIndex = index + 1 }
                $resultQueries = self::getQueryParts($query, $splittingIndex, $delimiter);
                break;
            }
        }
        if ($resultQueries.length == 0) {
            if ($query != null) {
                $query = $query.trim();
            }
            $resultQueries.push($query, null);
        }
        return $resultQueries;
    }

    /**
     * @param string $query
     * @param int $splittingIndex
     * @param string $delimiter
     *
     * @return string[]
     */
    private static function getQueryParts(string $query, int $splittingIndex, string $delimiter) {
        $statement = $query.substr(0, $splittingIndex);
        $restOfQuery = $query.substr($splittingIndex + $delimiter.length);
        $result = [];
        if ($statement != null) {
            $statement = $statement.trim();
        }
        $result.push($statement);
        $result.push($restOfQuery);
        return $result;
    }

    /**
     * @param int $index
     * @param string $query
     * @param string $dbType
     *
     * @return array|null returns a tuple [string $delimiter, int $endIndex] (or NULL if not matched)
     */
    private static function getDelimiter(int $index, string $query, string $dbType) {
        if ($dbType == 'mysql') {
            $delimiterKeyword = 'delimiter ';
            $delimiterLength = $delimiterKeyword.length;
            $parsedQueryAfterIndexOriginal = $query.substr($index);
            $indexOfDelimiterKeyword = $parsedQueryAfterIndexOriginal
                .toLowerCase()
                .indexOf($delimiterKeyword);
            if ($indexOfDelimiterKeyword == 0) {
                $parsedQueryAfterIndex = $query.substr($index);
                $indexOfNewLine = $parsedQueryAfterIndex.indexOf('\n');
                if ($indexOfNewLine == -1) {
                    $indexOfNewLine = $query.length;
                }
                $parsedQueryAfterIndex = $parsedQueryAfterIndex.substr(0, $indexOfNewLine);
                $parsedQueryAfterIndex = $parsedQueryAfterIndex.substr($delimiterLength);
                $delimiterSymbol = $parsedQueryAfterIndex.trim();
                $delimiterSymbol = self::clearTextUntilComment($delimiterSymbol, $dbType);
                if ($delimiterSymbol != null) {
                    $delimiterSymbol = $delimiterSymbol.trim();
                    $delimiterSymbolEndIndex = $parsedQueryAfterIndexOriginal.indexOf($delimiterSymbol) + $index + $delimiterSymbol.length;
                    $result = [];
                    $result.push($delimiterSymbol);
                    $result.push($delimiterSymbolEndIndex);
                    return $result;
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        }
    }

    /**
     * @param string $query
     * @param string $dbType
     *
     * @return array|null returns a tuple [$tagSymbol, $indexOfCmd] (or NULL if not matched)
     */
    private static function getTag(string $query, string $dbType) {
        if ($dbType == 'pg') {
            $matchTag = $query.match(/^(\$[a-zA-Z]*\$)/i);
            if ($matchTag != null && $matchTag.length > 1) {
                $result = [];
                $tagSymbol = $matchTag[1].trim();
                $indexOfCmd = $query.indexOf($tagSymbol);
                $result.push($tagSymbol);
                $result.push($indexOfCmd);
                return $result;
            }
            else {
                return null;
            }
        }
    }

    /**
     * @param string $dbType
     * @param string $query
     * @param int $index
     *
     * @return bool
     */
    private static function isGoDelimiter(string $dbType, string $query, int $index) {
        if ($dbType == 'mssql') {
            $match = /(?:\bgo\b\s*)/i.exec($query);
            if ($match != null && $match.index == $index) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    /**
     * @param string $text
     * @param string $dbType
     *
     * @return string
     */
    private static function clearTextUntilComment(string $text, string $dbType) {
        $previousChar = null;
        $nextChar = null;
        $charArray = Array.from($text);
        $clearedText = null;
        for ($index = 0; $index < $charArray.length; $index++) {
            $char = $charArray[$index];
            if ($index > 0) {
                $previousChar = $charArray[$index - 1];
            }
            if ($index < $charArray.length) {
                $nextChar = $charArray[$index + 1];
            }
            if ((($char == '#' && $nextChar == ' ') || ($char == '-' && $nextChar == '-') || ($char == '/' && $nextChar == '*'))) {
                break;
            }
            else {
                if ($clearedText == null) {
                    $clearedText = '';
                }
                $clearedText += $char;
            }
        }
        return $clearedText;
        // MUST IMPLEMENTED if(dbType == 'mysql'){ } else if(dbType == 'pg'){ } else
        // if(dbType == 'mssql'){ }
    }
}
