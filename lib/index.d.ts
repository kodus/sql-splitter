export declare class TSParser {
    static parse(query: string, dbType: string, delimiter: string): Array<string>;
    private static getStatements(query, dbType, delimiter);
    private static getQueryParts(query, splittingIndex, delimiter);
    private static getDelimiter(query, dbType);
    private static getTag(query, dbType);
    private static isGoDelimiter(dbType, query, index);
}
