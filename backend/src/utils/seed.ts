import { User, UserRole } from '../models/User';
import { hashPassword } from './password';

export const seedDefaultAdmin = async (): Promise<void> => {
  try {
    const adminEmail = 'admin@cloudblitz.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const passwordHash = await hashPassword('Admin@123');
      await User.create({
        name: 'CloudBlitz Admin',
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
      });
      console.log('[Seed] Default Admin user created: admin@cloudblitz.com');
    }
  } catch (error) {
    console.error('[Seed] Error seeding default admin:', error);
  }
};
