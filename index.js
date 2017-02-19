"use strict";
const TSParser_1 = require('./lib/TSParser');
// Examples
class ParserExample {
    static deneme() {
        var mysqlQueriesBasic = 'SELECT * FROM users;SELECT * FROM user_details;';
        var mysqlProc = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER ;
SELECT * FROM users;
SELECT * FROM userdetails;`;
        var mysqlQueryWithComments = `SELECT ';', '--', ';;;;' FROM test; -- comment
-- comment 2
SELECT name,surname FROM user_details;`;
        var statements = TSParser_1.TSParser.parse(mysqlQueryWithComments, 'mysql', ';');
        statements.forEach(statement => {
            console.log(statement + '\nbitti');
        });
    }
}
exports.ParserExample = ParserExample;
ParserExample.deneme();
//# sourceMappingURL=index.js.map