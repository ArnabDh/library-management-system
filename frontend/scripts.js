const BASE_URL = 'http://localhost:5000';
let accessToken='';
async function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    });
    const result = await response.json();
    alert(result.msg);
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const result = await response.json();

    if (response.status === 200) {
        accessToken = result.access_token;
        alert('Login successful');
        showDashboard();
    } else {
        alert(result.msg);
    }
}

function showDashboard() {
    const decoded = JSON.parse(atob(accessToken.split('.')[1])).sub;
  // const decoded= parseJwt(accessToken)
    const role = decoded.role;
    //const base64Payload = accessToken.split(".")[1];
  //const payloadBuffer = Buffer.from(base64Payload, "base64");
  //return JSON.parse(payloadBuffer.toString());
    //document.getElementById("demo").innerHTML = String(role);
    //document.getElementById("demo1").innerHTML = decoded;
    //document.getElementById("demo2").innerHTML = accessToken;

    if (role === 'LIBRARIAN') {
        document.getElementById('librarian-section').style.display = 'block';
        document.getElementById('member-section').style.display = 'none';
        //$("#member-section").hide();
        //hide(document.getElementById('member-section'));
    }  if (role === 'MEMBER') {
        document.getElementById('member-section').style.display = 'block';
        document.getElementById('librarian-section').style.display = 'none';
        //$("#librarian-section").hide();
        //hide(document.getElementById('librarian-section'));
        loadBooks();
    }

    document.getElementById('auth-section').style.display = 'none';
}

async function addBook() {
    const id = document.getElementById('book-Id').value;
    const title = document.getElementById('book-title').value;
    const author = document.getElementById('book-author').value;

    const response = await fetch(`${BASE_URL}/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ id, title, author })
    });
    const result = await response.json();
    alert(result.msg);
}

async function loadBooks() {
    const response = await fetch(`${BASE_URL}/books`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const books = await response.json();
    const bookList = document.getElementById('books');
    bookList.innerHTML = '';
    books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book._id} ${book.title} by ${book.author} - ${book.status}`;
        bookList.appendChild(li);
    });
}

async function loadBooksForLibrarian() {
    const response = await fetch(`${BASE_URL}/books`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const books = await response.json();
    const bookList = document.getElementById('booksInLibrary');
    bookList.innerHTML = '';
    books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book._id} ${book.title} by ${book.author} - ${book.status}`;
        bookList.appendChild(li);
    });
}

async function showMember() {
    const response= await fetch(`${BASE_URL}/members`, {
    method: 'GET',
    headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const members = await response.json();
    const memberList = document.getElementById('members');
    memberList.innerHTML = '';
    members.forEach(member => {
        const li = document.createElement('li');
        li.textContent = `${member.username} - ${member.role} `;
        memberList.appendChild(li);
    });
}

async function updateBook() {
    const bookId = prompt("Enter the book ID to update:");
    const title = prompt("Enter the book title");
    const author = prompt("Enter the book author");

    const response = await fetch(`${BASE_URL}/books/${bookId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({  title, author })
    });
    const result = await response.json();
    alert(result.msg);
}

async function deleteBook() {
    const bookId = prompt("Enter the book ID to delete:");

    const response = await fetch(`${BASE_URL}/books/${bookId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const result = await response.json();
    alert(result.msg);
}

async function borrowBook() {
    const bookId = prompt("Enter the book ID to borrow:");

    const response = await fetch(`${BASE_URL}/borrow/${bookId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const result = await response.json();
    alert(result.msg);
    loadBooks(); // Refresh the book list
}

async function returnBook() {
    const bookId = prompt("Enter the book ID to return:");

    const response = await fetch(`${BASE_URL}/return/${bookId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const result = await response.json();
    alert(result.msg);
    loadBooks(); // Refresh the book list
}

async function deleteAccount() {
    const confirmation = confirm("Are you sure you want to delete your account?");
    if (!confirmation) return;

    const decoded = JSON.parse(atob(accessToken.split('.')[1])).sub;
    const username = decoded.username;

    const response = await fetch(`${BASE_URL}/members/deleted/${username}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const result = await response.json();
    alert(result.msg);
    if (response.status === 200) {
        // Logout the user
        accessToken = '';
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('librarian-section').style.display = 'none';
        document.getElementById('member-section').style.display = 'none';
    }
}

// Librarian functions for managing members
async function addMember() {
    const username = prompt("Enter the member's username:");
    const password = prompt("Enter the member's password:");

    const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ username, password, role: 'MEMBER' })
    });
    const result = await response.json();
    alert(result.msg);
}

async function updateMember() {
    const username = prompt("Enter the member's username to update:");
    const newPassword = prompt("Enter the new password:");

    const response = await fetch(`${BASE_URL}/members/${username}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ password: newPassword })
    });
    const result = await response.json();
    alert(result.msg);
}

async function deleteMember() {
    const username = prompt("Enter the member's username to delete:");

    const response = await fetch(`${BASE_URL}/members/${username}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const result = await response.json();
    alert(result.msg);
}

