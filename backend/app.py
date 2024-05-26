from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your_secret_key'

CORS(app)
jwt = JWTManager(app)

client = MongoClient('mongodb://localhost:27017/')
db = client['library_db']

users_collection = db['users']
books_collection = db['books']


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data['username']
    password = generate_password_hash(data['password'])
    role = data['role']

    if users_collection.find_one({'username': username}):
        return jsonify({'msg': 'User already exists'}), 400

    users_collection.insert_one({'username': username, 'password': password, 'role': role})
    return jsonify({'msg': 'User created successfully'}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    user = users_collection.find_one({'username': username})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'msg': 'Invalid credentials'}), 401

    access_token = create_access_token(identity={'username': username, 'role': user['role']})
    print(username+ user['role']+ access_token)
    return {'access_token':access_token}, 200


@app.route('/books', methods=['POST'])
@jwt_required()
def add_book():
    identity = get_jwt_identity()
    if identity['role'] != 'LIBRARIAN':
        return jsonify({'msg': 'Permission denied'}), 403

    data = request.get_json()
    books_collection.insert_one(
        {'_id': data['id'], 'title': data['title'], 'author': data['author'], 'status': 'AVAILABLE'})
    return jsonify({'msg': 'Book added successfully'}), 201


@app.route('/books/<book_id>', methods=['PUT'])
@jwt_required()
def update_book(book_id):
    identity = get_jwt_identity()
    if identity['role'] != 'LIBRARIAN':
        return jsonify({'msg': 'Permission denied'}), 403

    data = request.get_json()
    books_collection.update_one({'_id': book_id}, {'$set': data})
    return jsonify({'msg': 'Book updated successfully'}), 200


@app.route('/books/<book_id>', methods=['DELETE'])
@jwt_required()
def delete_book(book_id):
    identity = get_jwt_identity()
    if identity['role'] != 'LIBRARIAN':
        return jsonify({'msg': 'Permission denied'}), 403

    books_collection.delete_one({'_id': book_id})
    return jsonify({'msg': 'Book deleted successfully'}), 200


@app.route('/books', methods=['GET'])
@jwt_required()
def get_books():
    books = list(books_collection.find())
    for book in books:
        book['_id'] = str(book['_id'])
    print(books)
    return jsonify(books), 200


@app.route('/borrow/<book_id>', methods=['POST'])
@jwt_required()
def borrow_book(book_id):
    identity = get_jwt_identity()
    if identity['role'] != 'MEMBER':
        return jsonify({'msg': 'Permission denied'}), 403

    book = books_collection.find_one({'_id': book_id})

    if book['status'] == 'BORROWED':
        return jsonify({'msg': 'Book already borrowed'}), 400

    books_collection.update_one({'_id': book_id}, {'$set': {'status': 'BORROWED'}})
    return jsonify({'msg': 'Book borrowed successfully'}), 200


@app.route('/return/<book_id>', methods=['POST'])
@jwt_required()
def return_book(book_id):
    identity = get_jwt_identity()
    if identity['role'] != 'MEMBER':
        return jsonify({'msg': 'Permission denied'}), 403

    books_collection.update_one({'_id': book_id}, {'$set': {'status': 'AVAILABLE'}})
    return jsonify({'msg': 'Book returned successfully'}), 200


# Additional endpoints for managing members by librarian
@app.route('/members/<username>', methods=['PUT'])
@jwt_required()
def update_member(username):
    identity = get_jwt_identity()
    if identity['role'] != 'LIBRARIAN':
        return jsonify({'msg': 'Permission denied'}), 403

    data = request.get_json()
    new_password = generate_password_hash(data['password'])

    users_collection.update_one({'username': username}, {'$set': {'password': new_password}})
    return jsonify({'msg': 'Member updated successfully'}), 200


@app.route('/members/<username>', methods=['DELETE'])
@jwt_required()
def delete_member(username):
    identity = get_jwt_identity()
    if identity['role'] != 'LIBRARIAN' and identity['username'] != username:
        return jsonify({'msg': 'Permission denied'}), 403

    users_collection.delete_one({'username': username})
    return jsonify({'msg': 'Member deleted successfully'}), 200


@app.route('/members/deleted/<username>', methods=['DELETE'])
@jwt_required()
def delete_account(username):
    users_collection.delete_one({'username': username})
    return jsonify({'msg': 'Account deleted successfully'}), 200


@app.route('/members', methods=['GET'])
@jwt_required()
def get_member():
    members = list(users_collection.find())
    for member in members:
        member['_id'] = str(member['_id'])
    print(members)
    return jsonify(members), 200


if __name__ == '__main__':
    app.run(debug=True)
