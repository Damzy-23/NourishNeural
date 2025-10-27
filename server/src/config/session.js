const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const { db } = require('./database');

function setupSession(app) {
  // Session configuration
  const sessionConfig = {
    store: new pgSession({
      conObject: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'pantrypal',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password'
      },
      tableName: 'sessions'
    }),
    secret: process.env.SESSION_SECRET || 'pantrypal-super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    },
    name: 'pantrypal.sid'
  };

  // Apply session middleware
  app.use(session(sessionConfig));

  // Create sessions table if it doesn't exist
  createSessionsTable();
}

async function createSessionsTable() {
  try {
    const tableExists = await db.schema.hasTable('sessions');
    
    if (!tableExists) {
      await db.schema.createTable('sessions', (table) => {
        table.string('sid').primary();
        table.json('sess').notNull();
        table.timestamp('expire').notNull();
      });
      
      // Create index on expire column for performance
      await db.raw('CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions (expire)');
      
      console.log('✅ Sessions table created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating sessions table:', error.message);
  }
}

module.exports = {
  setupSession
}; 