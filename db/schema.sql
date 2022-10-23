DROP DATABASE IF EXISTS employees;
CREATE DATABASE employees;
USE employees;

CREATE TABLE department (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(40) NOT NULL
);

CREATE TABLE [role] (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(40) NOT NULL,
    department_id INTEGER
    salary DECIMAL(10, 2) NOT NULL,
);

CREATE TABLE employee(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(40) NOT NULL,
    role_id INTEGER,
    last_name VARCHAR(40) NOT NULL,
    manager_id INTEGER
);




    