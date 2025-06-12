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

async function fixUserMapping() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  console.log('🔧 Fixing user ID mapping between NextAuth and UserProfiles...');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // Get NextAuth users (the actual authenticated users)
    const nextAuthUsers = await db.collection('users').find({}).toArray();
    console.log('\n👥 NextAuth Users:');
    nextAuthUsers.forEach(user => {
      console.log(`   ID: ${user._id}, Email: ${user.email}, Name: ${user.name}`);
    });

    // Get our app user profiles
    const profiles = await db.collection('ls_userProfiles').find({}).toArray();
    console.log('\n👤 User Profiles:');
    profiles.forEach(profile => {
      console.log(`   UserID: ${profile.userId}, Email: ${profile.email}, Role: ${profile.role}`);
    });

    // Find your admin profile by email
    const adminProfile = profiles.find(p => p.email === 'socrates73@gmail.com');
    const nextAuthUser = nextAuthUsers.find(u => u.email === 'socrates73@gmail.com');

    if (!adminProfile) {
      console.error('❌ Admin profile not found in ls_userProfiles');
      return;
    }

    if (!nextAuthUser) {
      console.error('❌ NextAuth user not found');
      return;
    }

    console.log(`\n🔍 Found mismatch:`);
    console.log(`   NextAuth User ID: ${nextAuthUser._id}`);
    console.log(`   Profile User ID: ${adminProfile.userId}`);

    if (nextAuthUser._id.toString() !== adminProfile.userId) {
      console.log('\n🔧 Fixing user ID mapping...');
      
      // Update the profile to use the correct NextAuth user ID
      const result = await db.collection('ls_userProfiles').updateOne(
        { email: 'socrates73@gmail.com' },
        { 
          $set: { 
            userId: nextAuthUser._id.toString(),
            updatedAt: new Date()
          } 
        }
      );

      if (result.modifiedCount > 0) {
        console.log('✅ Successfully updated profile userId to match NextAuth ID');
      } else {
        console.log('⚠️  No profile was updated');
      }

      // Also update any related records in ls_users if they exist
      const lsUsersResult = await db.collection('ls_users').updateOne(
        { email: 'socrates73@gmail.com' },
        { 
          $set: { 
            _id: nextAuthUser._id,
            updatedAt: new Date()
          } 
        }
      );

      if (lsUsersResult.modifiedCount > 0) {
        console.log('✅ Successfully updated ls_users record');
      }
    } else {
      console.log('✅ User IDs already match - no fix needed');
    }

    // Verify the fix
    console.log('\n📊 VERIFICATION:');
    const updatedProfile = await db.collection('ls_userProfiles').findOne({ email: 'socrates73@gmail.com' });
    if (updatedProfile) {
      console.log(`✅ Profile UserID: ${updatedProfile.userId}`);
      console.log(`✅ Profile Email: ${updatedProfile.email}`);
      console.log(`✅ Profile Role: ${updatedProfile.role}`);
      
      // Test the lookup that NextAuth will perform
      const lookupTest = await db.collection('ls_userProfiles').findOne({ userId: nextAuthUser._id.toString() });
      if (lookupTest) {
        console.log(`✅ NextAuth lookup test PASSED - profile found with role: ${lookupTest.role}`);
      } else {
        console.log(`❌ NextAuth lookup test FAILED - profile not found`);
      }
    }

  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

fixUserMapping();
