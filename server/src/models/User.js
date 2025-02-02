const db = require('../config/database');

class User {
    static async findByUsername(username) {
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return users[0];
    }

    static async findById(id) {
        const [users] = await db.query(
            'SELECT id, username, full_name, role FROM users WHERE id = ?',
            [id]
        );
        return users[0];
    }

    static async create(userData) {
        const { username, password, full_name, role } = userData;
        const [result] = await db.query(
            'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
            [username, password, full_name, role]
        );
        return result.insertId;
    }
}

module.exports = User;