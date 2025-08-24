// Direct user creation using Node.js and crypto
const crypto = require('crypto');
const { Client } = require('pg');

async function createAdminUser() {
  const client = new Client({
    connectionString: 'postgres://medusa_user:medusa_password@localhost:5432/purelinen_medusa'
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database');

    // Generate IDs
    const userId = 'user_' + crypto.randomBytes(12).toString('hex').toLowerCase();
    const authId = 'authid_' + crypto.randomBytes(12).toString('hex').toLowerCase();
    const providerId = crypto.randomBytes(12).toString('hex').toLowerCase();

    const email = 'admin@test.com';
    const password = 'admin123';

    // Simple password hash (this is just for testing - Medusa uses scrypt)
    const hashedPassword = crypto.pbkdf2Sync(password, 'salt', 10000, 64, 'sha512').toString('hex');

    console.log('📝 Creating user with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${userId}`);

    // Insert user
    await client.query(
      'INSERT INTO "user" (id, email, first_name, last_name, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
      [userId, email, 'Admin', 'User']
    );
    console.log('✅ User record created');

    // Insert auth identity
    await client.query(
      'INSERT INTO auth_identity (id, app_metadata, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
      [authId, JSON.stringify({ user_id: userId })]
    );
    console.log('✅ Auth identity created');

    // Insert provider identity with simple hash
    await client.query(
      'INSERT INTO provider_identity (id, entity_id, provider, auth_identity_id, provider_metadata, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
      [providerId, email, 'emailpass', authId, JSON.stringify({ password: hashedPassword })]
    );
    console.log('✅ Provider identity created');

    console.log('🎉 Admin user created successfully!');
    console.log(`📧 Try logging in with: ${email} / ${password}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdminUser();
