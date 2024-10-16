import { getConnection } from '@/lib/db';

export async function authenticateUser(username: string, password: string) {

    
    
    
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM LoginInfo WHERE Login = ? AND Password = ?',
        [username, password]
      );
  
      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0] as any; // Type assertion, consider creating a User interface
        // Don't return the password to the client
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }
  
  export async function getUserById(userId: string) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM LoginInfo WHERE id = ?',
        [userId]
      );
  
      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0] as any;
        // Don't return the password to the client
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }
  