// Mock database for user management
// In a real app, this would be replaced with a proper database like MongoDB, PostgreSQL, etc.

const bcrypt = require('bcryptjs');

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.initialized = false;
    this.initPromise = this.initializeDefaultUsers();
  }

  // Initialize with some default users for testing
  async initializeDefaultUsers() {
    if (this.initialized) return;

    // Add a default test user with hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    this.users.set('john.doe@example.com', {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: hashedPassword, // Now properly hashed
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
      isVerified: true,
      role: 'user',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      lastLoginAt: new Date().toISOString()
    });

    this.initialized = true;
  }

  // Ensure initialization is complete before using
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  // User management methods
  async createUser(userData) {
    await this.ensureInitialized();
    const { email, password, firstName, lastName, age } = userData;

    // Check if user already exists
    if (this.users.has(email)) {
      throw new Error('User with this email already exists');
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = `user-${Date.now()}`;
    const newUser = {
      id: userId,
      firstName,
      lastName,
      email,
      age: age || null,
      password: hashedPassword, // Now properly hashed with bcrypt
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

  async updateUser(email, updateData) {
    await this.ensureInitialized();
    const user = this.users.get(email);
    if (!user) {
      throw new Error('User not found');
    }

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
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
  async authenticateUser(email, password) {
    await this.ensureInitialized();
    const user = this.users.get(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Compare hashed passwords using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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
