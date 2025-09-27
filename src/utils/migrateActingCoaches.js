import { db } from '../services/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

/**
 * Migrates acting coaches from localStorage to Firebase
 * This fixes the issue where coaches were only stored locally
 */
export const migrateActingCoachesToFirebase = async () => {
  try {
    console.log('🔄 Starting acting coaches migration...');
    
    // Get acting coaches from localStorage
    const savedActingCoaches = localStorage.getItem('actingCoaches');
    if (!savedActingCoaches) {
      console.log('ℹ️ No acting coaches found in localStorage');
      return { success: true, message: 'No data to migrate' };
    }
    
    const localCoaches = JSON.parse(savedActingCoaches);
    if (!Array.isArray(localCoaches) || localCoaches.length === 0) {
      console.log('ℹ️ No valid acting coaches found in localStorage');
      return { success: true, message: 'No valid data to migrate' };
    }
    
    console.log(`📊 Found ${localCoaches.length} acting coaches in localStorage`);
    
    // Check what's already in Firebase
    const actingCoachesCollection = collection(db, 'actingCoaches');
    const existingSnapshot = await getDocs(actingCoachesCollection);
    const existingCoaches = existingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${existingCoaches.length} acting coaches in Firebase`);
    
    // Find coaches that exist in localStorage but not in Firebase
    const coachesToMigrate = localCoaches.filter(localCoach => {
      return !existingCoaches.some(existingCoach => 
        existingCoach.name === localCoach.name && 
        existingCoach.class_type === localCoach.class_type
      );
    });
    
    if (coachesToMigrate.length === 0) {
      console.log('✅ All acting coaches are already in Firebase');
      return { success: true, message: 'All data already synced' };
    }
    
    console.log(`🚀 Migrating ${coachesToMigrate.length} acting coaches to Firebase...`);
    
    // Migrate each coach to Firebase
    const migrationResults = [];
    for (const coach of coachesToMigrate) {
      try {
        // Clean up the coach data for Firebase
        const cleanCoach = {
          name: coach.name || '',
          class_type: coach.class_type || 'Pre-recorded',
          class_price: parseInt(coach.class_price) || 0,
          class_duration: coach.class_duration || '',
          class_description: coach.class_description || '',
          available: coach.available !== false, // Default to true
          image: coach.image || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(actingCoachesCollection, cleanCoach);
        console.log(`✅ Migrated coach: ${coach.name} (ID: ${docRef.id})`);
        migrationResults.push({ success: true, coach: coach.name, id: docRef.id });
      } catch (error) {
        console.error(`❌ Failed to migrate coach: ${coach.name}`, error);
        migrationResults.push({ success: false, coach: coach.name, error: error.message });
      }
    }
    
    const successCount = migrationResults.filter(r => r.success).length;
    const failureCount = migrationResults.filter(r => !r.success).length;
    
    console.log(`🎉 Migration completed: ${successCount} successful, ${failureCount} failed`);
    
    return {
      success: failureCount === 0,
      message: `Migrated ${successCount} acting coaches to Firebase`,
      results: migrationResults
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
      error: error
    };
  }
};

/**
 * Forces a refresh of acting coaches from Firebase
 */
export const refreshActingCoachesFromFirebase = async () => {
  try {
    console.log('🔄 Refreshing acting coaches from Firebase...');
    
    const actingCoachesCollection = collection(db, 'actingCoaches');
    const querySnapshot = await getDocs(actingCoachesCollection);
    
    if (!querySnapshot.empty) {
      const firebaseCoaches = querySnapshot.docs.map(doc => ({
        firebaseId: doc.id,
        ...doc.data()
      }));
      
      // Update localStorage with fresh Firebase data
      localStorage.setItem('actingCoaches', JSON.stringify(firebaseCoaches));
      
      console.log(`✅ Refreshed ${firebaseCoaches.length} acting coaches from Firebase`);
      
      // Dispatch events to update UI
      window.dispatchEvent(new CustomEvent('actingCoachesUpdated', {
        detail: { coaches: firebaseCoaches, action: 'refresh' }
      }));
      
      window.dispatchEvent(new CustomEvent('actingCoachesStorageUpdate', {
        detail: { coaches: firebaseCoaches }
      }));
      
      return {
        success: true,
        coaches: firebaseCoaches,
        message: `Loaded ${firebaseCoaches.length} acting coaches`
      };
    } else {
      console.log('ℹ️ No acting coaches found in Firebase');
      return {
        success: true,
        coaches: [],
        message: 'No acting coaches found in Firebase'
      };
    }
  } catch (error) {
    console.error('❌ Failed to refresh from Firebase:', error);
    return {
      success: false,
      message: `Failed to refresh: ${error.message}`,
      error: error
    };
  }
};

export default migrateActingCoachesToFirebase;