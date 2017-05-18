<?php

use Kodus\TSParser;

test('PostgreSQL 2 Basic Queries', function () {
    $query = 'SELECT * FROM users;SELECT * FROM user_details;';
    $expectedResult = [
        'SELECT * FROM users',
        'SELECT * FROM user_details',
    ];
    $result = TSParser::parse($query, 'pg', ';');
    eq($result, $expectedResult, 'Should be an array of string with 2 members.');
});

test('PostgreSQL 2 Basic Queries - Syntax Error', function () {
    $query = 'SELECT * FROM users SELECT * FROM user_details;';
    $expectedResult = [
        'SELECT * FROM users SELECT * FROM user_details',
    ];
    $result = TSParser::parse($query, 'pg', ';');
    eq($result, $expectedResult, 'Should be an array of string with 2 members.');
});

test('PostgreSQL Procedure', function () {
    $query = "CREATE FUNCTION add(integer, integer) RETURNS integer\nAS 'select $1 + $2;'\nLANGUAGE SQL\nIMMUTABLE\nRETURNS NULL ON NULL INPUT;";
    $expectedResult = [
        "CREATE FUNCTION add(integer, integer) RETURNS integer\nAS 'select $1 + $2;'\nLANGUAGE SQL\nIMMUTABLE\nRETURNS NULL ON NULL INPUT",
    ];
    $result = TSParser::parse($query, 'pg', ';');
    eq($result, $expectedResult, 'Returning result must include $query itself.');
});

test('PostgreSQL Procedures', function () {
    $query = "CREATE FUNCTION add(integer, integer) RETURNS integer\nAS 'select $1 + $2;'\nLANGUAGE SQL\nIMMUTABLE\nRETURNS NULL ON NULL INPUT;\nCREATE FUNCTION divide(integer, integer) RETURNS integer\nAS 'select $1 / $2;'\nLANGUAGE SQL\nIMMUTABLE\nRETURNS NULL ON NULL INPUT;";
    $expectedResult = [
        "CREATE FUNCTION add(integer, integer) RETURNS integer\nAS 'select $1 + $2;'\nLANGUAGE SQL\nIMMUTABLE\nRETURNS NULL ON NULL INPUT",
        "CREATE FUNCTION divide(integer, integer) RETURNS integer\nAS 'select $1 / $2;'\nLANGUAGE SQL\nIMMUTABLE\nRETURNS NULL ON NULL INPUT",
    ];
    $result = TSParser::parse($query, 'pg', ';');
    eq($result, $expectedResult, 'Should be an array of string with 2 stored procedures.');
});

test('PostgreSQL Procedure with tag', function () {
    $query = "CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i + 1;\n        END;\n$$ LANGUAGE plpgsql;";
    $expectedResult = [
        "CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i + 1;\n        END;\n$$ LANGUAGE plpgsql",
    ];
    $result = TSParser::parse($query, 'pg', ';');
    eq($result, $expectedResult, 'Returning result must include query itself.');
});

test('PostgreSQL Procedures with tag', function () {
    $query = "CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i + 1;\n        END;\n$$ LANGUAGE plpgsql;\nCREATE OR REPLACE FUNCTION divide(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i / 1;\n        END;\n$$ LANGUAGE plpgsql;";
    $expectedResult = [
        "CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i + 1;\n        END;\n$$ LANGUAGE plpgsql",
        "CREATE OR REPLACE FUNCTION divide(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i / 1;\n        END;\n$$ LANGUAGE plpgsql",
    ];
    $result = TSParser::parse($query, 'pg', ';');
    eq($result, $expectedResult, 'Should be an array of string with 2 stored procedures.');
});

test('PostgreSQL Procedure and SQL Queries', function () {
    $query = "CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i + 1;\n        END;\n$$ LANGUAGE plpgsql;\nSELECT * FROM users;\nSELECT * FROM user_details;";
    $expectedResult = [
        "CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i + 1;\n        END;\n$$ LANGUAGE plpgsql",
        "SELECT * FROM users",
        "SELECT * FROM user_details",
    ];
    $result = TSParser::parse($query, 'pg', ';');
    eq($result, $expectedResult, 'Should be an array of string with 1 stored procedure and 2 queries.');
});

test('PostgreSQL Procedure and SQL Queries - Syntax Error', function () {
    $query = "CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i + 1;\n        END;\n$$ LANGUAGE plpgsql;\nSELECT * FROM users\nSELECT * FROM user_details;";
    $expectedResult = [
        "CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$\n        BEGIN\n                RETURN i + 1;\n        END;\n$$ LANGUAGE plpgsql",
        "SELECT * FROM users\nSELECT * FROM user_details",
    ];
    $result = TSParser::parse($query, 'pg', ';');
    eq($result, $expectedResult, 'Should be an array of string with 1 stored procedure and 2 queries.');
});

test('PostgreSQL Queries with Comments and String', function () {
    $query = "SELECT ';', '--', ';;;;' FROM test; -- comment\n-- comment 2\n// comment other\n# comment\nSELECT name,surname FROM user_details;";
    $expectedResult = [
        "SELECT ';', '--', ';;;;' FROM test",
        "-- comment\n-- comment 2\n// comment other\n# comment\nSELECT name,surname FROM user_details",
    ];
    $result = TSParser::parse($query, 'pg', ';');
    eq($result, $expectedResult, 'Should be an array of string with 2 members.');
});
