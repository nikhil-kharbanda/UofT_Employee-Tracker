DROP DATABASE IF EXISTS company_records_db;
CREATE DATABASE company_records_db;

USE company_records_db;

CREATE TABLE department(
	id INT NOT NULL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE roles(
	id INT NOT NULL PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_ID INT NOT NULL,
    FOREIGN KEY (department_ID) REFERENCES department(id)
);

CREATE TABLE employee(
	id INT NOT NULL PRIMARY KEY,
    fName VARCHAR(30) NOT NULL,
    lName VARCHAR(30) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);