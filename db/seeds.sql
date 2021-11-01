INSERT INTO department (dept_name)
VALUES
    ("Engineering"),
    ("Maths"),
    ("Science");
    
INSERT INTO roles (title, department_id, salary)
VALUES
	("Systems","1","7778"),
    ("Software", "1","112"),
    ("Stats","2","123"),
    ("Chem","3","1114");
    
INSERT INTO employee (fName, lName, role_id, manager)
VALUES 
	("Nick","Khar","1","none"),
    ("Bob","McFace","2","Nick"),
    ("Mike","Kat","3","none"),
    ("Simon","Snowman","4","Mike");