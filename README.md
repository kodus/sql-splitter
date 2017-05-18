# SQL Statement Splitter

A simple parser to split multiple statement SQL queries to separated statements for MySQL, PostgreSQL and Microsoft SQL Server.

This is an *unofficial* PHP port of [SQL-Statement-Parser by TeamSQL](https://github.com/TeamSQL/SQL-Statement-Parser).

# What does it do and which database engines are supported?

It supports MySQL, PostgreSQL and Microsoft SQL Server. Our parser splits multi-statement SQL queries into single statements.

# Install via Composer

    composer install

# Usage

```php
// TODO
```

It expects 3 parameters ;
	
*query* : SQL query
        
*dbType* : mysql, pg or mssql
        
*delimiter*: semicolon (;) for MySQL and PostgreSQL, 'GO' for Microsoft SQL Server

TSParser can parse;
        
*SQL Queries*
        
*Stored procedures, functions, views, etc..*
        
*PostgreSQL's tags (like $mytag$ )*
        
*MySQL's 'DELIMITER’*

# MySQL Example
In MySQL, semicolon (;) is default delimiter.
```
    var mysqlQueriesBasic : string = 'SELECT * FROM users;SELECT * FROM user_details;'
    var mysqlStatements = TSParser.parse(mysqlQueriesBasic, 'mysql', ';');
    mysqlStatements.forEach(statement => {
            console.log(statement + '\n-----------');
        });
```

It will return an array with 2 items, items are; 

`SELECT * FROM users`

`SELECT * FROM user_details`

## MySQL Stored Procedure and Regular Queries
```
    DELIMITER //
    CREATE PROCEDURE country_hos(IN con CHAR(20))
    BEGIN
        SELECT Name, HeadOfState FROM Country
        WHERE Continent = con;
    END //
    DELIMITER ;
    SELECT * FROM users;
    SELECT * FROM user_details;
```

It will return an array with 3 items, items are; 

```
  CREATE PROCEDURE country_hos(IN con CHAR(20))
  BEGIN
      SELECT Name, HeadOfState FROM Country
      WHERE Continent = con;
  END
```

`SELECT * FROM users`

`SELECT * FROM user_details`

# PostgreSQL Example
In PostgreSQL, semicolon (;) is default delimiter.

```
    var postgreSQLQueriesBasic : string = 'SELECT * FROM users;SELECT * FROM user_details;'
    var pgStatements = TSParser.parse(postgreSQLQueriesBasic, 'pg', ';');
    pgStatements.forEach(statement => {
            console.log(statement + '\n-----------');
    });
```

This will return an array with 2 items, items are; 

`SELECT * FROM users`

`SELECT * FROM user_details`

## PostgreSQL Function and Regular Queries
```
   CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql;
SELECT * FROM users;
SELECT * FROM user_details;
```

It will return an array with 3 items, items are; 

```
  CREATE OR REPLACE FUNCTION increment(i integer) RETURNS integer AS $$
        BEGIN
                RETURN i + 1;
        END;
$$ LANGUAGE plpgsql
```

`SELECT * FROM users`

`SELECT * FROM user_details`

# Microsoft SQL Server Example
In Microsoft SQL Server, GO keyword is default delimiter.  

> Unlike MySQL and PostgreSQL, if you don’t use a delimiter ( which is ‘GO’ ), MSSQL will execute it as a multi-statement query. MySQL and PostgreSQL will throw syntax exception.   

```
    var postgreSQLQueriesBasic : string = ‘SELECT * FROM users GO SELECT * FROM user_details;’
    var pgStatements = TSParser.parse(postgreSQLQueriesBasic, ‘pg’, ‘;’);
    pgStatements.forEach(statement => {
            console.log(statement + ‘\n—————‘);
    });
```

This will return an array with 2 items, items are; 

`SELECT * FROM users`

`SELECT * FROM user_details`

##  Microsoft SQL Server Stored Procedure and Regular Queries
```
  CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City;
GO
SELECT * FROM users;
GO
SELECT * FROM user_details;
```

It will return an array with 3 items, items are; 

```
CREATE PROCEDURE dbo.uspGetAddress @City nvarchar(30)
AS
SELECT * 
FROM Person.Address
WHERE City = @City;
```

`SELECT * FROM users`

`SELECT * FROM user_details`
