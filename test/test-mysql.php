<?php

use Kodus\SQLSplitter;

test('MySQL 2 Basic Queries', function () {
    $query = 'SELECT * FROM users;SELECT * FROM user_details;';
    $expectedResult = [
        'SELECT * FROM users',
        'SELECT * FROM user_details',
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 2 members.');
});

test('MySQL 2 Basic Queries - Syntax Error', function () {
    $query = 'SELECT * FROM users SELECT * FROM user_details;';
    $expectedResult = [
        'SELECT * FROM users SELECT * FROM user_details' // semi-colon stripped
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult);
});

test('MySQL Procedure ends with DELIMITER', function () {
    $query = "DELIMITER //\nCREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND //\nDELIMITER ;";
    $expectedResult = [
        "CREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND",
        "DELIMITER", // TODO is this an error? the original test didn't cover this!
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult, 'Returning $result must include query itself.');
});

test('MySQL Procedure with comment', function () {
    $query = "-- DROP PROCEDURE IF EXISTS `country_hos`;\nDELIMITER $$\nCREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND\n$$";
    $expectedResult = [
        "CREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND",
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 1 stored procedure and comment.');
});

test('MySQL Procedures, queries and comments', function () {
    $query = "-- DROP PROCEDURE IF EXISTS `country_hos`;\nDELIMITER $$\nCREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND\n$$\nDELIMITER ;\nSELECT * FROM users;\nSELECT * FROM user_details; -- COMMENT AREA\n-- ;\n-- DELIMITER $$\nDELIMITER //\nCREATE PROCEDURE country_hos_second\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND\n//";
    $expectedResult = [
        "CREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND",
        'SELECT * FROM users',
        'SELECT * FROM user_details',
        "CREATE PROCEDURE country_hos_second\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND",
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 1 stored procedure and comment.');
});

test('MySQL Procedures, queries and comments (2)', function () {
    $query = "-- DROP PROCEDURE IF EXISTS `country_hos`;\nDELIMITER $$ -- comment\nCREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND\n$$\nDELIMITER ;\nSELECT * FROM users;\nSELECT * FROM user_details; -- COMMENT AREA\n-- ;\n-- DELIMITER $$\nDELIMITER //\nCREATE PROCEDURE country_hos_second\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND\n//";
    $expectedResult = [
        "-- comment\nCREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND",
        'SELECT * FROM users',
        'SELECT * FROM user_details',
        "CREATE PROCEDURE country_hos_second\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND",
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 1 stored procedure and comment.');
});

test('MySQL Procedures', function () {
    $query = "DELIMITER //\nCREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND //\nDELIMITER //\nCREATE PROCEDURE city_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name FROM City\n  WHERE Continent = con;\nEND //";
    $expectedResult = [
        "CREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND",
        "CREATE PROCEDURE city_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name FROM City\n  WHERE Continent = con;\nEND",
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 2 stored procedures.');
});

test('MySQL Procedure and SQL Queries', function () {
    $query = "DELIMITER //\nCREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND //\nDELIMITER ;\nSELECT * FROM users;\nSELECT * FROM user_details;";
    $expectedResult = [
        "CREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND",
        "SELECT * FROM users",
        "SELECT * FROM user_details",
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 1 stored procedure and 2 queries.');
});

test('MySQL Procedure and SQL Queries - Syntax Error', function () {
    $query = "DELIMITER //\nCREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND //\nDELIMITER ;\nSELECT * FROM users\nSELECT * FROM user_details;";
    $expectedResult = [
        "CREATE PROCEDURE country_hos\n(IN con CHAR(20))\nBEGIN\n  SELECT Name, HeadOfState FROM Country\n  WHERE Continent = con;\nEND",
        "SELECT * FROM users\nSELECT * FROM user_details",
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult);
});

test('MySQL Queries with Comments and String', function () {
    $query = "SELECT ';', '--', ';;;;' FROM test; -- comment\n-- comment 2\n// comment other\n# comment\nSELECT name,surname FROM user_details;";
    $expectedResult = [
        "SELECT ';', '--', ';;;;' FROM test",
        "-- comment\n-- comment 2\n// comment other\n# comment\nSELECT name,surname FROM user_details",
    ];
    $result = SQLSplitter::splitMySQL($query);
    eq($result, $expectedResult, 'Should be an array of string with 2 members.');
});
