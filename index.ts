import {TSParser} from './lib/TSParser';

// Examples

export class ParserExample {
    static runExample(){
        var mysqlQueriesBasic : string = 'SELECT * FROM users;SELECT * FROM user_details;'
        var mysqlStatements = TSParser.parse(mysqlQueriesBasic, 'mysql', ';');
        mysqlStatements.forEach(statement => {
            console.log(statement + '\n-----------');
        });

        var postgreSQLQueriesBasic : string = 'SELECT * FROM users;SELECT * FROM user_details;'
        var pgStatements = TSParser.parse(postgreSQLQueriesBasic, 'pg', ';');
        pgStatements.forEach(statement => {
            console.log(statement + '\n-----------');
        });

        var SQLServerQueriesBasic : string = 'SELECT * FROM users GO SELECT * FROM user_details;'
        var mssqlStatements = TSParser.parse(SQLServerQueriesBasic, 'mssql', 'GO');
        mssqlStatements.forEach(statement => {
            console.log(statement + '\n-----------');
        });
    }
}

ParserExample.runExample();