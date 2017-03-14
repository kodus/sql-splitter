import { TSParser } from "../src/index";
import * as Mocha from "mocha";
import * as chai from "chai";

describe("MSSQL 2 Basic Queries", function () {
    it("should return an array with 2 items", function () {
        let query = "SELECT * FROM users GO SELECT * FROM user_details";
        let expectedResult: Array<string> = [];
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        let result: Array<string> = TSParser.parse(query, "mssql", "GO");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 2 members.");
    });
});

describe("MSSQL Multi-statement", function () {
    it("should return an array with 1 item", function () {
        let query = "SELECT * FROM users; SELECT * FROM user_details";
        let expectedResult: Array<string> = [];
        expectedResult.push("SELECT * FROM users; SELECT * FROM user_details");
        let result: Array<string> = TSParser.parse(query, "mssql", "GO");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 2 members.");
    });
});

describe("MSSQL 2 Basic Queries - Syntax Error", function () {
    it("should not return an array with 2 items", function () {
        let query = "SELECT * FROM users SELECT * FROM user_details;";
        let expectedResult: Array<string> = [];
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details");
        let result: Array<string> = TSParser.parse(query, "mssql", "GO");
        chai.expect(result).not.have.members(expectedResult, "Should be an array of string with 2 members.");
    });
});

describe("MSSQL Procedure", function () {
    it("should return MSSQL procedure", function () {
        let query = `CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City
GO`;
        let expectedResult = `CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City`;
        let result: Array<string> = TSParser.parse(query, "mssql", "GO");
        chai.expect(result).include(expectedResult, "Returning result must include query itself.");
    });
});

describe("MSSQL Procedures", function () {
    it("should return 2 MSSQL procedures", function () {
        let query = `CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
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
        let expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City;`);

        expectedResult.push(`CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City`);
        let result: Array<string> = TSParser.parse(query, "mssql", "GO");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 2 stored procedures.");
    });
});

describe("MSSQL Procedure and SQL Queries", function () {
    it("should return MSSQL procedure and other statements", function () {
        let query = `CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City;
GO
SELECT * FROM users;
GO
SELECT * FROM user_details;`;
        let expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City;`);
        expectedResult.push("SELECT * FROM users;");
        expectedResult.push("SELECT * FROM user_details;");
        let result: Array<string> = TSParser.parse(query, "mssql", "GO");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 1 stored procedure and 2 queries.");
    });
});

describe("MSSQL Procedure and SQL Queries - Syntax Error", function () {
    it("should not return MSSQL procedure and other statements", function () {
        let query = `CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City;
SELECT * FROM users
SELECT * FROM user_details;`;
        let expectedResult: Array<string> = [];
        expectedResult.push(`CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City;`);
        expectedResult.push("SELECT * FROM users");
        expectedResult.push("SELECT * FROM user_details;");
        let result: Array<string> = TSParser.parse(query, "mssql", "GO");
        chai.expect(result).not.have.members(expectedResult, "Should be an array of string with 1 stored procedure and 2 queries.");
    });
});

describe("MSSQL Queries with Comments and String", function () {
    it("should return an array with 2 items", function () {
        let query = `SELECT ';', '--', ';;;;' FROM test -- comment
-- comment 2
// comment other
# comment
go
SELECT name,surname FROM user_details;`;
        let expectedResult: Array<string> = [];
        expectedResult.push(`SELECT ';', '--', ';;;;' FROM test -- comment
-- comment 2
// comment other
# comment`);
        expectedResult.push(`SELECT name,surname FROM user_details;`);
        let result: Array<string> = TSParser.parse(query, "mssql", "GO");
        chai.expect(result).have.members(expectedResult, "Should be an array of string with 2 members.");
    });
});
