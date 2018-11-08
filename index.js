const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "my-secret-pw"
});

conn.connect();
conn.query("SELECT USER()", (err, result, fields) => {
  console.log(err, result, fields);
  conn.end();
});
