// src/utils/dbSeed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedSuperAdmin = async () => {
  try {
    // Check if super_admin already exists
    const [existingAdmin] = await db.query(
      'SELECT * FROM users WHERE role = "super_admin" LIMIT 1'
    );

    if (existingAdmin.length > 0) {
      console.log('Super admin already exists!');
      return;
    }

    // Create super admin
    const password = 'superadmin123'; // Default password
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
      ['superadmin', hashedPassword, 'Super Administrator', 'super_admin']
    );

    console.log('Super admin created successfully!');
    console.log('Username: superadmin');
    console.log('Password: superadmin123');

  } catch (error) {
    console.error('Error seeding super admin:', error);
  } finally {
    process.exit(0);
  }
};

// Run the seed
seedSuperAdmin();