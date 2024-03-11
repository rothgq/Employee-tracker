const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);

db.connect(err => {
    if (err) throw err;
    promptChoices();
}); 

//Basic function called upon connection, and recalled when a choice is completed.
const promptChoices = () => {
    inquirer.prompt ([
        {
            type: "list",
            name: "choices",
            message: "What would you like to do?",
            choices: [
                "View all Departments",
                "View all Roles",
                "View all Employees",
                "Add a Department",
                "Add a Role",
                "Add an Employee",
                "Update employee role"
            ]
        }
    ])
    //Based on choice, call the query
        .then((answer) => {
            if (answer.choices === "View all Departments") {
                viewAllDepartments();
            }
            if (answer.choices === "View all Roles") {
                viewAllRoles();
            }
            if (answer.choices === "View all Employees") {
                viewAllEmployees();
            }
            if (answer.choices === "Add a Department") {
                addDepartment();
            }
            if (answer.choices === "Add a Role") {
                addRole();
            }
            if (answer.choices === "Add an Employee") {
                addEmployee();
            }
            if (answer.choices === "Update employee role") {
                updateRole();
            }
        })
};

viewAllDepartments = () => {
    db.query(`SELECT * FROM department`, (err, result) => {
        if (err) throw err;
        console.table(result);
        promptChoices();
    })
};

viewAllRoles = () => {
    const sql = `SELECT role.id, role.title, department.name AS department FROM role INNER JOIN department on role.department_id = department.id`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.table(result);
        promptChoices();
    })
};

viewAllEmployees = () => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department,
                CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employee
                LEFT JOIN role on employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.table(result);
        promptChoices();
    })
};

addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "department",
            message: "Enter name of Department being added:",
        }
    ])
    .then(answer => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
        db.query(sql, answer.department, (err, result) => {
            if (err) throw err;
            console.log(answer.department + " added successfully.");

            viewAllDepartments();
        })
    })
};

addRole = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "Enter the name of the role being added:",
        },
        {
            type: "input",
            name: "salary",
            message: "Enter the salary for the role being added:",
        }
    ])
    .then(answer => {
        const values = [answer.title, answer.salary];

        const sql = `SELECT name, id FROM department`;
        db.query(sql, (err, data)=> {
            if (err) throw err;

            const departments = data.map(({name, id}) => ({name: name, value: id}));
            inquirer.prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Select the department of the role being added:",
                    choices: departments
                }
            ])
            .then(answer => {
                const newDepartment = answer.department;
                values.push(newDepartment);

                const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                db.query(sql, values, (err, result) => {
                    if (err) throw err;
                    console.log(answer.role + " added successfully.");

                    viewAllRoles();
                })
            })
        })
    })
};

addEmployee = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "Enter the employee's first name:"
        },
        {
            type: "input",
            name: "lastName",
            message: "Enter the employee's last name:"
        }
    ])
    .then(answer => {
        const values = [answer.firstName, answer.lastName];

        const sql = `SELECT role.id, role.title FROM role`;
        db.query(sql, (err, data) => {
            if (err) throw err;

            const roles = data.map(({id, title}) => ({name: title, value: id}));
            inquirer.prompt([
                {
                    type: "list",
                    name: "role",
                    message: "Select a role for this employee:",
                    choices: roles
                }
            ])
            .then(answer => {
                const newRole = answer.role;
                values.push(newRole);

                const sql = `SELECT * FROM employee`;
                db.query(sql, (err, data) => {
                    if (err) throw err;

                    const managers = data.map(({id, first_name, last_name}) => ({name: first_name + " "+ last_name, value: id}));
                    inquirer.prompt([
                        {
                            type: "list",
                            name: "manager",
                            message: "Assign a manager to new employee:",
                            choices: managers
                        }
                    ])
                    .then(answer => {
                        const newManager = answer.manager;
                        values.push(newManager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
                        db.query(sql, values, (err, result) => {
                            if (err) throw err;
                            console.log("Employee added successfully.");

                            viewAllEmployees();
                        })
                    })
                })
            })
        })
    })
};

updateRole = () => {
    const sql = `SELECT * FROM employee`;
    db.query(sql, (err, data) => {
        if (err) throw err;

        const employees = data.map(({id, first_name, last_name}) => ({name: first_name + " "+ last_name, value: id}));
        inquirer.prompt([
            {
                type: "list",
                name: "employee",
                message: "Select an employee to update:",
                choices: employees
            }
        ])
        .then(answer => {
            const updatedEmployee = answer.employee;
            const values = [];
            values.push(updatedEmployee);

            const sql = `SELECT * FROM role`;
            db.query(sql, (err, data) => {
                if (err) throw err;

                const roles = data.map(({id, title}) => ({name: title, value: id}));
                inquirer.prompt([
                    {
                        type: "list",
                        name: "role",
                        message: "Select a new role:",
                        choices: roles
                    }
                ])
                .then(answer => {
                    const newRole = answer.role;
                    values.push(newRole);

                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                    db.query(sql, values, (err, result) => {
                        if (err) throw err;
                        console.log("Employee's role updated");

                        viewAllEmployees();
                    })
                })
            })
        })
    })
};