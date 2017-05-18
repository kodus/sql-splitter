<?php

require dirname(__DIR__) . '/vendor/autoload.php';

require __DIR__ . '/test-mssql.php';
require __DIR__ . '/test-mysql.php';
require __DIR__ . '/test-postgres.php';

exit(run());
