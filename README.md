A basic Library Management system.

Tech Stack:-
Backend- Flask, 
Database- MongoDB, 
Frontend- HTML,Javascript

It is a single page HTML Application

Installation procedures in your local machine:-

1. git clone
2. create a databse library_db in mongoDB shell by using command "use library_db"
3. in terminal enter the backend folder "cd backend"
4. python -m venv venv
5. venv\scripts\activate
6. pyhton app.py
7. Development server will start
8. now open the index.html file in any browser


Database organization:-

Database name- libaray_db ( it contains 2 collections)
1. users (_id,username,password,role) [ deals with the users in the system and their roles as either member or librarian]
2. books (id,title,author,status) [deals with the books and their availability ststus in the system]

