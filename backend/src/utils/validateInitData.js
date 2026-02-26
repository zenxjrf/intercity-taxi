const crypto = require('crypto');

function validateInitData(initData) {
  if (!initData) {
    return { valid: false, error: 'No initData provided' };
  }
  
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    // In development mode, accept requests without hash (for local testing)
    if (process.env.NODE_ENV !== 'production' && !hash) {
      const userData = JSON.parse(urlParams.get('user'));
      return { valid: true, user: userData };
    }
    
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();
    
    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    if (calculatedHash !== hash) {
      return { valid: false, error: 'Invalid hash' };
    }
    
    const userData = JSON.parse(urlParams.get('user'));
    const authDate = parseInt(urlParams.get('auth_date'));
    const now = Math.floor(Date.now() / 1000);
    
    // Check if auth_date is not older than 24 hours
    if (now - authDate > 86400) {
      return { valid: false, error: 'Auth date expired' };
    }
    
    return { valid: true, user: userData };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

module.exports = { validateInitData };
