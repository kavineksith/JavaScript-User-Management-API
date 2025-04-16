const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/database');

class User {
    static tableName = 'users';

    // Find a user by ID
    static async findById(id) {
        const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
        const users = await query(sql, [id]);
        return users.length ? users[0] : null;
    }

    // Find a user by email
    static async findByEmail(email) {
        const sql = `SELECT * FROM ${this.tableName} WHERE email = ?`;
        const users = await query(sql, [email]);
        return users.length ? users[0] : null;
    }

    // Find a user by reset token
    static async findByResetToken(resetToken) {
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const sql = `
      SELECT * FROM ${this.tableName} 
      WHERE password_reset_token = ? 
      AND password_reset_expires > ?
    `;
        const users = await query(sql, [hashedToken, new Date()]);
        return users.length ? users[0] : null;
    }

    // Create a new user
    static async create(userData) {
        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const sql = `
      INSERT INTO ${this.tableName} 
      (username, email, password, role) 
      VALUES (?, ?, ?, ?)
    `;

        const result = await query(sql, [
            userData.username,
            userData.email,
            hashedPassword,
            userData.role || 'user'
        ]);

        return result.insertId;
    }

    // Update a user
    static async update(id, userData) {
        // Build the query dynamically based on what fields are provided
        const fields = [];
        const values = [];

        Object.keys(userData).forEach(key => {
            // Skip password - it should be updated via dedicated methods
            if (key !== 'password' && key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(userData[key]);
            }
        });

        if (fields.length === 0) return null;

        // Add ID to values array
        values.push(id);

        const sql = `
      UPDATE ${this.tableName} 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `;

        const result = await query(sql, values);
        return result.affectedRows > 0;
    }

    // Delete a user
    static async delete(id) {
        const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }

    // Get all users with pagination
    static async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const sql = `
      SELECT id, username, email, role, created_at, is_active 
      FROM ${this.tableName} 
      LIMIT ? OFFSET ?
    `;

        return await query(sql, [limit, offset]);
    }

    // Create password reset token
    static async createPasswordResetToken(userId) {
        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Token expires in 10 minutes
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const sql = `
      UPDATE ${this.tableName} 
      SET password_reset_token = ?, 
          password_reset_expires = ? 
      WHERE id = ?
    `;

        await query(sql, [hashedToken, expiresAt, userId]);

        return resetToken;
    }

    // Reset password
    static async resetPassword(userId, password) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = `
      UPDATE ${this.tableName} 
      SET password = ?,
          password_reset_token = NULL,
          password_reset_expires = NULL,
          password_changed_at = ?
      WHERE id = ?
    `;

        await query(sql, [hashedPassword, new Date(), userId]);
        return true;
    }

    // Change password
    static async changePassword(userId, password) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = `
      UPDATE ${this.tableName} 
      SET password = ?,
          password_changed_at = ?
      WHERE id = ?
    `;

        await query(sql, [hashedPassword, new Date(), userId]);
        return true;
    }

    // Compare passwords
    static async correctPassword(candidatePassword, userPassword) {
        return await bcrypt.compare(candidatePassword, userPassword);
    }
}

module.exports = User;