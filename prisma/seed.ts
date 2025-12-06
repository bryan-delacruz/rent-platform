import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as fs from 'fs';
import * as path from 'path';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL?.replace('&channel_binding=require', '') || '';
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

interface OldData {
  properties: any[];
  tenants: any[];
  leases: any[];
  payments: any[];
}

async function main() {
  console.log('🌱 Starting seed...');

  // Read old data.json
  const dataPath = path.join(process.cwd(), 'data.json');
  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  const oldData: OldData = JSON.parse(fileContent);

  console.log(`📦 Found ${oldData.properties.length} properties`);
  console.log(`📦 Found ${oldData.tenants.length} tenants`);
  console.log(`📦 Found ${oldData.leases.length} leases`);
  console.log(`📦 Found ${oldData.payments.length} payments`);

  // Clear existing data (in reverse order due to foreign keys)
  console.log('\n🧹 Clearing existing data...');
  await prisma.payment.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.property.deleteMany();
  console.log('✅ Cleared existing data');

  // Seed Properties
  console.log('\n🏢 Seeding properties...');
  for (const property of oldData.properties) {
    await prisma.property.create({
      data: {
        id: property.id,
        name: property.name,
        type: property.type,
        status: property.status,
        price: property.price,
        currency: property.currency,
        location: property.location,
        floor: property.floor,
      },
    });
  }
  console.log(`✅ Seeded ${oldData.properties.length} properties`);

  // Seed Tenants
  console.log('\n👥 Seeding tenants...');
  for (const tenant of oldData.tenants) {
    await prisma.tenant.create({
      data: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        dni: tenant.dni,
        address: tenant.address,
      },
    });
  }
  console.log(`✅ Seeded ${oldData.tenants.length} tenants`);

  // Seed Leases
  console.log('\n📄 Seeding leases...');
  let leasesSeeded = 0;
  for (const lease of oldData.leases) {
    // Validate foreign keys exist
    const propertyExists = oldData.properties.some(p => p.id === lease.propertyId);
    const tenantExists = oldData.tenants.some(t => t.id === lease.tenantId);

    if (!propertyExists || !tenantExists) {
      console.log(`⚠️  Skipping lease ${lease.id} - missing property/tenant`);
      continue;
    }

    await prisma.lease.create({
      data: {
        id: lease.id,
        propertyId: lease.propertyId,
        tenantId: lease.tenantId,
        startDate: lease.startDate,
        endDate: lease.endDate,
        monthlyRent: lease.monthlyRent,
        currency: lease.currency,
        status: lease.status,
        advanceMonths: lease.advanceMonths,
        warrantyMonths: lease.warrantyMonths,
        utilityCosts: lease.utilityCosts || null,
        terminationDate: lease.terminationDate || null,
      },
    });
    leasesSeeded++;
  }
  console.log(`✅ Seeded ${leasesSeeded} leases (${oldData.leases.length - leasesSeeded} skipped)`);

  // Seed Payments
  console.log('\n💰 Seeding payments...');
  let paymentsSeeded = 0;
  const validLeaseIds = oldData.leases
    .filter(l => oldData.properties.some(p => p.id === l.propertyId) && oldData.tenants.some(t => t.id === l.tenantId))
    .map(l => l.id);

  for (const payment of oldData.payments) {
    // Validate lease exists
    if (!validLeaseIds.includes(payment.leaseId)) {
      console.log(`⚠️  Skipping payment ${payment.id} - invalid lease reference`);
      continue;
    }

    await prisma.payment.create({
      data: {
        id: payment.id,
        leaseId: payment.leaseId,
        dueDate: payment.dueDate,
        amount: payment.amount,
        amountPaid: payment.amountPaid,
        status: payment.status,
        paidDate: payment.paidDate,
        transactions: payment.transactions || null,
      },
    });
    paymentsSeeded++;
  }
  console.log(`✅ Seeded ${paymentsSeeded} payments (${oldData.payments.length - paymentsSeeded} skipped)`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
