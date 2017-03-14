import { TSParser } from "../src/index";
import * as Mocha from "mocha";
import * as chai from "chai";

describe("MySQL 2 Basic Queries", function () {
    it("should return an array with 2 items", function () {
        let query = "SELECT * FROM users;SELECT * FROM user_details;";
        let expectedResult: Array<string> = [];
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 2 members.");
    });
});

describe("MySQL 2 Basic Queries - Syntax Error", function () {
    it("should not return an array with 2 items", function () {
        let query = "SELECT * FROM users SELECT * FROM user_details;";
        let expectedResult: Array<string> = [];
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).not.have.members(expectedResult, "Should be an array of string with 2 members.");
    });
});

describe("MySQL Procedure ends with DELIMITER", function () {
    it("should return MySQL procedure", function () {
        let query = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER ;`;
        let expectedResult = `CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`;
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).include(expectedResult, "Returning result must include query itself.");
    });
});

describe("MySQL Procedure with comment", function () {
    it("should return MySQL procedure", function () {
        let query = `-- DROP PROCEDURE IF EXISTS \`country_hos\`;
DELIMITER $$
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END
$$`;
       let expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 1 stored procedure and comment.");
    });
});

describe("MySQL Procedures, queries and comments", function () {
    it("should return MySQL procedure", function () {
        let query = `-- DROP PROCEDURE IF EXISTS \`country_hos\`;
DELIMITER $$
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END
$$
DELIMITER ;
SELECT * FROM users;
SELECT * FROM user_details; -- COMMENT AREA
-- ;
-- DELIMITER $$
DELIMITER //
CREATE PROCEDURE country_hos_second
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END
//`;
       let expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        expectedResult.push(`CREATE PROCEDURE country_hos_second
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 1 stored procedure and comment.");
    });
});

describe("MySQL Procedures, queries and comments (2)", function () {
    it("should return MySQL procedure", function () {
        let query = `-- DROP PROCEDURE IF EXISTS \`country_hos\`;
DELIMITER $$ -- comment
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END
$$
DELIMITER ;
SELECT * FROM users;
SELECT * FROM user_details; -- COMMENT AREA
-- ;
-- DELIMITER $$
DELIMITER //
CREATE PROCEDURE country_hos_second
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END
//`;
       let expectedResult: Array<string> = [];
        expectedResult.push(`-- comment
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        expectedResult.push(`CREATE PROCEDURE country_hos_second
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 1 stored procedure and comment.");
    });
});

describe("MySQL Procedures", function () {
    it("should return 2 MySQL procedures", function () {
        let query = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER //
CREATE PROCEDURE city_hos
(IN con CHAR(20))
BEGIN
  SELECT Name FROM City
  WHERE Continent = con;
END //`;
        let expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);

        expectedResult.push(`CREATE PROCEDURE city_hos
(IN con CHAR(20))
BEGIN
  SELECT Name FROM City
  WHERE Continent = con;
END`);
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 2 stored procedures.");
    });
});

describe("MySQL Procedure and SQL Queries", function () {
    it("should return MySQL procedure and other statements", function () {
        let query = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER ;
SELECT * FROM users;
SELECT * FROM user_details;`;
        let expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 1 stored procedure and 2 queries.");
    });
});

describe("MySQL Procedure and SQL Queries - Syntax Error", function () {
    it("should return MySQL procedure and other statements", function () {
        let query = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER ;
SELECT * FROM users
SELECT * FROM user_details;`;
        let expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).not.have.members(expectedResult, "Should be an array of string with 1 stored procedure and 2 queries.");
    });
});

describe("MySQL Queries with Comments and String", function () {
    it("should return an array with 2 items", function () {
        let query = `SELECT ';', '--', ';;;;' FROM test; -- comment
-- comment 2
// comment other
# comment
SELECT name,surname FROM user_details;`;
        let expectedResult: Array<string> = [];
        expectedResult.push("SELECT ';', '--', ';;;;' FROM test");
        expectedResult.push(`-- comment
-- comment 2
// comment other
# comment
SELECT name,surname FROM user_details`);
        let result: Array<string> = TSParser.parse(query, "mysql", ";");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 2 members.");
    });
});
