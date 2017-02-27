import {TSParser} from './src/index'


// var query: string = `-- DROP PROCEDURE IF EXISTS \`country_hos\` DELIMITER !!;
//       DELIMITER      $$   -- comment
// CREATE PROCEDURE country_hos
// (IN con CHAR(20))
// BEGIN
//   SELECT Name, HeadOfState FROM Country
//   WHERE Continent = con;
// END
// $$
// DELIMITER ;
// SELECT * FROM users;
// SELECT * FROM user_details; -- COMMENT AREA
// -- ;
// -- DELIMITER $$
// DELIMITER //
// CREATE PROCEDURE country_hos_second
// (IN con CHAR(20))
// BEGIN
//   SELECT Name, HeadOfState FROM Country
//   WHERE Continent = con;
// END
// //`;

var query = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER ;`;

// var query = `SELECT * FROM router LIMIT 200`;


var result: Array<string> = TSParser.parse(query, 'mysql', ';');

result.forEach(element => {
            console.log(element +'\n--next--');
        });