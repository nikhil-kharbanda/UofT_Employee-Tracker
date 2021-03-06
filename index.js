const cTable = require("console.table");
const inquirer = require("inquirer");
const mysql = require("mysql2");

/* Connection to database */
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Password123",  //add your database password here
  database: "company_records_db",
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
});

let salaryCost = 0;

/* Start */
getTask();

/* Main task to repeat */
function getTask() {
  inquirer
    .prompt({
      name: "task",
      type: "list",
      message: "Which task would you like to do?",
      choices: ["ADD", "VIEW", "UPDATE", "DELETE", "EXIT"],
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
        case "DELETE":
          deleteItem();
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

/* If user decided to add a new department */
function add_dept() {
  inquirer
    .prompt({
      name: "deptName",
      message: "What is the department's name?",
      type: "input",
    })
    .then(function ({ deptName }) {
      connection.query(
        `INSERT INTO department (dept_name) VALUES ('${deptName}')`,
        function (err, data) {
          if (err) throw err;
          console.log("Added department");
          getTask();
        }
      );
    });
}

/* If user decided to add a new role to a department */
function add_role() {
  let depts = [];

  connection.query(`SELECT * from department`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      var deptsObj = {
        name: data[i].dept_name,
        value: data[i].dept_id,
      };

      depts.push(deptsObj);
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
        connection.query(
          `INSERT INTO roles (title, department_id, salary) VALUES ('${roleName}', '${deptName}', '${roleSal}' )`,
          function (err, data) {
            if (err) throw err;
            console.log(`Added`);
            getTask();
          }
        );
      });
  });
}

/* If user decided to add a new role to a role */
function add_employee() {
  let employees = [];
  let roles = [];

  connection.query(`SELECT * from roles`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      var rolesObj = {
        name: data[i].title,
        value: data[i].roles_id,
        deptID: data[i].department_id,
        salary: data[i].salary,
      };

      roles.push(rolesObj);
    }

    connection.query(`SELECT * FROM employee`, function (err, data) {
      if (err) throw err;

      for (let i = 0; i < data.length; i++) {
        var personObj = {
          first_name: data[i].fName,
          last_name: data[i].lName,
          value: data[i].emp_id,
          roleID: data[i].role_id,
          manager: data[i].manager,
        };
        employees.push({
          name: personObj.first_name,
          roleID: personObj.roleID,
        });
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

          {
            name: "manager",
            message: "Who is their manager",
            type: "list",
            choices: ["none"].concat(employees),
          },
        ])

        .then(function ({ fName, lName, roleID, manager }) {
          connection.query(
            `INSERT INTO employee (fName, lName, role_id, manager) VALUES ('${fName}', '${lName}', '${roleID}', '${manager}')`,
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

/* If user wants to see specific thing */
function view() {
  inquirer
    .prompt({
      name: "view",
      type: "list",
      message: "What would you like to see?",
      choices: ["department", "roles", "employee", "back"],
    })

    .then(function ({ view }) {
      switch (view) {
        case "department":
          viewDept();
          break;
        case "roles":
          viewRoles();
          break;
        case "employee":
          viewEmp();
          break;
        case "back":
          getTask();
      }
    });
}

/* When user selects they want to view all the departments */
function viewDept() {
  connection.query(
    `SELECT dept_id, dept_name FROM department`,
    function (err, data) {
      if (err) throw err;

      console.table(data);
      getTask();
    }
  );
}

/* When user selects they want to view all the roles */
function viewRoles() {
  connection.query(
    "SELECT roles.roles_id, roles.title, department.dept_name, roles.salary FROM roles INNER JOIN department ON roles.department_id = department.dept_id",
    function (err, data) {
      if (err) throw err;

      console.table(data);

      getTask();
    }
  );
}

/* When user selects they want to view all the employees */
function viewEmp() {
  connection.query(
    `SELECT employee.emp_id, employee.fName, employee.lName, roles.title, department.dept_name, roles.salary, employee.manager FROM employee LEFT JOIN roles ON role_id = roles.roles_id LEFT JOIN department ON department.dept_id = roles.department_id`,
    function (err, data) {
      if (err) throw err;

      console.table(data);
      getTask();
    }
  );
}

/* When user selects want to update roles (tried to implment updating manager, but didnt get a chance to) */
function update() {
  inquirer
    .prompt({
      name: "updateType",
      type: "list",
      message: "What would you like to update?",
      choices: ["role", "back"],
    })
    .then(function ({ updateType }) {
      switch (updateType) {
        case "role":
          updateRole();
          break;
        // case "manager":
        //   updateManager();
        //   break;
      }
    });
}

/* If user wants to update an employees role */
function updateRole() {
  connection.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;

    let employeesFNames = [];
    let roles = [];

    for (let i = 0; i < data.length; i++) {
      var employeeObj = {
        id: data[i].emp_id,
        fName: data[i].fName,
        lName: data[i].lName,
        role_id: data[i].role_id,
        manager: data[i].manager,
      };
      employeesFNames.push({ name: employeeObj.fName, value: employeeObj.id });
    }

    connection.query(`SELECT * FROM roles`, function (err, data) {
      if (err) throw err;

      for (let i = 0; i < data.length; i++) {
        var rolesObj = {
          title: data[i].title,
          deptID: data[i].department_id,
          salary: data[i].salary,
          roles_ID: data[i].roles_id,
        };
        roles.push({ name: rolesObj.title, value: rolesObj.roles_ID });
      }

      inquirer
        .prompt([
          {
            name: "employee_id",
            message: "Who's role needs to be updated",
            type: "list",
            choices: employeesFNames,
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
            `UPDATE employee SET role_id = ${role_id} WHERE emp_id = ${employee_id}`,
            function (err, data) {
              if (err) throw err;

              getTask();
            }
          );
        });
    });
  });
}

// function updateManager() {
//   connection.query(`SELECT * FROM employee`, function (err, data) {
//     if (err) throw err;

//     let employeesFNames = ["none"];

//     for (let i = 0; i < data.length; i++) {
//       var employeeObj = {
//         id: data[i].emp_id,
//         fName: data[i].fName,
//         lName: data[i].lName,
//         role_id: data[i].role_id,
//         manager: data[i].manager,
//       };
//       employeesFNames.push({ name: employeeObj.fName, value: employeeObj.id });
//     }

//     inquirer
//       .prompt([
//         {
//           name: "employee_id",
//           type: "list",
//           message: "Who would you like to update?",
//           choices: employeesFNames,
//         },
//         {
//           name: "manager",
//           type: "list",
//           message: "Who's their new manager",
//           choices: employeesFNames,
//         },
//       ])

//       .then(({ employee_id, manager }) => {
//         console.log("Manager: " + manager);
//         connection.query(
//           `UPDATE employee SET manager =  ${manager} WHERE emp_id = ${employee_id}`,
//           function (err, data) {
//             if (err) throw err;
//             getTask();
//           }
//         );
//       });
//   });
// }

/* If user selects to delete an item */
function deleteItem() {
  inquirer
    .prompt([
      {
        name: "select",
        type: "list",
        message: "Select which you would like to remove",
        choices: ["department", "roles", "employee"],
      },
    ])
    .then(function ({ select }) {
      switch (select) {
        case "department":
          removeDept();
          break;
        case "roles":
          removeRole();
          break;
        case "employee":
          removeEmp();
          break;
      }
    });
}

/* If user selected to remove a department, select which one to remove */
function removeDept() {
  let depts = [];

  connection.query(`SELECT * from department`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      var deptsObj = {
        name: data[i].dept_name,
        value: data[i].dept_id,
      };

      depts.push({ name: deptsObj.name, value: deptsObj.value });
    }

    inquirer
      .prompt([
        {
          name: "dept_name",
          type: "list",
          message: "Which dept would you like to remove?",
          choices: depts,
        },
      ])
      .then(function ({ dept_name }) {
        connection.query(
          `DELETE FROM department WHERE dept_id = ${dept_name}`,
          function (err, data) {
            if (err) throw err;
            console.log("Removed");
            getTask();
          }
        );
      });
  });
}

/* If user selected to remove a role, select which one to remove */
function removeRole() {
  let roles = [];

  connection.query(`SELECT * FROM roles`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      var rolesObj = {
        title: data[i].title,
        deptID: data[i].department_id,
        salary: data[i].salary,
        roles_ID: data[i].roles_id,
      };
      roles.push({ name: rolesObj.title, value: rolesObj.roles_ID });
    }

    inquirer
      .prompt([
        {
          name: "role_name",
          type: "list",
          message: "Which role would you like to remove?",
          choices: roles,
        },
      ])
      .then(function ({ role_name }) {
        connection.query(
          `DELETE FROM roles WHERE roles_id = ${role_name}`,
          function (err, data) {
            if (err) throw err;
            console.log("Removed");
            getTask();
          }
        );
      });
  });
}

/* If user selected to remove an employee, select which one to remove */
function removeEmp() {
  let employees = [];

  connection.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      var personObj = {
        first_name: data[i].fName,
        last_name: data[i].lName,
        id: data[i].emp_id,
        roleID: data[i].role_id,
        manager: data[i].manager,
      };
      employees.push({
        name: personObj.first_name,
        value: personObj.id,
      });
    }

    inquirer
      .prompt([
        {
          name: "emp_name",
          type: "list",
          message: "Who would you like to remove?",
          choices: employees,
        },
      ])
      .then(function ({ emp_name }) {
        console.log(employees);
        console.log(emp_name);
        connection.query(
          `DELETE FROM employee WHERE emp_id = ${emp_name}`,
          function (err, data) {
            if (err) throw err;
            console.log("Removed");
            getTask();
          }
        );
      });
  });
}

/* Clear the database and exit */
function exit() {
  return;
}

