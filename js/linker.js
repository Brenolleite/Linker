var AVLTree = require('binary-search-tree').AVLTree,
    tree    = new AVLTree(),
    defaultValues = {};

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
      list[index].func_params[row.param_name] = {type:  row.param_type,
                                               value: null};
    else {
      index++;
      list.push({
                  code       : generateCode(row.obj_name),
                  schema_name: row.schema_name,
                  func_name  : row.obj_name,
                  func_params: {}                 
                });

      list[index].func_params[row.param_name] = {type:  row.param_type,
                                                 value: null};
    }
  });

  return list;
}

function createAVL(rows){
  var list;

  list = organize(rows);

  list.forEach(function (obj){
    tree.insert(obj.code, obj);
  });
}

function link(func_name, func_params){
  var pointPosition,
      func_details,
      param,
      schema_name,
      shema_list,
      result;

  pointPosition = func_name.indexOf('.');

  if (pointPosition > -1){
    schema_name = func_name.substring(0, pointPosition);
    func_name   = func_name.substring(pointPosition, 99);

    schema_list = tree.search(generateCode(func_name));

    schema_list.forEach(function (obj){
      if(obj.schema_name === schema_name)
        func_details = obj;
    });
  } 
  else
    func_details = tree.search(generateCode(func_name))[0];

  if (func_details === undefined)
    return 'Not Found';

  result = func_details.func_name + '(';

  for (param in func_details.func_params){
    var value = param.value;

    if(func_params[param] !== undefined)
      value = func_params[param];
    else if(defaultValues[func_name] !== undefined)
      if(defaultValues[func_name][param] !== undefined)
      value = defaultValues[func_name][param];

    if (value === undefined || value === null)
      result += 'NULL, ';  
    else {
      if(param.type !== 'varchar')
        result += '\'' + value + '\', ';
      else
        result += value + ', ';
    }
  }

  result = result.substring(0, result.length - 2) + ');';

  return result;
}

function loadDefaultValues (configs){
  defaultValues = {};

  configs.forEach(function (config){
    defaultValues[config.func_name] = config.params_values;
  });
}

exports.start = function(connection){
  connection.connect();
  
  connection.query('select SPECIFIC_SCHEMA as schema_name, ' +
	                        'SPECIFIC_NAME as obj_name, ' +
	                        'PARAMETER_NAME as param_name, ' +
                          'DATA_TYPE as param_type ' +
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
