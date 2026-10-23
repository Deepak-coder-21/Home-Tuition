import User from '../models/User.js';

/**
 * Retrieve admin email strictly from environment variables:
 * Checks BREVO_SENDER_EMAIL, BREVO_SENDER_EMAI, or ADMIN_EMAIL
 */
export const getAdminEmail = () => {
  return (
    process.env.BREVO_SENDER_EMAIL ||
    process.env.BREVO_SENDER_EMAI ||
    process.env.ADMIN_EMAIL ||
    ''
  ).toLowerCase().trim();
};

/**
 * Auto-synchronize the MongoDB administrator account with the .env BREVO_SENDER_EMAIL.
 * Ensures:
 * 1. Admin email in MongoDB matches .env dynamically.
 * 2. NO hardcoded passwords exist. Existing MongoDB bcrypt hashed password is preserved.
 * 3. If no admin user exists, an admin user is created with a secure random initial password,
 *    and can be updated anytime using the 'Forgot Password' Brevo OTP flow.
 */
export const syncAdminUser = async () => {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    console.warn('⚠️ [Admin Sync] Neither BREVO_SENDER_EMAIL nor ADMIN_EMAIL is configured in server/.env.');
    return null;
  }

  try {
    // 1. Look for existing admin user by role 'admin'
    let adminUser = await User.findOne({ role: 'admin' });

    if (adminUser) {
      let isModified = false;

      // If email in DB differs from .env BREVO_SENDER_EMAIL, update email without touching password
      if (adminUser.email.toLowerCase().trim() !== adminEmail) {
        console.log(`📡 [Admin Sync] Updating admin email in MongoDB from '${adminUser.email}' to '${adminEmail}' (from .env)...`);
        adminUser.email = adminEmail;
        isModified = true;
      }

      if (isModified) {
        await adminUser.save();
        console.log(`✓ [Admin Sync] Admin user '${adminEmail}' successfully updated in MongoDB!`);
      } else {
        console.log(`✓ [Admin Sync] Admin verified in MongoDB: ${adminEmail} (role: admin)`);
      }
      return adminUser;
    }

    // 2. If no user with role 'admin' exists, check if user with this email exists
    let userByEmail = await User.findOne({ email: adminEmail });
    if (userByEmail) {
      console.log(`📡 [Admin Sync] Elevating existing user '${adminEmail}' to admin role in MongoDB...`);
      userByEmail.role = 'admin';
      await userByEmail.save();
      console.log(`✓ [Admin Sync] User '${adminEmail}' promoted to admin.`);
      return userByEmail;
    }

    // 3. If no admin user exists at all in MongoDB, create one with a randomized initial password.
    // Admin sets/changes their password via the 'Forgot Password' flow with Brevo OTP.
    const randomInitialPass = 'Admin_' + Math.random().toString(36).substring(2, 10) + '!' + Math.floor(100 + Math.random() * 900);
    const newAdmin = await User.create({
      name: 'VidyaNest Administrator',
      email: adminEmail,
      password: randomInitialPass,
      role: 'admin',
      phone: '',
      city: 'New Delhi'
    });
    console.log(`✓ [Admin Sync] New administrator initialized in MongoDB with email '${adminEmail}'. Password can be set via Forgot Password.`);
    return newAdmin;
  } catch (error) {
    console.error('❌ [Admin Sync Error]:', error.message);
    return null;
  }
};
