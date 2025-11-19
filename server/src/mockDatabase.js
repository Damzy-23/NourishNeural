// Mock database for user management
// In a real app, this would be replaced with a proper database like MongoDB, PostgreSQL, etc.

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// File path for persisting data
const DATA_FILE = path.join(__dirname, '..', 'data', 'users.json');

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.initialized = false;
    this.initPromise = this.initializeDefaultUsers();
  }

  // Save users to file for persistence
  saveToFile() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Convert Map to array for JSON serialization
      const usersArray = Array.from(this.users.entries());
      fs.writeFileSync(DATA_FILE, JSON.stringify(usersArray, null, 2));
      console.log('Mock database saved to file');
    } catch (error) {
      console.error('Error saving mock database to file:', error);
    }
  }

  // Load users from file
  loadFromFile() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const usersArray = JSON.parse(data);
        this.users = new Map(usersArray);
        console.log('Mock database loaded from file:', this.users.size, 'users');
        return true;
      }
    } catch (error) {
      console.error('Error loading mock database from file:', error);
    }
    return false;
  }

  // Initialize with some default users for testing
  async initializeDefaultUsers() {
    if (this.initialized) return;

    // Try to load existing data from file first
    const loadedFromFile = this.loadFromFile();

    if (!loadedFromFile) {
      // Add a default test user with hashed password only if no file exists
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
      // Save initial data to file
      this.saveToFile();
    }

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
      phone: null,
      address: null,
      city: null,
      postalCode: null,
      country: null,
      password: hashedPassword, // Now properly hashed with bcrypt
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(lastName)}&background=random`,
      isVerified: true,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    this.users.set(email, newUser);
    this.saveToFile(); // Persist to file
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
    this.saveToFile(); // Persist to file
    return updatedUser;
  }

  async updateUserById(id, updateData) {
    await this.ensureInitialized();

    // Find user by ID
    let userEmail = null;
    for (let [email, user] of this.users.entries()) {
      if (user.id === id) {
        userEmail = email;
        break;
      }
    }

    if (!userEmail) {
      throw new Error('User not found');
    }

    const user = this.users.get(userEmail);

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // If email is being updated, we need to move the user to a new key
    const newEmail = updateData.email || userEmail;

    const updatedUser = {
      ...user,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // If email changed, delete old entry and create new one
    if (newEmail !== userEmail) {
      this.users.delete(userEmail);
    }

    this.users.set(newEmail, updatedUser);
    this.saveToFile(); // Persist to file
    return updatedUser;
  }

  deleteUser(email) {
    const result = this.users.delete(email);
    if (result) {
      this.saveToFile(); // Persist to file
    }
    return result;
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
