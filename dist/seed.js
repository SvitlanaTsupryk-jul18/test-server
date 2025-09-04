"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seed_data_1 = require("./utils/seed-data");
/**
 * Seed script to populate the database with fake track data
 *
 * Usage: npm run build && node dist/seed.js [count]
 * Or: ts-node src/seed.ts [count]
 *
 * Where [count] is the number of tracks to generate (default: 50)
 */
const count = process.argv[2] ? parseInt(process.argv[2], 10) : 50;
console.log(`Starting database seeding process for ${count} tracks...`);
(0, seed_data_1.seedDatabase)(count)
    .then(() => {
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map