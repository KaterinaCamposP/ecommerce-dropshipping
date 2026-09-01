import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Prisma 7: driver adapter obligatorio también en scripts
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@test.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'AdminPass123';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin Seed',
      role: 'ADMIN',
      passwordHash,
    },
  });
  console.log(`Admin ready: ${admin.email} (${admin.role})`);

  const productCount = await prisma.product.count();
  if (productCount > 0) {
    console.log('Products already exist, skipping product seed');
    return;
  }

  await prisma.product.createMany({
    data: [
      {
        title: 'Polera oversize negra',
        description: '100% algodón, corte oversize',
        price: 19990,
        stock: 25,
        category: 'Ropa',
      },
      {
        title: 'Jean recto azul',
        description: 'Denim clásico, calce recto',
        price: 34990,
        stock: 15,
        category: 'Ropa',
      },
      {
        title: 'Zapatillas urbanas',
        description: 'Suela de goma, uso diario',
        price: 49990,
        stock: 10,
        category: 'Calzado',
      },
      {
        title: 'Gorra snapback',
        description: 'Ajuste regulable',
        price: 14990,
        stock: 30,
        category: 'Accesorios',
      },
      {
        title: 'Mochila 20L',
        description: 'Resistente al agua',
        price: 39990,
        stock: 12,
        category: 'Accesorios',
      },
      {
        title: 'Polera gráfica vintage',
        description: 'Producto inactivo para probar visibilidad',
        price: 22990,
        stock: 0,
        category: 'Ropa',
        active: false,
      },
    ],
  });
  console.log('6 sample products created');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
