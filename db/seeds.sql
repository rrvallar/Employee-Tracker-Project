INSERT INTO department(department_name)
VALUES("Engineering"), ("Sales"), ("Maintainence"), ("Assistance"), ("Marketing");

INSERT INTO role(title, salary, department_id)
VALUES("Engineer", 55000, 1), ("Saleman", 165000, 1), ("Consultant", 370000, 3), ("Operator", 320000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('John', 'Smith', 1, 2), ('Will', 'Charmer', 1, null), ('Lebron', 'Jane', 1, 2), ('Jimmy', 'Charter', 2, 2), ('Bin', 'Lunz', 4, null);

