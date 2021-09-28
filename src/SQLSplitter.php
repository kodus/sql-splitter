<?php

namespace Kodus;

/**
 * This class is a pseudo-namespace for a set of functions that split an SQL file
 * into individual SQL statements.
 */
abstract class SQLSplitter
{
    const DB_MYSQL = "mysql";
    const DB_MSSQL = "sqlsrv";
    const DB_PGSQL = "pgsql";

    /**
     * @param string $sql       SQL file body
     * @param string $delimiter optional delimiter (defaults to ";")
     *
     * @return string[] list of SQL statements
     */
    public static function splitMySQL(string $sql, string $delimiter = ";")
    {
        return self::split(self::DB_MYSQL, $sql, $delimiter);
    }

    /**
     * @param string $sql       SQL file body
     * @param string $delimiter optional delimiter (defaults to "GO")
     *
     * @return string[] list of SQL statements
     */
    public static function splitMSSQL(string $sql, string $delimiter = "GO")
    {
        return self::split(self::DB_MSSQL, $sql, $delimiter);
    }

    /**
     * @param string $sql       SQL file body
     * @param string $delimiter optional delimiter (defaults to ";")
     *
     * @return string[] list of SQL statements
     */
    public static function splitPostgreSQL(string $sql, string $delimiter = ";")
    {
        return self::split(self::DB_PGSQL, $sql, $delimiter);
    }

    /**
     * @param string      $dbType    one of the DB_* constants
     * @param string      $sql       SQL file body
     * @param string|null $delimiter optional delimiter (or NULL to use the default of the given $dbType)
     *
     * @return string[] list of SQL statements
     */
    public static function split(string $dbType, string $sql, string $delimiter = null)
    {
        assert(in_array($dbType, [self::DB_MSSQL, self::DB_MYSQL, self::DB_PGSQL]));

        if ($delimiter === null) {
            $delimiter = $dbType === self::DB_MSSQL ? "GO" : ";";
        }

        $queries = [];
        $flag = true;
        $restOfQuery = null;
        while ($flag) {
            if ($restOfQuery == null) {
                $restOfQuery = $sql;
            }
            $statementAndRest = self::getStatements($restOfQuery, $dbType, $delimiter);
            $statement = $statementAndRest[0];
            if ($statement != null && trim($statement) != "") {
                $queries[] = $statement;
            }
            $restOfQuery = $statementAndRest[1];
            if ($restOfQuery == null || trim($restOfQuery) == "") {
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
    private static function getStatements(string $query, string $dbType, string $delimiter)
    {
        $charArray = self::toArray($query);
        $previousChar = null;
        $nextChar = null;
        $isInComment = false;
        $commentChar = null;
        $isInString = false;
        $stringChar = null;
        $isInTag = false;
        $tagChar = null;

        for ($index = 0; $index < count($charArray); $index++) {
            $char = $charArray[$index];
            $previousChar = $index > 0 ? $charArray[$index - 1] : null;
            $nextChar = $index < count($charArray) - 1 ? $charArray[$index + 1] : null;
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
            if ($isInComment == true && ((($commentChar == '#' || $commentChar == '-') && $char == "\n") || ($commentChar == '/' && ($char == '*' && $nextChar == '/')))) {
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
            if (mb_strtolower($char) == 'd' && $isInComment == false && $isInString == false) {
                $delimiterResult = self::getDelimiter($index, $query, $dbType);
                if ($delimiterResult != null) {
                    // it's delimiter
                    list($delimiterSymbol, $delimiterEndIndex) = $delimiterResult;
                    $query = mb_substr($query, $delimiterEndIndex);
                    return self::getStatements($query, $dbType, $delimiterSymbol);
                }
            }
            if ($char == "$" && $isInComment == false && $isInString == false) {
                $queryUntilTagSymbol = mb_substr($query, $index);
                if ($isInTag == false) {
                    $tagSymbolResult = self::getTag($queryUntilTagSymbol, $dbType);
                    if ($tagSymbolResult != null) {
                        $isInTag = true;
                        $tagChar = $tagSymbolResult[0];
                    }
                } else {
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
            if (mb_strlen($delimiter) > 1 && array_key_exists($index + mb_strlen($delimiter) - 1, $charArray)) {
                for ($i = $index + 1; $i < $index + mb_strlen($delimiter); $i++) {
                    $char .= $charArray[$i];
                }
            }
            // it's a query, continue until you get delimiter hit
            if (mb_strtolower($char) == mb_strtolower($delimiter) && $isInString == false && $isInComment == false && $isInTag == false) {
                if (! self::isGoDelimiter($dbType, $query, $index)) {
                    continue;
                }
                $splittingIndex = $index;
                // if (delimiter == ";") {     $splittingIndex = index + 1 }
                return self::getQueryParts($query, $splittingIndex, $delimiter);
            }
        }

        if ($query != null) {
            $query = trim($query);
        }

        return [$query, null];
    }

    /**
     * @param string $query
     * @param int    $splittingIndex
     * @param string $delimiter
     *
     * @return string[]
     */
    private static function getQueryParts(string $query, int $splittingIndex, string $delimiter)
    {
        $statement = mb_substr($query, 0, $splittingIndex);
        $restOfQuery = mb_substr($query, $splittingIndex + mb_strlen($delimiter));
        if ($statement != null) {
            $statement = trim($statement);
        }
        return [$statement, $restOfQuery];
    }

    /**
     * @param int    $index
     * @param string $query
     * @param string $dbType
     *
     * @return array|null returns a tuple [string $delimiter, int $endIndex] (or NULL if not matched)
     */
    private static function getDelimiter(int $index, string $query, string $dbType)
    {
        if ($dbType == self::DB_MYSQL) {
            $delimiterKeyword = 'delimiter ';
            $delimiterLength = mb_strlen($delimiterKeyword);
            $parsedQueryAfterIndexOriginal = mb_substr($query, $index);
            $indexOfDelimiterKeyword = mb_strpos(mb_strtolower($parsedQueryAfterIndexOriginal), $delimiterKeyword);
            if ($indexOfDelimiterKeyword === 0) {
                $parsedQueryAfterIndex = mb_substr($query, $index);
                $indexOfNewLine = mb_strpos($parsedQueryAfterIndex, "\n");
                if ($indexOfNewLine == -1) {
                    $indexOfNewLine = mb_strlen($query);
                }
                $parsedQueryAfterIndex = mb_substr($parsedQueryAfterIndex, 0, $indexOfNewLine);
                $parsedQueryAfterIndex = mb_substr($parsedQueryAfterIndex, $delimiterLength);
                $delimiterSymbol = trim($parsedQueryAfterIndex);
                $delimiterSymbol = self::clearTextUntilComment($delimiterSymbol, $dbType);
                if ($delimiterSymbol != null) {
                    $delimiterSymbol = trim($delimiterSymbol);
                    $delimiterSymbolEndIndex = mb_strpos($parsedQueryAfterIndexOriginal,
                            $delimiterSymbol) + $index + mb_strlen($delimiterSymbol);

                    return [$delimiterSymbol, $delimiterSymbolEndIndex];
                }
            }
        }

        return null;
    }

    /**
     * @param string $query
     * @param string $dbType
     *
     * @return array|null returns a tuple [$tagSymbol, $indexOfCmd] (or NULL if not matched)
     */
    private static function getTag(string $query, string $dbType)
    {
        if ($dbType == self::DB_PGSQL) {
            if (preg_match('/^(\$[a-zA-Z]*\$)/i', $query, $matches) === 1) {
                $tagSymbol = trim($matches[0]);
                $indexOfCmd = mb_strpos($query, $tagSymbol);

                return [$tagSymbol, $indexOfCmd];
            }
        }

        return null;
    }

    /**
     * @param string $dbType
     * @param string $query
     * @param int    $index
     *
     * @return bool
     */
    private static function isGoDelimiter(string $dbType, string $query, int $index)
    {
        if ($dbType == self::DB_MSSQL) {
            if (preg_match('/(?:\bgo\b\s*)/i', $query, $matches, PREG_OFFSET_CAPTURE) === 1) {
                return $matches[0][1] === $index;
            }
        }

        return true;
    }

    /**
     * @param string $text
     * @param string $dbType
     *
     * @return string
     */
    private static function clearTextUntilComment(string $text, string $dbType)
    {
        $previousChar = null;
        $nextChar = null;
        $charArray = self::toArray($text);
        $clearedText = null;
        for ($index = 0; $index < count($charArray); $index++) {
            $char = $charArray[$index];

            $nextChar = $index < count($charArray) - 1
                ? $charArray[$index + 1]
                : null;

            if ((($char == '#' && $nextChar == ' ') || ($char == '-' && $nextChar == '-') || ($char == '/' && $nextChar == '*'))) {
                break;
            } else {
                if ($clearedText == null) {
                    $clearedText = '';
                }
                $clearedText .= $char;
            }
        }

        return $clearedText;
        // MUST IMPLEMENTED if(dbType == 'mysql'){ } else if(dbType == 'pg'){ } else
        // if(dbType == 'mssql'){ }
    }

    /**
     * @param string $query
     *
     * @return string[]
     */
    private static function toArray(string $query): array
    {
        return preg_split('//u', $query, -1, PREG_SPLIT_NO_EMPTY);
    }
}
