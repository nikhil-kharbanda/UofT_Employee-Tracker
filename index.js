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
          add_employee();
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
      var deptsObj = {
        name: data[i].name,
        value: data[i].dept_id,
      };

      depts.push(deptsObj);
    }

    // console.log(deptsObj);

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
        connection.query(
          `INSERT INTO roles (title, department_ID, salary) VALUES ('${roleName}', '${deptName}', '${roleSal}' )`,
          function (err, data) {
            if (err) throw err;
            console.log(`Added`);
            getTask();
          }
        );
      });
  });
}

function add_employee() {
  let employees = [];
  let roles = [];

  connection.query(`SELECT * from roles`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      var rolesObj = {
        name: data[i].title,
        value: data[i].roles_id,
        deptID: data[i].department_ID,
        salary: data[i].salary,
      };

      roles.push(rolesObj);
    }

    console.log(rolesObj);

    connection.query(`SELECT * FROM employee`, function (err, data) {
      if (err) throw err;

      for (let i = 0; i < data.length; i++) {
        var personObj = {
          first_name: data[i].fName,
          last_name: data[i].lName,
          value: data[i].emp_id,
          roleID: data[i].role_id,
        };
        employees.push(personObj);
        console.log(personObj);
      }

      inquirer
        .prompt([
          {
            name: "fName",
            type: "input",
            message: "Employees first name",
          },

          {
            name: "lName",
            type: "input",
            message: "Employees last name",
          },

          {
            name: "roleID",
            message: "What is their role?",
            type: "list",
            choices: roles,
          },
        ])

        .then(function ({ fName, lName, roleID }) {
          connection.query(
            `INSERT INTO employee (fName, lName, role_id) VALUES ('${fName}', '${lName}', '${roleID}')`,
            function (err, data) {
              if (err) throw err;
              console.log(`Added`);
              getTask();
            }
          );
        });
    });
  });
}

function view() {
  inquirer
    .prompt({
      name: "view",
      type: "list",
      message: "What would you like to see?",
      choices: ["department", "roles", "employee"],
    })
    .then(function ({ view }) {
      connection.query(`SELECT * FROM ${view}`, function (err, data) {
        if (err) throw err;

        console.table(data);
        getTask();
      });
    });
}

function update() {
  inquirer
    .prompt({
      name: "updateType",
      type: "list",
      message: "What would you like to update?",
      choices: ["role", "manager"],
    })
    .then(function ({ updateType }) {
      switch (updateType) {
        case "role":
          updateRole();
          break;
        case "manager":
          updateManager();
          break;
      }
    });
}

function updateRole() {
  connection.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;
    let employees = [];
    let roles = [];

    for (let i = 0; i < data.length; i++) {
      // employees.push(data[i].fName);
      var employeeObj = {
        fName: data[i].fName,
        lName: data[i].lName,
        role_id: data[i].role_id,
      };
      employees.push(employeeObj.fName);
    }

    connection.query(`SELECT * FROM roles`, function (err, data) {
      if (err) throw err;

      for (let i = 0; i < data.length; i++) {
        var rolesObj = {
          title: data[i].title,
          deptID: data[i].department_ID,
          salary: data[i].salary,
        };
        roles.push(rolesObj.title);
      }

      inquirer
        .prompt([
          {
            name: "employee_id",
            message: "Who's role needs to be updated",
            type: "list",
            choices: employees,
          },
          {
            name: "role_id",
            message: "What is the new role?",
            type: "list",
            choices: roles,
          },
        ])
        .then(function ({ employee_id, role_id }) {
          connection.query(
            `UPDATE employee SET role_id = ${"role_id"}`,
            function (err, data) {
              if (err) throw err;

              getTask();
            }
          );
        });
    });
  });
}

function updateManager() {}

function exit() {
  deleteEmp();
  deleteRoles();
  deleteDept();
}

function deleteDept() {
  connection.query(`DELETE FROM department`, function (err, data) {
    if (err) throw err;
    console.log("Cleared dept table");
  });
}

function deleteRoles() {
  connection.query(`DELETE FROM roles`, function (err, data) {
    if (err) throw err;
    console.log("Cleared roles table");
  });
}

function deleteEmp() {
  connection.query(`DELETE FROM employee`, function (err, data) {
    if (err) throw err;
    console.log("Cleared roles table");
  });
}
