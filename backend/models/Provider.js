import { dbRun, dbGet, dbAll } from '../database.js';

export class Provider {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM providers WHERE 1=1';
    const params = [];

    if (filters.isAvailable !== undefined) {
      query += ' AND is_available = ?';
      params.push(filters.isAvailable ? 1 : 0);
    }

    if (filters.serviceType) {
      query += ' AND service_types LIKE ?';
      params.push(`%${filters.serviceType}%`);
    }

    return await dbAll(query, params);
  }

  static async findById(id) {
    return await dbGet('SELECT * FROM providers WHERE id = ?', [id]);
  }

  static async updateAvailability(id, isAvailable) {
    await dbRun(
      'UPDATE providers SET is_available = ? WHERE id = ?',
      [isAvailable ? 1 : 0, id]
    );
    return this.findById(id);
  }
}
