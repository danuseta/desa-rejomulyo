// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../utils/jwtUtils');
const User = require('../models/User');  // Tambahkan ini

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    const [users] = await db.query(
      'SELECT id, username, password, full_name, role FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login berhasil',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const register = async (req, res) => {
  const { username, password, full_name, role } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, full_name, role]
    );

    res.status(201).json({
      message: 'User berhasil dibuat',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, full_name, role FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!users.length) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { username, full_name } = req.body;
  
    try {
      // Check if username already exists for other users
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
  
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }
  
      // Update user profile
      await db.query(
        'UPDATE users SET username = ?, full_name = ? WHERE id = ?',
        [username, full_name, userId]
      );
  
      // Get updated user data
      const [users] = await db.query(
        'SELECT id, username, full_name, role FROM users WHERE id = ?',
        [userId]
      );
  
      res.json(users[0]);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  };
  
  const updatePassword = async (req, res) => {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;
  
    try {
      // Get current user with password
      const [users] = await db.query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );
  
      if (users.length === 0) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
  
      // Verify current password
      const isPasswordValid = await bcrypt.compare(current_password, users[0].password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Password saat ini tidak valid' });
      }
  
      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10);
  
      // Update password
      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
  
      res.json({ message: 'Password berhasil diperbarui' });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
  };

module.exports = {
  login,
  register,
  getMe,
    updateProfile,
    updatePassword
};