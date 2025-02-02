const db = require('../config/database');

class Template {
    static async findById(id) {
        const [templates] = await db.query(
          'SELECT * FROM letter_templates WHERE id = ? AND deleted_at IS NULL',
          [id]
        );
        return templates[0];
      }

      static async findAll() {
        const [templates] = await db.query(
          'SELECT * FROM letter_templates WHERE deleted_at IS NULL ORDER BY name ASC'
        );
        return templates;
      }

  static async create(templateData) {
    const { 
      name,
      content,
      header_content,
      use_logo,
      logo_path,
      logo_public_id,
      template_path,
      template_type
    } = templateData;

    const [result] = await db.query(
      `INSERT INTO letter_templates (
        name,
        content,
        header_content,
        use_logo,
        logo_path,
        logo_public_id,
        template_path,
        template_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        content || '',
        header_content || '',
        use_logo || false,
        logo_path,
        logo_public_id,
        template_path,
        template_type || 'text'
      ]
    );
    return result.insertId;
  }

// Di Template.js, hapus duplicated update method dan gunakan versi lengkap
static async update(id, templateData) {
    const {
      name,
      content,
      header_content,
      use_logo,
      logo_path,
      logo_public_id,
      template_path,
      template_public_id,
      template_type
    } = templateData;

    const [result] = await db.query(
      `UPDATE letter_templates 
       SET name = ?, 
           content = ?, 
           header_content = ?,
           use_logo = ?,
           logo_path = ?,
           logo_public_id = ?,
           template_path = ?,
           template_public_id = ?,
           template_type = ?
       WHERE id = ?`,
      [
        name,
        content,
        header_content,
        use_logo || false,
        logo_path,
        logo_public_id,
        template_path,
        template_public_id,
        template_type || 'text',
        id
      ]
    );
    return result.affectedRows > 0;
}

  static async softDelete(id) {
    const [result] = await db.query(
      'UPDATE letter_templates SET deleted_at = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Di Template.js, tambahkan method baru:
static async findAllPaginated(page = 1, limit = 10) {
    // Get total count
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM letter_templates WHERE deleted_at IS NULL'
    );
    const total = countResult[0].total;
  
    // Calculate offset
    const offset = (page - 1) * limit;
  
    // Get paginated data
    const [templates] = await db.query(
      `SELECT * FROM letter_templates 
       WHERE deleted_at IS NULL 
       ORDER BY updated_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
  
    return {
      data: templates,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: page,
        pageSize: limit
      }
    };
  }

  static async countLettersUsingTemplate(id) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM letters WHERE template_id = ?',
      [id]
    );
    return rows[0].count;
  }

  static async isTemplateUsed(id) {
    const count = await this.countLettersUsingTemplate(id);
    return count > 0;
  }

  static async getUsageStats() {
    const [stats] = await db.query(`
      SELECT 
        t.id,
        t.name,
        COUNT(l.id) as usage_count,
        MAX(l.created_at) as last_used
      FROM letter_templates t
      LEFT JOIN letters l ON t.id = l.template_id
      GROUP BY t.id, t.name
      ORDER BY usage_count DESC
    `);
    return stats;
  }

  static async search(keyword) {
    const [templates] = await db.query(
      `SELECT * FROM letter_templates 
       WHERE name LIKE ? OR content LIKE ? 
       ORDER BY name ASC`,
      [`%${keyword}%`, `%${keyword}%`]
    );
    return templates;
  }

  static async getRecentlyUsed(limit = 5) {
    const [templates] = await db.query(`
      SELECT 
        t.*,
        COUNT(l.id) as usage_count,
        MAX(l.created_at) as last_used
      FROM letter_templates t
      LEFT JOIN letters l ON t.id = l.template_id
      GROUP BY t.id
      HAVING usage_count > 0
      ORDER BY last_used DESC
      LIMIT ?
    `, [limit]);
    return templates;
  }

  static async getMostUsed(limit = 5) {
    const [templates] = await db.query(`
      SELECT 
        t.*,
        COUNT(l.id) as usage_count
      FROM letter_templates t
      LEFT JOIN letters l ON t.id = l.template_id
      GROUP BY t.id
      HAVING usage_count > 0
      ORDER BY usage_count DESC
      LIMIT ?
    `, [limit]);
    return templates;
  }

  static async updateLastUsed(id) {
    await db.query(
      'UPDATE letter_templates SET last_used = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  static async getTemplateWithFiles(id) {
    const [templates] = await db.query(
      `SELECT 
        t.*,
        COALESCE(COUNT(l.id), 0) as usage_count,
        MAX(l.created_at) as last_used
       FROM letter_templates t
       LEFT JOIN letters l ON t.id = l.template_id
       WHERE t.id = ?
       GROUP BY t.id`,
      [id]
    );
    return templates[0];
  }
}

module.exports = Template;