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
        var statements = TSParser.parse(mysqlQueryWithComments, 'mysql', ';');
        statements.forEach(statement => {
            console.log(statement + '\nbitti');
        });
    }
}

ParserExample.deneme();