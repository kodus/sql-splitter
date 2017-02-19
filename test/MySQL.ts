import { TSParser } from '../src/index';
import * as Mocha from 'mocha'
import * as chai from 'chai';

describe('MySQL 2 Basic Queries', function () {
    it('should return an array with 2 items', function () {
        var query: string = 'SELECT * FROM users;SELECT * FROM user_details;'
        var expectedResult: Array<string> = [];
        expectedResult.push('SELECT * FROM users');
        expectedResult.push('SELECT * FROM user_details');
        var result: Array<string> = TSParser.parse(query, 'mysql', ';');
        chai.expect(result).have.members(expectedResult, 'Should be an array of string with 2 members.');
    });
});

describe('MySQL 2 Basic Queries - Syntax Error', function () {
    it('should not return an array with 2 items', function () {
        var query: string = 'SELECT * FROM users SELECT * FROM user_details;'
        var expectedResult: Array<string> = [];
        expectedResult.push('SELECT * FROM users');
        expectedResult.push('SELECT * FROM user_details');
        var result: Array<string> = TSParser.parse(query, 'mysql', ';');
        chai.expect(result).not.have.members(expectedResult, 'Should be an array of string with 2 members.');
    });
});

describe('MySQL Procedure', function () {
    it('should return MySQL procedure', function () {
        var query: string = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER ;`;
        var expectedResult: string = `CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`;
        var result: Array<string> = TSParser.parse(query, 'mysql', ';');
        chai.expect(result).include(expectedResult, 'Returning result must include query itself.');
    });
});

describe('MySQL Procedures', function () {
    it('should return 2 MySQL procedures', function () {
        var query: string = `DELIMITER //
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
        var expectedResult: Array<string> = [];
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
        var result: Array<string> = TSParser.parse(query, 'mysql', ';');
        chai.expect(result).have.members(expectedResult, 'Should be an array of string with 2 stored procedures.');
    });
});

describe('MySQL Procedure and SQL Queries', function () {
    it('should return MySQL procedure and other statements', function () {
        var query: string = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER ;
SELECT * FROM users;
SELECT * FROM user_details;`;
        var expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        var result: Array<string> = TSParser.parse(query, 'mysql', ';');
        chai.expect(result).have.members(expectedResult, 'Should be an array of string with 1 stored procedure and 2 queries.');
    });
});

describe('MySQL Procedure and SQL Queries - Syntax Error', function () {
    it('should return MySQL procedure and other statements', function () {
        var query: string = `DELIMITER //
CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END //
DELIMITER ;
SELECT * FROM users
SELECT * FROM user_details;`;
        var expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE country_hos
(IN con CHAR(20))
BEGIN
  SELECT Name, HeadOfState FROM Country
  WHERE Continent = con;
END`);
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        var result: Array<string> = TSParser.parse(query, 'mysql', ';');
        chai.expect(result).not.have.members(expectedResult, 'Should be an array of string with 1 stored procedure and 2 queries.');
    });
});

describe('MySQL Queries with Comments and String', function () {
    it('should return an array with 2 items', function () {
        var query: string = `SELECT ';', '--', ';;;;' FROM test; -- comment
-- comment 2
// comment other
# comment
SELECT name,surname FROM user_details;`;
        var expectedResult: Array<string> = [];
        expectedResult.push("SELECT ';', '--', ';;;;' FROM test");
        expectedResult.push(`-- comment
-- comment 2
// comment other
# comment
SELECT name,surname FROM user_details`);
        var result: Array<string> = TSParser.parse(query, 'mysql', ';');
        chai.expect(result).have.members(expectedResult, 'Should be an array of string with 2 members.');
    });
});