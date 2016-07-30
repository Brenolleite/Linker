var AVLTree = require('binary-search-tree').AVLTree,
    tree    = new AVLTree();


function generateCode(name){
  var strCode = '',
      charCode;

  for (var i = 0; i < name.length; i++){
    charCode = name.charCodeAt(i);
    // [A-Z]
    if (charCode > 64 && charCode < 91)
      strCode += (charCode - 55).toString();
    // [a-z]
    else if (charCode > 96 && charCode < 122)
      strCode += (charCode - 62).toString();
    // [_] 
    else if (charCode === 95)
      strCode += '00';
  }
  
  return parseInt(strCode);
}

function organize(rows){
  var list  = []
      index = -1;

  rows.forEach(function (row){
    if (index !== -1 &&
        list[index].schema_name === row.schema_name &&
        list[index].func_name === row.obj_name)
      list[index].func_params.push(row.param_name);
    else {

      index++;
      list.push({
                  code       : generateCode(row.obj_name),
                  schema_name: row.schema_name,
                  func_name  : row.obj_name,
                  func_params: [row.param_name]
                });
    }
  });

  return list;
}

function createAVL(rows){
  var list = organize(rows);
  list.forEach(function (obj){
    tree.insert(obj.code, obj);
  });
}

exports.link = function(func_name, func_params){
  var params = tree.search(generateCode(func_name));
}

exports.start = function(connection){
  connection.connect();
  
  connection.query('select SPECIFIC_SCHEMA as schema_name, ' +
	                        'SPECIFIC_NAME as obj_name, ' +
                          'ORDINAL_POSITION as param_position, '+
	                        'PARAMETER_NAME as param_name ' +
                     'from information_schema.PARAMETERS ' +
                    'where PARAMETER_NAME is not null ' +
                    'order by SPECIFIC_SCHEMA, SPECIFIC_NAME, ORDINAL_POSITION;',
  function(err, rows) {
    if (!err){
      createAVL(rows);
      return 'OK';
    }
    else
      return 'Error while fetching parameters from MySQL.';
  });

  connection.end();
}