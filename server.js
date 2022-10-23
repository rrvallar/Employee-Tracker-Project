const connection = require('./config/connection');
const inquirer = require('inquirer');
const cTable = require('console.table');

const validator = require('validator');

const validate = {
  validateString(str) {
    return str !== '' || 'Invalid response!';
  },
  validateSalary(num) {
    if (validator.isDecimal(num)) return true;
    return 'Invalid salary!';
  },
  isSame(str1, str2) {
    if (str1 === str2) return true;
  }
};


connection.connect((error) => {
  if (error) throw error;
  console.log("=========================================");
  console.log("EMPLOYEE TRACKER")
  console.log("=========================================");
  promptUser();
});


const promptUser = () => {
  inquirer.prompt([
      {
        name: 'choices',
        message: 'Please select an option:',
        type: 'list',
        choices: [
          'View All Employees',
          'View All Roles',
          'View All Departments',
          'Update Employee Role',
          'Add Employee',
          'Add Role',
          'Add Department',
          'Quit'
          ]
      }
    ])
    .then((answers) => {
      const {choices} = answers;
    
        if (choices === 'View All Departments') {
          getDepartments();
        }

        if (choices === 'View All Employees') {
            getEmployees();
        }
        
        if (choices === 'View All Roles') {
          viewAllRoles();
      }

        if (choices === 'Add Employee') {
          addEmployee();
        } 

        if (choices === 'Update Employee Role') {
            updateEmployeeRole();
        }


        if (choices === 'Add Role') {
            addRole();
        }

        if (choices === 'Add Department') {
            addDepartment();
        }

        if (choices === 'Quit') {
            connection.end();
        }
  });
};




const getEmployees = () => {
  var sql =`SELECT employee.id, 
            employee.first_name,
            employee.last_name,
            role.title,
            department.department_name AS 'department',
            role.salary
            FROM employee, role, department
            WHERE department.id = role.department_id
            AND role.id = employee.role_id
            ORDER BY employee.id ASC
          `;


  connection.promise().query(sql, (e, res) => {
    if (e) throw error;
    
    console.log( `====================================================================================`);

    console.log(`All Employees:`);
    
    console.log(`====================================================================================`);

    console.table(res);

    console.log(`====================================================================================`);

    promptUser();
    
  });
};


const viewAllRoles = () => {
  console.log("==================");
  console.log((`Employee Roles:`));
  console.log("==================");
  const sql = `SELECT role.id, role.title, department.department_name AS department FROM role INNER JOIN department ON role.department_id = department.id`;
  
  connection.promise().query(sql, (error, response) => {
    if (error) throw error;
      response.forEach((role) => {console.log(role.title);});
      console.log("==================");
      promptUser();
  });
};


const getDepartments = () => {
  const sql =   `SELECT department.id AS id, department.department_name AS department FROM department`; 
  
  
  connection.promise().query(sql, (e, response) => {
    if (e) throw error;
    console.log("==================");
    console.log((`All Departments:`));
    console.log("==================");
    console.table(response);
    console.log("==================");
    promptUser();
  });
};


const addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "What is the employee first name?",
      validate: addFirstName => {
        if (addFirstName) {
            return true;
        } else {
            console.log('Try again:');
            return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: "What is the employee's last name?",
      validate: addLastName => {
        if (addLastName) {
            return true;
        } else {
            console.log('Try again:');
            return false;
        }
      }
    }
  ])
    .then(answer => {
    const crit = [answer.firstName, answer.lastName]
    const sql = `SELECT role.id, role.title FROM role`;
    connection.promise().query(sql, (error, data) => {
      if (error) throw error; 
      const roles = data.map(({ id, title }) => ({ name: title, value: id }));
      inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee role?",
              choices: roles
            }
          ])
            .then(roleChoice => {
              crit.push(roleChoice.role);

              const sql =  `SELECT * FROM employee`;
              
              connection.promise().query(sql, (error, data) => {
                if (error) throw error;
                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Which is the employee's manager?",
                    choices: managers
                  }
                ])
                  .then(managerChoice => {
                    const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;

                    crit.push(managerChoice.manager);

                    connection.query(sql, crit, (error) => {
                    if (error) throw error;
                    
                    getEmployees();
                    console.log("Employee has been added!")
              });
            });
          });
        });
     });
  });
};


const addRole = () => {
  const sql = 'SELECT * FROM department'
  connection.promise().query(sql, (error, response) => {
      if (error) throw error;

      let departmentNames = [];
      response.forEach((department) => {departmentNames.push(department.department_name);});
      departmentNames.push('Create Department');
      inquirer
        .prompt([
          {
            name: 'departmentName',
            type: 'list',
            message: 'Which department is this new role in?',
            choices: departmentNames
          }
        ])
        .then((answer) => {
          if (answer.departmentName === 'Create Department') {
            this.addDepartment();
          } else {
            continueAddRole(answer);
          }
        });

      const continueAddRole = (departmentData) => {
        inquirer
          .prompt([
            {
              name: 'newRole',
              type: 'input',
              message: 'What is the name of the role?',
              validate: validate.validateString
            },
            {
              name: 'salary',
              type: 'input',
              message: 'What is the salary of the role?',
              validate: validate.validateSalary
            }
          ])
          .then((answer) => {
            let addedRole = answer.newRole;
            let deptId;

            response.forEach((department) => {
              if (departmentData.departmentName === department.department_name) {deptId = department.id;}
            });

            let sql =   `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

            connection.promise().query(sql, [addedRole, answer.salary, deptId], (error) => {
              if (error) throw error;
              console.log("==================");
              console.log((`Role successfully created!`));
              console.log("==================");

              viewAllRoles();
            });
          });
      };
    });
  };


const addDepartment = () => {
    inquirer
      .prompt([
        {
          name: 'newDepartment',
          type: 'input',
          message: 'What is the name of your new Department?',
          validate: validate.validateString
        }
      ])
      .then((answer) => {
        let sql =`INSERT INTO department (department_name) VALUES (?)`;
        connection.query(sql, answer.newDepartment, (error, response) => {
          if (error) throw error;
          console.log(``);
          console.log((answer.newDepartment + ` Department successfully created!`));
          console.log(``);
          getDepartments();
        });
      });
};




const updateEmployeeRole = () => {
    let sql =`SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.promise().query(sql, (error, response) => {
      if (error) throw error;
      let employeeNamesArray = [];
      response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      let sql =`SELECT role.id, role.title FROM role`;
      connection.promise().query(sql, (error, response) => {
        if (error) throw error;
        let rolesArray = [];
        response.forEach((role) => {rolesArray.push(role.title);});

        inquirer
          .prompt([
            {
              name: 'chosenEmployee',
              type: 'list',
              message: 'Select employee to change role?',
              choices: employeeNamesArray
            },
            {
              name: 'chosenRole',
              type: 'list',
              message: 'What is the new role?',
              choices: rolesArray
            }
          ])
          .then((answer) => {
            let newTitleId, employeeId;

            response.forEach((role) => {
              if (answer.chosenRole === role.title) {
                newTitleId = role.id;
              }
            });

            response.forEach((employee) => {
              if (
                answer.chosenEmployee ===
                `${employee.first_name} ${employee.last_name}`
              ) {
                employeeId = employee.id;
              }
            });

            let sqls =`UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
            connection.query(
              sqls,
              [newTitleId, employeeId],
              (error) => {
                if (error) throw error;
                console.log((`====================================================================================`));
                console.log((`Employee Role Updated`));
                console.log((`====================================================================================`));
                promptUser();
              }
            );
          });
      });
    });
  };