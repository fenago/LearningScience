const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Manually load .env file
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  } catch (error) {
    console.error('Could not load .env file:', error.message);
  }
}

loadEnvFile();
const MONGODB_URI = process.env.MONGODB_URI;

async function migrateApiKey() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🔧 Migrating API key from email-based storage to user ID-based storage...');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    const correctUserId = '6839f3323137c5338e106a9f';
    const email = 'socrates73@gmail.com';

    // Check if there's a profile with email as userId (old API key storage)
    const emailBasedProfile = await db.collection('ls_userProfiles').findOne({ 
      userId: email 
    });

    // Check current profile with correct user ID
    const correctProfile = await db.collection('ls_userProfiles').findOne({ 
      userId: correctUserId 
    });

    console.log('\n🔍 CURRENT SITUATION:');
    console.log(`   Profile with email as userId (${email}): ${emailBasedProfile ? 'EXISTS' : 'NOT FOUND'}`);
    console.log(`   Profile with correct userId (${correctUserId}): ${correctProfile ? 'EXISTS' : 'NOT FOUND'}`);

    if (emailBasedProfile?.apiKey) {
      console.log('\n📦 Found API key in email-based profile:');
      console.log(`   - encryptedKey: ${emailBasedProfile.apiKey.encryptedKey ? 'EXISTS' : 'MISSING'}`);
      console.log(`   - isValid: ${emailBasedProfile.apiKey.isValid}`);
      console.log(`   - addedAt: ${emailBasedProfile.apiKey.addedAt}`);

      if (correctProfile) {
        // Update the correct profile with the API key data
        console.log('\n🔄 Migrating API key to correct profile...');
        
        const result = await db.collection('ls_userProfiles').updateOne(
          { userId: correctUserId },
          { 
            $set: { 
              apiKey: emailBasedProfile.apiKey,
              updatedAt: new Date()
            } 
          }
        );

        if (result.modifiedCount > 0) {
          console.log('✅ Successfully migrated API key to correct profile');
          
          // Remove the incorrect email-based profile
          const deleteResult = await db.collection('ls_userProfiles').deleteOne({ 
            userId: email 
          });
          
          if (deleteResult.deletedCount > 0) {
            console.log('✅ Cleaned up old email-based profile');
          }
        } else {
          console.log('⚠️  Failed to migrate API key');
        }
      } else {
        console.log('❌ Correct user profile not found - cannot migrate');
      }
    } else {
      console.log('\n⚠️  No API key found in email-based profile');
      
      // The API key might not exist anywhere, in which case the user needs to re-add it
      console.log('\n💡 SOLUTION: The user will need to re-add their API key in the profile settings');
      console.log('   The issue was that the API key storage route was using email instead of user ID');
      console.log('   Now that it\'s fixed, they can add their API key again and it will work');
    }

    // Final verification
    console.log('\n📊 FINAL VERIFICATION:');
    const finalProfile = await db.collection('ls_userProfiles').findOne({ 
      userId: correctUserId 
    });
    
    if (finalProfile?.apiKey) {
      console.log('✅ API key now properly stored in correct profile');
      console.log(`   - encryptedKey: ${finalProfile.apiKey.encryptedKey ? 'EXISTS' : 'MISSING'}`);
      console.log(`   - isValid: ${finalProfile.apiKey.isValid}`);
    } else {
      console.log('⚠️  No API key in correct profile - user needs to re-add it');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrateApiKey();
