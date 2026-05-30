const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addAdmin() {
  try {
    // Generate a temporary password hash (you can change this)
    const tempPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        name: 'Arun Prajapat',
        email: 'arun.op.prajapati@gmail.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('User ID:', user.id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Temporary password:', tempPassword);
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Error: Email already exists');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addAdmin();
