var mysql  = require('mysql'),
    linker = require('./linker.js'),
    conn   = mysql.createConnection({
              host: 'localhost',
              user: 'root',
              password: '12345',
              database: 'control'
             });


loadDefaultValues([{
                          func_name: 'teste',
                          params_values:{
                                          teste: 1
                                        }
                        },
                        {
                          func_name: 'f_login',
                          params_values:{
                                          psessId: 'LOLFunciona'
                                        }
                        }]);

      link('f_login', {pemail: 'brenolleite@gmail.com',
                       psenha: 'teste',
                       psessId: 'OO'});

linker.start(conn);