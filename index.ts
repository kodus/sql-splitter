import {TSParser} from './lib/TSParser';

// Examples

export class ParserExample {
    static deneme(){
        var mysqlQueriesBasic : string = 'SELECT * FROM users;SELECT * FROM user_details;'
        var mysqlProc : string = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER ;
SELECT * FROM users;
SELECT * FROM userdetails;`
        var mysqlQueryWithComments : string = `SELECT ';', '--', ';;;;' FROM test; -- comment
-- comment 2
SELECT name,surname FROM user_details;`

        var mssqlQuery : string = 'SELECT * FROM users GO SELECT * FROM user_details';
        var mssqlProcs : string = `CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City;
GO
CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City`;
        var statements = TSParser.parse(mssqlProcs, 'mssql', 'GO');
        statements.forEach(statement => {
            console.log(statement + '\nbitti');
        });
    }
}

ParserExample.deneme();