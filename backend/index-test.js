require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing in .env file");
  process.exit(1);
}

const sampleData = [
  { name: 'Alice Smith', email: 'alice@example.com', age: 25, hobbies: ['reading', 'gaming'], bio: 'Loves science fiction and coding', userId: 'usr123' },
  { name: 'Bob Jones', email: 'bob@example.com', age: 30, hobbies: ['sports', 'cooking'], bio: 'Chef by day, athlete by night', userId: 'usr124' },
  { name: 'Charlie Brown', email: 'charlie@example.com', age: 22, hobbies: ['gaming', 'music'], bio: 'Aspiring musician and gamer', userId: 'usr125' }
];

async function runTest() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for Index Testing...");

    // Clear collection for clean test
    await User.deleteMany({});
    console.log("Cleared existing users.");

    // Insert sample data
    await User.insertMany(sampleData);
    console.log("Sample data inserted.");

    // Test 1: Single field index (name)
    console.log("\n--- Testing Single Field Index (name) ---");
    const statsName = await User.find({ name: 'Alice Smith' }).explain('executionStats');
    console.log(`Docs Examined: ${statsName.executionStats.totalDocsExamined}`);
    console.log(`Keys Examined: ${statsName.executionStats.totalKeysExamined}`);
    console.log(`Execution Time: ${statsName.executionStats.executionTimeMillis}ms`);
    console.log(`Index used:`, statsName.queryPlanner.winningPlan.inputStage.indexName || 'COLLSCAN');

    // Test 2: Text index (bio)
    console.log("\n--- Testing Text Index (bio) ---");
    const statsBio = await User.find({ $text: { $search: 'coding' } }).explain('executionStats');
    console.log(`Docs Examined: ${statsBio.executionStats.totalDocsExamined}`);
    console.log(`Keys Examined: ${statsBio.executionStats.totalKeysExamined}`);
    console.log(`Execution Time: ${statsBio.executionStats.executionTimeMillis}ms`);

    // Test 3: Compound index (email, age)
    console.log("\n--- Testing Compound Index (email & age) ---");
    const statsCompound = await User.find({ email: 'bob@example.com', age: 30 }).explain('executionStats');
    console.log(`Docs Examined: ${statsCompound.executionStats.totalDocsExamined}`);
    console.log(`Keys Examined: ${statsCompound.executionStats.totalKeysExamined}`);
    console.log(`Execution Time: ${statsCompound.executionStats.executionTimeMillis}ms`);

    // Test 4: Hashed index (userId)
    console.log("\n--- Testing Hashed Index (userId) ---");
    const statsHashed = await User.find({ userId: 'usr125' }).explain('executionStats');
    console.log(`Docs Examined: ${statsHashed.executionStats.totalDocsExamined}`);
    console.log(`Keys Examined: ${statsHashed.executionStats.totalKeysExamined}`);
    console.log(`Execution Time: ${statsHashed.executionStats.executionTimeMillis}ms`);

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    mongoose.connection.close();
    console.log("\nDisconnected from MongoDB.");
  }
}

runTest();
