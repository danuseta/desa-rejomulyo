const db = require('../config/database');

class Letter {
  static async create(letterData) {
    const { template_id, nik, full_name, printed_by } = letterData;
    const [result] = await db.query(
      'INSERT INTO letters (template_id, nik, full_name, printed_by) VALUES (?, ?, ?, ?)',
      [template_id, nik, full_name, printed_by]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [letters] = await db.query(
      `SELECT l.*, t.name as template_name, u.full_name as printed_by_name 
       FROM letters l 
       LEFT JOIN letter_templates t ON l.template_id = t.id 
       LEFT JOIN users u ON l.printed_by = u.id 
       WHERE l.id = ?`,
      [id]
    );
    return letters[0];
  }

  static async findByNik(nik) {
    const [letters] = await db.query(
      `SELECT l.*, t.name as template_name, u.full_name as printed_by_name 
       FROM letters l 
       LEFT JOIN letter_templates t ON l.template_id = t.id 
       LEFT JOIN users u ON l.printed_by = u.id 
       WHERE l.nik = ?`,
      [nik]
    );
    return letters;
  }

  static async getHistory(limit = 10, offset = 0) {
    const [letters] = await db.query(
      `SELECT l.*, t.name as template_name, u.full_name as printed_by_name 
       FROM letters l 
       LEFT JOIN letter_templates t ON l.template_id = t.id 
       LEFT JOIN users u ON l.printed_by = u.id 
       WHERE t.deleted_at IS NULL OR t.deleted_at IS NOT NULL
       ORDER BY l.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return letters;
  }
}

module.exports = Letter;