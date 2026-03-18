/**
 * Loyalty Service
 * Handles loyalty program management and card storage via Supabase
 */

const { supabase } = require('../config/supabase');

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
 */
function getPrograms() {
  return LOYALTY_PROGRAMS;
}

/**
 * Get a specific loyalty program by ID
 */
function getProgramById(programId) {
  return LOYALTY_PROGRAMS.find(p => p.id === programId) || null;
}

/**
 * Mask card number for display
 */
function maskCardNumber(cardNumber) {
  if (!cardNumber || cardNumber.length < 4) return '****';
  return '•'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);
}

/**
 * Validate card number format
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
      if (cleanNumber.length < 5) {
        return { valid: false, message: 'Please enter a valid identifier' };
      }
      break;
    default:
      if (cleanNumber.length < 4) {
        return { valid: false, message: 'Card number is too short' };
      }
  }

  return { valid: true };
}

/**
 * Get user's loyalty accounts from Supabase
 */
async function getAccounts(userId) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    programId: row.program_id,
    cardNumber: row.card_number,
    isLinked: row.is_linked,
    linkedAt: row.linked_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    program: getProgramById(row.program_id),
    maskedCardNumber: maskCardNumber(row.card_number)
  }));
}

/**
 * Add a loyalty account to Supabase
 */
async function addAccount(userId, programId, cardNumber) {
  const program = getProgramById(programId);
  if (!program) {
    return { success: false, error: 'Unknown loyalty program' };
  }

  const validation = validateCardNumber(programId, cardNumber);
  if (!validation.valid) {
    return { success: false, error: validation.message };
  }

  const cleanNumber = cardNumber.replace(/[\s-]/g, '');

  const { data: account, error } = await supabase
    .from('loyalty_cards')
    .insert({
      user_id: userId,
      program_id: programId,
      card_number: cleanNumber,
      is_linked: true,
      linked_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You already have this loyalty card linked' };
    }
    throw error;
  }

  return {
    success: true,
    account: {
      id: account.id,
      programId: account.program_id,
      cardNumber: account.card_number,
      isLinked: account.is_linked,
      linkedAt: account.linked_at,
      createdAt: account.created_at,
      program,
      maskedCardNumber: maskCardNumber(cleanNumber)
    }
  };
}

/**
 * Remove a loyalty account from Supabase
 */
async function removeAccount(userId, accountId) {
  const { data, error } = await supabase
    .from('loyalty_cards')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: 'Account not found' };
  }

  return { success: true };
}

/**
 * Update a loyalty account in Supabase
 */
async function updateAccount(userId, accountId, updates) {
  // Fetch existing to get program_id for validation
  const { data: existing, error: fetchError } = await supabase
    .from('loyalty_cards')
    .select('*')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existing) {
    return { success: false, error: 'Account not found' };
  }

  const updateObj = { updated_at: new Date().toISOString() };

  if (updates.cardNumber) {
    const validation = validateCardNumber(existing.program_id, updates.cardNumber);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }
    updateObj.card_number = updates.cardNumber.replace(/[\s-]/g, '');
  }

  const { data: updated, error } = await supabase
    .from('loyalty_cards')
    .update(updateObj)
    .eq('id', accountId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    account: {
      id: updated.id,
      programId: updated.program_id,
      cardNumber: updated.card_number,
      isLinked: updated.is_linked,
      linkedAt: updated.linked_at,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      program: getProgramById(updated.program_id),
      maskedCardNumber: maskCardNumber(updated.card_number)
    }
  };
}

/**
 * Get user's loyalty card for a specific store
 */
async function getAccountByStore(userId, storeName) {
  const accounts = await getAccounts(userId);
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
