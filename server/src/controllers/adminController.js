const bcrypt = require('bcryptjs');
const User = require('../models/User');
const db = require('../config/database');

// Get all admins with pagination
const getAdmins = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get total count
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE role IN ("admin", "super_admin")'
    );
    const totalItems = countResult[0].total;

    // Get paginated data
    const [users] = await db.query(
      'SELECT id, username, full_name, role FROM users WHERE role IN ("admin", "super_admin") ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: users,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get single admin
const getAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin tidak ditemukan' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Create new admin
const createAdmin = async (req, res) => {
  const { username, password, full_name } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const userId = await User.create({
      username,
      password: hashedPassword,
      full_name,
      role: 'admin'
    });

    res.status(201).json({
      message: 'Admin berhasil ditambahkan',
      userId
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  const { full_name, password } = req.body;
  const adminId = req.params.id;

  try {
    let updateQuery = 'UPDATE users SET full_name = ?';
    let params = [full_name];

    // If password is provided, hash it and include in update
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ? AND role = "admin"';
    params.push(adminId);

    const [result] = await db.query(updateQuery, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Admin tidak ditemukan' });
    }

    res.json({ message: 'Admin berhasil diperbarui' });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM users WHERE id = ? AND role = "admin"',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Admin tidak ditemukan' });
    }

    res.json({ message: 'Admin berhasil dihapus' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = {
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin
};