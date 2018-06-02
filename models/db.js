var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'nodejs',
  password: '3q13q112',
  database: 'nodejs'
});

module.exports = {
    executeQuery: function(sql, param, callback) {
        if(param == null) {
            connection.query(sql, function(err, res){
                if(err) {
                    console.log(err);
                    callback(null);
                } else {
                    callback(res);
                }
            });
        } else {
            connection.query(sql, param, function(err, res){
                if(err) {
                    console.log(err);
                    callback(null);
                } else {
                    callback(res);
                }
            });
        }
    }
};