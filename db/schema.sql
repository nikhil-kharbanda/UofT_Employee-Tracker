DROP DATABASE IF EXISTS company_records_db;

CREATE DATABASE company_records_db;

USE company_records_db;

CREATE TABLE department(
    dept_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(30) NOT NULL
);

CREATE TABLE roles(
    roles_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    department_id INT NOT NULL,
    salary DECIMAL NOT NULL,
    FOREIGN KEY (department_ID) REFERENCES department(dept_id)
);

CREATE TABLE employee(
    emp_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fName VARCHAR(30) NOT NULL,
    lName VARCHAR(30) NOT NULL,
    role_id INT,
    manager VARCHAR(30) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(roles_id)
);