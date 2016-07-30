var mysql  = require('mysql'),
    linker = require('./linker.js'),
    conn   = mysql.createConnection({
              host: 'localhost',
              user: 'root',
              password: '12345',
              database: 'control'
             });

linker.start(conn);
