import {TSParser} from './src/index'
import { IQuery } from "./src/core/interfaces/IQuery";
import { DatabaseType } from "./src/core/enums/DatabaseType";
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

// var query = `DELIMITER //
// CREATE PROCEDURE country_hos
// (IN con CHAR(20))
// BEGIN
//   SELECT Name, HeadOfState FROM Country
//   WHERE Continent = con;
// END //
// DELIMITER ;`;

var query = `SELECT * FROM router LIMIT 200; SELECT * FROM users;`;


let result: Array<IQuery> = TSParser.parse(query, DatabaseType.MYSQL, ';');

let q1 = query.substring(result[0].StartIndex, result[0].EndIndex);
let q2 = query.substring(result[1].StartIndex, result[1].EndIndex);

result.forEach(element => {
            console.log(element);
        });