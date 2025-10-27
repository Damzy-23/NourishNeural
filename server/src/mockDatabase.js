// Mock database for user management
// In a real app, this would be replaced with a proper database like MongoDB, PostgreSQL, etc.

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.initializeDefaultUsers();
  }

  // Initialize with some default users for testing
  initializeDefaultUsers() {
    // Add a default test user
    this.users.set('john.doe@example.com', {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123', // In real app, this would be hashed
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
      isVerified: true,
      role: 'user',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lastLoginAt: new Date().toISOString()
    });
  }

  // User management methods
  createUser(userData) {
    const { email, password, firstName, lastName, age } = userData;
    
    // Check if user already exists
    if (this.users.has(email)) {
      throw new Error('User with this email already exists');
    }

    const userId = `user-${Date.now()}`;
    const newUser = {
      id: userId,
      firstName,
      lastName,
      email,
      age: age || null,
      password, // In real app, hash this password
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=random`,
      isVerified: true,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    this.users.set(email, newUser);
    return newUser;
  }

  getUserByEmail(email) {
    return this.users.get(email) || null;
  }

  getUserById(id) {
    for (let user of this.users.values()) {
      if (user.id === id) {
        return user;
      }
    }
    return null;
  }

  updateUser(email, updateData) {
    const user = this.users.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...user,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.users.set(email, updatedUser);
    return updatedUser;
  }

  deleteUser(email) {
    return this.users.delete(email);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  // Session management methods
  createSession(userId, token) {
    this.sessions.set(token, {
      userId,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    });
  }

  getSession(token) {
    const session = this.sessions.get(token);
    if (session) {
      session.lastAccessedAt = new Date().toISOString();
    }
    return session;
  }

  deleteSession(token) {
    return this.sessions.delete(token);
  }

  // Authentication methods
  authenticateUser(email, password) {
    const user = this.users.get(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In real app, compare hashed passwords
    if (user.password !== password) {
      throw new Error('Invalid email or password');
    }

    return user;
  }

  // Utility methods
  isEmailUnique(email) {
    return !this.users.has(email);
  }

  generateToken() {
    return `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create a singleton instance
const mockDB = new MockDatabase();

module.exports = mockDB;
