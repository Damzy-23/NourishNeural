/**
 * Loyalty Service
 * Handles loyalty program management and card storage
 */

// In-memory storage for loyalty accounts (replace with database in production)
const loyaltyAccounts = new Map(); // userId -> Array of accounts

// Available UK loyalty programs
const LOYALTY_PROGRAMS = [
  {
    id: 'clubcard',
    name: 'Tesco Clubcard',
    store: 'Tesco',
    color: '#00539F',
    icon: 'tesco',
    description: 'Earn points on every shop and get exclusive prices',
    pointsPerPound: 1,
    requirements: 'Card number (19 digits)'
  },
  {
    id: 'nectar',
    name: 'Nectar',
    store: "Sainsbury's",
    color: '#7B2D8E',
    icon: 'sainsburys',
    description: 'Collect points at Sainsbury\'s, Argos, and partners',
    pointsPerPound: 1,
    requirements: 'Card number (11 digits)'
  },
  {
    id: 'morrisons-more',
    name: 'More Card',
    store: 'Morrisons',
    color: '#00A550',
    icon: 'morrisons',
    description: 'Get personalized offers and save money',
    pointsPerPound: 5,
    requirements: 'Card number (16 digits)'
  },
  {
    id: 'my-waitrose',
    name: 'myWaitrose',
    store: 'Waitrose',
    color: '#5A5A5A',
    icon: 'waitrose',
    description: 'Free coffee and exclusive member offers',
    pointsPerPound: 0,
    requirements: 'Card number (13 digits)'
  },
  {
    id: 'lidl-plus',
    name: 'Lidl Plus',
    store: 'Lidl',
    color: '#0050AA',
    icon: 'lidl',
    description: 'Digital coupons and money-off offers',
    pointsPerPound: 0,
    requirements: 'Phone number linked to app'
  },
  {
    id: 'aldi-app',
    name: 'Aldi App',
    store: 'Aldi',
    color: '#00205B',
    icon: 'aldi',
    description: 'In-app special buys and offers',
    pointsPerPound: 0,
    requirements: 'Phone number linked to app'
  },
  {
    id: 'asda-rewards',
    name: 'Asda Rewards',
    store: 'Asda',
    color: '#78BE20',
    icon: 'asda',
    description: 'Cashpot rewards on selected items',
    pointsPerPound: 0,
    requirements: 'Phone number or email'
  },
  {
    id: 'coop-membership',
    name: 'Co-op Membership',
    store: 'Co-op',
    color: '#00B1EB',
    icon: 'coop',
    description: '2p for every £1 spent + 2p for local causes',
    pointsPerPound: 2,
    requirements: 'Membership number (8 digits)'
  },
  {
    id: 'boots-advantage',
    name: 'Boots Advantage Card',
    store: 'Boots',
    color: '#0F4C8A',
    icon: 'boots',
    description: '4 points per £1 spent',
    pointsPerPound: 4,
    requirements: 'Card number (13 digits)'
  },
  {
    id: 'iceland-bonus',
    name: 'Iceland Bonus Card',
    store: 'Iceland',
    color: '#EC1C24',
    icon: 'iceland',
    description: 'Save £1 for every £20 spent',
    pointsPerPound: 5,
    requirements: 'Card number (16 digits)'
  }
];

/**
 * Get all available loyalty programs
 * @returns {Array} - List of loyalty programs
 */
function getPrograms() {
  return LOYALTY_PROGRAMS;
}

/**
 * Get a specific loyalty program by ID
 * @param {string} programId - Program ID
 * @returns {Object|null} - Program object or null
 */
function getProgramById(programId) {
  return LOYALTY_PROGRAMS.find(p => p.id === programId) || null;
}

/**
 * Mask card number for display
 * @param {string} cardNumber - Full card number
 * @returns {string} - Masked card number
 */
function maskCardNumber(cardNumber) {
  if (!cardNumber || cardNumber.length < 4) return '****';
  return '•'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);
}

/**
 * Validate card number format
 * @param {string} programId - Program ID
 * @param {string} cardNumber - Card number to validate
 * @returns {{ valid: boolean, message?: string }}
 */
function validateCardNumber(programId, cardNumber) {
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');

  switch (programId) {
    case 'clubcard':
      if (!/^\d{19}$/.test(cleanNumber)) {
        return { valid: false, message: 'Clubcard number must be 19 digits' };
      }
      break;
    case 'nectar':
      if (!/^\d{11}$/.test(cleanNumber)) {
        return { valid: false, message: 'Nectar card number must be 11 digits' };
      }
      break;
    case 'morrisons-more':
    case 'iceland-bonus':
      if (!/^\d{16}$/.test(cleanNumber)) {
        return { valid: false, message: 'Card number must be 16 digits' };
      }
      break;
    case 'my-waitrose':
    case 'boots-advantage':
      if (!/^\d{13}$/.test(cleanNumber)) {
        return { valid: false, message: 'Card number must be 13 digits' };
      }
      break;
    case 'coop-membership':
      if (!/^\d{8}$/.test(cleanNumber)) {
        return { valid: false, message: 'Membership number must be 8 digits' };
      }
      break;
    case 'lidl-plus':
    case 'aldi-app':
    case 'asda-rewards':
      // These use phone numbers or emails, more flexible validation
      if (cleanNumber.length < 5) {
        return { valid: false, message: 'Please enter a valid identifier' };
      }
      break;
    default:
      // For unknown programs, just check length
      if (cleanNumber.length < 4) {
        return { valid: false, message: 'Card number is too short' };
      }
  }

  return { valid: true };
}

/**
 * Get user's loyalty accounts
 * @param {string} userId - User ID
 * @returns {Array} - List of loyalty accounts
 */
function getAccounts(userId) {
  const accounts = loyaltyAccounts.get(userId) || [];

  // Add program details and mask card numbers
  return accounts.map(account => ({
    ...account,
    program: getProgramById(account.programId),
    maskedCardNumber: maskCardNumber(account.cardNumber)
  }));
}

/**
 * Add a loyalty account
 * @param {string} userId - User ID
 * @param {string} programId - Program ID
 * @param {string} cardNumber - Card number
 * @returns {{ success: boolean, account?: Object, error?: string }}
 */
function addAccount(userId, programId, cardNumber) {
  const program = getProgramById(programId);

  if (!program) {
    return { success: false, error: 'Unknown loyalty program' };
  }

  // Validate card number
  const validation = validateCardNumber(programId, cardNumber);
  if (!validation.valid) {
    return { success: false, error: validation.message };
  }

  // Get or create user's accounts
  if (!loyaltyAccounts.has(userId)) {
    loyaltyAccounts.set(userId, []);
  }

  const userAccounts = loyaltyAccounts.get(userId);

  // Check for duplicate
  const existing = userAccounts.find(a => a.programId === programId);
  if (existing) {
    return { success: false, error: 'You already have this loyalty card linked' };
  }

  // Create new account
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  const account = {
    id: `loyalty_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    programId,
    cardNumber: cleanNumber,
    isLinked: true,
    linkedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  userAccounts.push(account);

  return {
    success: true,
    account: {
      ...account,
      program,
      maskedCardNumber: maskCardNumber(cleanNumber)
    }
  };
}

/**
 * Remove a loyalty account
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @returns {{ success: boolean, error?: string }}
 */
function removeAccount(userId, accountId) {
  if (!loyaltyAccounts.has(userId)) {
    return { success: false, error: 'Account not found' };
  }

  const userAccounts = loyaltyAccounts.get(userId);
  const index = userAccounts.findIndex(a => a.id === accountId);

  if (index === -1) {
    return { success: false, error: 'Account not found' };
  }

  userAccounts.splice(index, 1);
  return { success: true };
}

/**
 * Update a loyalty account
 * @param {string} userId - User ID
 * @param {string} accountId - Account ID
 * @param {Object} updates - Updates to apply
 * @returns {{ success: boolean, account?: Object, error?: string }}
 */
function updateAccount(userId, accountId, updates) {
  if (!loyaltyAccounts.has(userId)) {
    return { success: false, error: 'Account not found' };
  }

  const userAccounts = loyaltyAccounts.get(userId);
  const account = userAccounts.find(a => a.id === accountId);

  if (!account) {
    return { success: false, error: 'Account not found' };
  }

  // If updating card number, validate it
  if (updates.cardNumber) {
    const validation = validateCardNumber(account.programId, updates.cardNumber);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }
    account.cardNumber = updates.cardNumber.replace(/[\s-]/g, '');
  }

  account.updatedAt = new Date().toISOString();

  return {
    success: true,
    account: {
      ...account,
      program: getProgramById(account.programId),
      maskedCardNumber: maskCardNumber(account.cardNumber)
    }
  };
}

/**
 * Get user's loyalty programs by store
 * @param {string} userId - User ID
 * @param {string} storeName - Store name
 * @returns {Object|null} - Loyalty account or null
 */
function getAccountByStore(userId, storeName) {
  const accounts = getAccounts(userId);
  return accounts.find(a =>
    a.program?.store.toLowerCase() === storeName.toLowerCase()
  ) || null;
}

module.exports = {
  getPrograms,
  getProgramById,
  getAccounts,
  addAccount,
  removeAccount,
  updateAccount,
  getAccountByStore,
  validateCardNumber,
  maskCardNumber,
  LOYALTY_PROGRAMS
};
