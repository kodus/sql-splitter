<?php

use Kodus\SQLSplitter;

test('MSSQL 2 Basic Queries', function () {
    $query = 'SELECT * FROM users GO SELECT * FROM user_details';
    $expectedResult = [
        'SELECT * FROM users',
        'SELECT * FROM user_details',
    ];
    $result = SQLSplitter::splitMSSQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 2 members.');
});

test('MSSQL Multi-statement', function () {
    $query = 'SELECT * FROM users; SELECT * FROM user_details';
    $expectedResult = ['SELECT * FROM users; SELECT * FROM user_details'];
    $result = SQLSplitter::splitMSSQL($query);
    eq($result, $expectedResult);
});

test('MSSQL 2 Basic Queries - Syntax Error', function () {
    $query = 'SELECT * FROM users SELECT * FROM user_details;';
    $expectedResult = [
        'SELECT * FROM users SELECT * FROM user_details;',
    ];
    $result = SQLSplitter::splitMSSQL($query);
    eq($result, $expectedResult);
});

test('MSSQL Procedure', function () {
    $query = "CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)\nAS\nSELECT * \nFROM Person.Address\nWHERE City = @City\nGO";
    $expectedResult = ["CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)\nAS\nSELECT * \nFROM Person.Address\nWHERE City = @City"];
    $result = SQLSplitter::splitMSSQL($query);
    eq($result, $expectedResult, 'Returning result must include query itself.');
});

test('MSSQL Mutiple Procedures', function () {
    $query = "CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)\nAS\nSELECT * \nFROM Person.Address\nWHERE City = @City;\nGO\nCREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)\nAS\nSELECT * \nFROM Person.Address\nWHERE City = @City";
    $expectedResult = [
        "CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)\nAS\nSELECT * \nFROM Person.Address\nWHERE City = @City;",
        "CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)\nAS\nSELECT * \nFROM Person.Address\nWHERE City = @City",
    ];
    $result = SQLSplitter::splitMSSQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 2 stored procedures.');
});

test('MSSQL Procedure and SQL Queries', function () {
    $query = "CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)\nAS\nSELECT * \nFROM Person.Address\nWHERE City = @City\nGO\nSELECT * FROM users\nGO\nSELECT * FROM user_details";
    $expectedResult = [
        "CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)\nAS\nSELECT * \nFROM Person.Address\nWHERE City = @City",
        "SELECT * FROM users",
        "SELECT * FROM user_details",
    ];
    $result = SQLSplitter::splitMSSQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 1 stored procedure and 2 queries.');
});

test('MSSQL Procedure and SQL Queries - Syntax Error', function () {
    $query = "CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)\nAS\nSELECT * \nFROM Person.Address\nWHERE City = @City;\nSELECT * FROM users\nSELECT * FROM user_details;";
    $expectedResult = [$query];
    $result = SQLSplitter::splitMSSQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 1 stored procedure and 2 queries.');
});

test('MSSQL Queries with Comments and String', function () {
    $query = "SELECT ';', '--', ';;;;' FROM test -- comment\n-- comment 2\n// comment other\n# comment\ngo\nSELECT name,surname FROM user_details;";
    $expectedResult = [
        "SELECT ';', '--', ';;;;' FROM test -- comment\n-- comment 2\n// comment other\n# comment",
        "SELECT name,surname FROM user_details;",
    ];
    $result = SQLSplitter::splitMSSQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 2 members.');
});
