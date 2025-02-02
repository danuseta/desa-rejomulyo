const db = require('../config/database');

class VillageInfo {
  static async findOne() {
    const [rows] = await db.query('SELECT * FROM village_info LIMIT 1');
    return rows[0];
  }

  static async update(data) {
    const {
      village_name,
      district_name,
      regency_name,
      address,
      phone,
      email,
      head_name,
      head_position,
      signature_path
    } = data;

    // Cek apakah sudah ada data
    const current = await this.findOne();
    
    if (current) {
      // Update existing record
      const [result] = await db.query(
        `UPDATE village_info 
         SET village_name = ?, 
             district_name = ?,
             regency_name = ?,
             address = ?,
             phone = ?,
             email = ?,
             head_name = ?,
             head_position = ?,
             signature_path = COALESCE(?, signature_path)
         WHERE id = ?`,
        [
          village_name,
          district_name,
          regency_name,
          address,
          phone,
          email,
          head_name,
          head_position,
          signature_path,
          current.id
        ]
      );
      return result.affectedRows > 0;
    } else {
      // Insert new record
      const [result] = await db.query(
        `INSERT INTO village_info (
          village_name,
          district_name,
          regency_name,
          address,
          phone,
          email,
          head_name,
          head_position,
          signature_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          village_name,
          district_name,
          regency_name,
          address,
          phone,
          email,
          head_name,
          head_position,
          signature_path || null
        ]
      );
      return result.insertId;
    }
  }
}

module.exports = VillageInfo;