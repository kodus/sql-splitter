"use strict";
const TSParser_1 = require('../lib/TSParser');
const chai = require('chai');
describe('PostgreSQL 2 Basic Queries', function () {
    it('should return an array with 2 items', function () {
        var query = 'SELECT * FROM users;SELECT * FROM user_details;';
        var expectedResult = [];
        expectedResult.push('SELECT * FROM users');
        expectedResult.push('SELECT * FROM user_details');
        var result = TSParser_1.TSParser.parse(query, 'pg', ';');
        chai.expect(result).have.members(expectedResult, 'Should be an array of string with 2 members.');
    });
});
describe('PostgreSQL 2 Basic Queries - Syntax Error', function () {
    it('should not return an array with 2 items', function () {
        var query = 'SELECT * FROM users SELECT * FROM user_details;';
        var expectedResult = [];
        expectedResult.push('SELECT * FROM users');
        expectedResult.push('SELECT * FROM user_details');
        var result = TSParser_1.TSParser.parse(query, 'pg', ';');
        chai.expect(result).not.have.members(expectedResult, 'Should be an array of string with 2 members.');
    });
});
describe('PostgreSQL Procedure', function () {
    it('should return PostgreSQL procedure', function () {
        var query = `CREATE FUNCTION add(integer, integer) RETURNS integer
AS 'select $1 + $2;'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT;`;
        var expectedResult = `CREATE FUNCTION add(integer, integer) RETURNS integer
AS 'select $1 + $2;'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT`;
        var result = TSParser_1.TSParser.parse(query, 'pg', ';');
        chai.expect(result).include(expectedResult, 'Returning result must include query itself.');
    });
});
describe('PostgreSQL Procedures', function () {
    it('should return 2 PostgreSQL procedures', function () {
        var query = `CREATE FUNCTION add(integer, integer) RETURNS integer
AS 'select $1 + $2;'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT;
CREATE FUNCTION divide(integer, integer) RETURNS integer
AS 'select $1 / $2;'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT;`;
        var expectedResult = [];
        expectedResult.push(`CREATE FUNCTION add(integer, integer) RETURNS integer
AS 'select $1 + $2;'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT`);
        expectedResult.push(`CREATE FUNCTION divide(integer, integer) RETURNS integer
AS 'select $1 / $2;'
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT`);
        var result = TSParser_1.TSParser.parse(query, 'pg', ';');
        chai.expect(result).have.members(expectedResult, 'Should be an array of string with 2 stored procedures.');
    });
});
describe('PostgreSQL Procedure with tag', function () {
    it('should return PostgreSQL procedure', function () {
        var query = `CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql;`;
        var expectedResult = `CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql`;
        var result = TSParser_1.TSParser.parse(query, 'pg', ';');
        chai.expect(result).include(expectedResult, 'Returning result must include query itself.');
    });
});
describe('PostgreSQL Procedures with tag', function () {
    it('should return 2 PostgreSQL procedures', function () {
        var query = `CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION divide(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i / 1;
        END;
$$ LANGUAGE plpgsql;`;
        var expectedResult = [];
        expectedResult.push(`CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql`);
        expectedResult.push(`CREATE OR REPLACE FUNCTION divide(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i / 1;
        END;
$$ LANGUAGE plpgsql`);
        var result = TSParser_1.TSParser.parse(query, 'pg', ';');
        chai.expect(result).have.members(expectedResult, 'Should be an array of string with 2 stored procedures.');
    });
});
describe('PostgreSQL Procedure and SQL Queries', function () {
    it('should return PostgreSQL procedure and other statements', function () {
        var query = `CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql;
SELECT * FROM users;
SELECT * FROM user_details;`;
        var expectedResult = [];
        expectedResult.push(`CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql`);
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        var result = TSParser_1.TSParser.parse(query, 'pg', ';');
        chai.expect(result).have.members(expectedResult, 'Should be an array of string with 1 stored procedure and 2 queries.');
    });
});
describe('PostgreSQL Procedure and SQL Queries - Syntax Error', function () {
    it('should not return PostgreSQL procedure and other statements', function () {
        var query = `CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql;
SELECT * FROM users
SELECT * FROM user_details;`;
        var expectedResult = [];
        expectedResult.push(`CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql`);
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        var result = TSParser_1.TSParser.parse(query, 'pg', ';');
        chai.expect(result).not.have.members(expectedResult, 'Should be an array of string with 1 stored procedure and 2 queries.');
    });
});
describe('PostgreSQL Queries with Comments and String', function () {
    it('should return an array with 2 items', function () {
        var query = `SELECT ';', '--', ';;;;' FROM test; -- comment
-- comment 2
// comment other
# comment
SELECT name,surname FROM user_details;`;
        var expectedResult = [];
        expectedResult.push("SELECT ';', '--', ';;;;' FROM test");
        expectedResult.push(`-- comment
-- comment 2
// comment other
# comment
SELECT name,surname FROM user_details`);
        var result = TSParser_1.TSParser.parse(query, 'pg', ';');
        chai.expect(result).have.members(expectedResult, 'Should be an array of string with 2 members.');
    });
});
//# sourceMappingURL=PostgreSQL.js.map