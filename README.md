# SQL Statement Splitter

A simple parser to split SQL (and/or DDL) files into individual SQL queries.

This is an *unofficial* PHP port of [SQL-Statement-Parser by TeamSQL](https://github.com/TeamSQL/SQL-Statement-Parser).

[![PHP Version](https://img.shields.io/badge/php-7.0%2B-blue.svg)](https://packagist.org/packages/kodus/sql-splitter)
[![Build Status](https://travis-ci.org/kodus/sql-splitter.svg?branch=master)](https://travis-ci.org/kodus/sql-splitter)

### Install via Composer

    composer require kodus/sql-splitter

### Features

Supported SQL File Formats:

 * MySQL
 * PostgreSQL
 * Microsoft SQL Server

Specifically with support for the following SQL/DDL features:

 * SQL and DDL Queries
 * Stored procedures, functions, views, etc.
 * PostgreSQL's dollar-tags (e.g. `$$` and `$mytag$`, etc.)
 * MySQL's `DELIMITER`

## Usage

Pick one of the platform-specific methods:

```php
$statements = SQLSplitter::splitMySQL(file_get_contents(...));
$statements = SQLSplitter::splitMSSQL(file_get_contents(...));
$statements = SQLSplitter::splitPostgreSQL(file_get_contents(...));
```

Or dynamically pick one based on the PDO driver-name:

```php
$driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

$statements = SQLSplitter::split($driver, file_get_contents(...));
```

Driver-names are also available as `SQLSplitter` class-constants, e.g. `DB_MYSQL`, `DB_MSSQL` and `DB_PGSQL`.
