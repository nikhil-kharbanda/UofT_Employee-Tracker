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
});

/* Start */
getTask();

/* Main task to repeat */
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
          exit();
          connection.end();
          break;
      }
    });
}

/* Select what to add (ie. Dept, Role, Employee) */
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
          //add_employee;
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
        `INSERT INTO department (name) VALUES ('${deptName}')`,
        function (err, data) {
          if (err) throw err;
          console.log("Added department");
          getTask();
        }
      );
    });
}

function add_role() {
  let depts = [];

  connection.query(`SELECT * from department`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      depts.push(data[i].name);
    }

    inquirer
      .prompt([
        {
          name: "roleName",
          type: "input",
          message: "What is the roles name?",
        },

        {
          name: "deptName",
          type: "list",
          message: "What department does this role belong to?",
          choices: depts,
        },

        {
          name: "roleSal",
          type: "input",
          message: "How much does this person make?",
        },
      ])
      .then(function ({ roleName, deptName, roleSal }) {
        let index = depts.indexOf(deptName);

        connection.query(
          `INSERT INTO roles(title, department_ID, salary) VALUES ('${roleName}', '${index}', '${roleSal}' )`,
          function (err, data) {
            if (err) throw err;
            console.log(`Added`);
            getJob();
          }
        );
      });
  });
}

function add_employee() {}

function view() {
    inquirer.prompt({
        name: "view",
        type: "list",
        message: "What would you like to see?",
        choices: ["department", "roles", "employee"]
    })
    .then (function ( {view} ) {
        connection.query(`SELECT * FROM ${view}`, function (err, data) {
            if(err) throw err;

            console.table(data);
            getTask();
        });
    });
}

function update() {}

function exit() {
  connection.query(`DELETE FROM department`, function (err, data) {
    if (err) throw err;
    console.log("Cleared dept table");
  });
}
