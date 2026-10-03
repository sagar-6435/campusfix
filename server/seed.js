const fs = require('fs');
const path = require('path');
const { College } = require('./db');
const mongoose = require('mongoose');

async function seed() {
  try {
    console.log('Reading colleges.txt...');
    const data = fs.readFileSync(path.join(__dirname, 'colleges.txt'), 'utf8');
    const lines = data.split('\n').filter(line => line.trim() !== '');

    console.log(`Found ${lines.length} colleges. Inserting into database...`);

    let inserted = 0;
    for (const line of lines) {
      // Split by tab or multiple spaces
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const name = parts[1].trim();
        // Create a simple slug for the college (e.g., lowercase, hyphens instead of spaces)
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        
        try {
          await College.findOneAndUpdate(
            { slug },
            { name, slug },
            { upsert: true }
          );
          inserted++;
        } catch (err) {
          console.error(`Error inserting ${name}:`, err.message);
        }
      }
    }

    console.log(`Seeding complete. Upserted ${inserted} colleges.`);
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

// Wait for mongoose to connect before seeding
mongoose.connection.once('open', seed);
