const cTable = require("console.table");
const inquirer = require("inquirer");
const mysql = require("mysql2");

/* Connection to database */
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "6477407414nK!",
  database: "company_records_db",
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }

  console.log("Connected to db as id " + connection.threadId);
});

/* Start */
getTask();

function getTask() {
  inquirer
    .prompt({
      name: "task",
      type: "list",
      message: "Which task would you like to do?",
      choices: ["ADD", "VIEW", "UPDATE", "EXIT"],
    })
    .then(function ({ task }) {
      switch (task) {
        case "ADD":
          add();
          break;
        case "VIEW":
          view();
          break;
        case "UPDATE":
          update();
          break;
        case "EXIT":
          connection.end();
          break;
      }
    });
}

function add() {
  inquirer
    .prompt({
      name: "addType",
      type: "list",
      message: "Which of the following would you like to add?",
      choices: ["Dept", "Role", "Employee"],
    })
    .then(function ({ addType }) {
      switch (addType) {
        case "Dept":
          add_dept();
          break;
        case "Role":
          add_role();
          break;
        case "Employee":
          add_employee;
          break;
      }
    });
}

function add_dept() {
  inquirer
    .prompt({
      name: "deptName",
      message: "What is the department's name?",
      type: "input",
    })
    .then(function ({ deptName }) {
      connection.query(
        `INSERT INTO department (name) VALUES ('${deptName})`,
        function (err, data) {
          if (err) throw err;
          console.log("added");
          getTask();
        }
      );
    });
}

function add_role() {
  let depts = [];

  connection.query(`SELECT * FROM department`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      depts.push(data[i].name);
    }

    inquirer.prompt([
      {
        name: "roleName",
        type: "input",
        message: "What is the name of the role?",
      },

      {
        name: "deptID",
        type: "list",
        message: "What department does this role belong to",
        choices: depts,
      },

      {
        name: "roleSal",
        type: "input",
        message: "What is this roles salary",
      }
    ])
    
    .then(function ({roleName, deptID, roleSal}){
        let index = depts.indexOf(deptID);

        connection.query(
            `INSERT INTO roles (title, salary, department_ID) VALUES ('${roleName}', '${roleSal}', ${index})`,
            function(err, data){
                if(err) throw err;
                console.log("Added Role");
                getTask();
            }
        );
    });
  });
}

function add_employee() {}

function view() {}

function update() {}

function exit() {}
