INSERT INTO department (name)
VALUES
    ("Design"),
    ("Playtesting"),
    ("Marketing"),
    ("Production");

INSERT INTO role (title, salary, department_id)
VALUES
    ("Design Lead", 50000 , 1),
    ("Designer", 40000, 1),
    ("Playtest Lead", 45000, 2),
    ("Playtester", 35000, 2),
    ("Social Media Organizer", 42000, 3),
    ("Production Networker", 45000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Kyle", "Davis", 1, NULL),
    ("Ellen", "Murphy", 2, 1),
    ("Steve", "Kind", 2, 1),
    ("Page", "Wilson", 3, NULL),
    ("Greg", "Tutor", 4, 3),
    ("Cindy", "Shoe", 4, 3),
    ("Mark", "Lamar", 5, NULL),
    ("Betty", "Bronson", 6, NULL);