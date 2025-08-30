import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, Timestamp, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

class AuthService {
  // Register new user
  async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: userData.displayName
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isActive: true,
        preferences: {
          emailNotifications: true,
          smsNotifications: false
        }
      });

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: userData.displayName
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update user profile
  async updateUserProfile(userData) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Update Firebase Auth profile
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...userData,
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user data
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          success: true,
          userData: userDoc.data()
        };
      } else {
        return {
          success: false,
          error: 'User not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete user account and all associated data
  async deleteUserAccount(uid) {
    try {
      // First, delete all user's bookings
      const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', uid));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const deletePromises = [];
      bookingsSnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      // Delete user document from Firestore
      deletePromises.push(deleteDoc(doc(db, 'users', uid)));
      
      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      
      return {
        success: true,
        message: 'User account and all associated data deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

const authService = new AuthService();
export default authService;