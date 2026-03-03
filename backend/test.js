const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://devasanirohit7_db_user:rohit2804@cluster0.4ajxqtp.mongodb.net/doctor-appointment?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected successfully!");
  } catch (error) {
    console.log("❌ Connection error:", error);
  } finally {
    await client.close();
  }
}

run();