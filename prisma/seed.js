const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create a Vendor
    const vendor = await prisma.user.upsert({
        where: { email: 'vendor@example.com' },
        update: {},
        create: {
            email: 'vendor@example.com',
            name: 'John Doe',
            password: hashedPassword,
            role: 'VENDOR',
        },
    });

    // Create a Shop for the Vendor
    const shop = await prisma.shop.upsert({
        where: { ownerId: vendor.id },
        update: {},
        create: {
            name: 'Grablo Pizza',
            description: 'The best pizza in town',
            address: '123 Main St, Springfield',
            latitude: 40.7128,
            longitude: -74.0060,
            deliveryEnabled: true,
            deliveryRange: 10.0,
            ownerId: vendor.id,
        },
    });

    // Create Menu Items
    await prisma.menuItem.createMany({
        data: [
            { name: 'Margherita Pizza', price: 12.99, description: 'Classic tomato and mozzarella', shopId: shop.id },
            { name: 'Pepperoni Pizza', price: 14.99, description: 'Spicy pepperoni with extra cheese', shopId: shop.id },
            { name: 'Garlic Bread', price: 5.99, description: 'Toasted bread with garlic butter', shopId: shop.id },
        ],
    });

    // Create another Vendor/Shop
    const vendor2 = await prisma.user.upsert({
        where: { email: 'vendor2@example.com' },
        update: {},
        create: {
            email: 'vendor2@example.com',
            name: 'Jane Smith',
            password: hashedPassword,
            role: 'VENDOR',
        },
    });

    const shop2 = await prisma.shop.upsert({
        where: { ownerId: vendor2.id },
        update: {},
        create: {
            name: 'Burger Haven',
            description: 'Juicy burgers and fries',
            address: '456 Elm St, Springfield',
            latitude: 40.7306,
            longitude: -73.9352,
            deliveryEnabled: false,
            deliveryRange: 5.0,
            ownerId: vendor2.id,
        },
    });

    await prisma.menuItem.createMany({
        data: [
            { name: 'Classic Burger', price: 9.99, description: 'Beef patty with lettuce and tomato', shopId: shop2.id },
            { name: 'Cheese Burger', price: 10.99, description: 'Beef patty with cheddar cheese', shopId: shop2.id },
            { name: 'French Fries', price: 3.99, description: 'Crispy golden fries', shopId: shop2.id },
        ],
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });