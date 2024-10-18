// backend/utils/FirebaseAdmin.js
import admin from 'firebase-admin';

const initializeFirebaseAdmin = async () => {
  if (!admin.apps.length) {
    const { default: serviceAccount } = await import('./service-key.json', {
      assert: { type: 'json' },
    });

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully.");
  }
  return admin;
};
// initializeFirebaseAdmin();
export default initializeFirebaseAdmin;
// backend/utils/FirebaseAdmin.js
// import admin from 'firebase-admin';
// import serviceAccount from './service-key.json'; // Import the service account JSON

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });

//   console.log("Firebase Admin initialized successfully.");
// }

// // Export the initialized admin instance for use in other modules
// export default admin;
