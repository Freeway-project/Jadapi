/**
 * Script to deduplicate push tokens and create unique index
 * Run with: npx tsx src/scripts/dedupe-tokens.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { connectDB } from '../config/db';
import { User } from '../models/user.model';

async function dedupeTokens() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Step 1: Dedupe tokens in each user document
    const users = await User.find({ pushTokens: { $exists: true, $ne: [] } });
    let totalDedupedUsers = 0;
    let totalTokensRemoved = 0;

    for (const user of users) {
      const originalLength = user.pushTokens?.length || 0;
      if (originalLength > 0) {
        // Remove duplicates using Set
        const uniqueTokens = [...new Set(user.pushTokens)];

        if (uniqueTokens.length < originalLength) {
          user.pushTokens = uniqueTokens;
          await user.save();
          totalDedupedUsers++;
          totalTokensRemoved += (originalLength - uniqueTokens.length);
          console.log(`Deduped user ${user._id}: ${originalLength} → ${uniqueTokens.length} tokens`);
        }
      }
    }

    console.log(`\nDedupe complete:`);
    console.log(`- Users with duplicates: ${totalDedupedUsers}`);
    console.log(`- Total duplicate tokens removed: ${totalTokensRemoved}`);

    // Step 2: Create index (will skip if already exists)
    console.log('\nCreating index on pushTokens...');
    await User.collection.createIndex(
      { pushTokens: 1 },
      { background: true, sparse: true }
    );
    console.log('Index created successfully');

    console.log('\n✓ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

dedupeTokens();
