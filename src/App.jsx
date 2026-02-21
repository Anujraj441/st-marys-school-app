St. Mary's English Medium School - Android App Architecture
Creator: Anuj Sir
AI Assistant: Jarvis
This document outlines the production-level structure for the Android Studio implementation of the school app.
1. Tech Stack & Libraries
 * IDE: Android Studio (Flamingo or later)
 * Language: Kotlin (Recommended) or Java
 * Architecture: MVVM (Model-View-ViewModel)
 * Database: Firebase Firestore (Real-time NoSQL)
 * Authentication: Firebase Auth (Email/Password)
 * Storage: Firebase Cloud Storage (Photos, PDFs, Files)
 * Network/AI: Retrofit2 + Gson (For Gemini API Integration)
 * UI: XML + Material Design 3 OR Jetpack Compose
 * Image Loading: Glide or Coil
2. Project Structure (Packages)
com.anuj.stmarys
│
├── ui/                 # All UI Components
│   ├── splash/         # SplashActivity.kt
│   ├── auth/           # LoginActivity.kt, RegisterActivity.kt
│   ├── main/           # MainActivity.kt (Bottom Nav Host)
│   ├── batches/        # BatchesFragment.kt, ChatActivity.kt
│   ├── info/           # SchoolInfoFragment.kt
│   ├── profile/        # ProfileFragment.kt
│   └── jarvis/         # JarvisFragment.kt (AI Chat)
│
├── data/               # Data layer
│   ├── model/          # User.kt, Message.kt, Batch.kt
│   ├── repository/     # AuthRepository.kt, ChatRepository.kt
│   └── remote/         # GeminiApiService.kt
│
├── utils/              # Helper classes
│   ├── Constants.kt    # Keys, Roles
│   └── Extensons.kt    # Context extensions for Toasts, etc.

3. Firebase Firestore Structure
To enforce strict role-based access, we structure the database as follows:
 * Collection: users
   * Document: {userId}
   * Fields: uid, name, email, role ("admin", "teacher", "student"), classId, profileUrl, phone, parentsName
 * Collection: classes
   * Document: {classId} (e.g., "class_10")
   * Fields: name, teacherId
 * Collection: messages
   * Document: {messageId}
   * Fields: classId, senderId, senderName, text, type ("text", "image", "pdf"), timestamp
4. Firebase Security Rules (CRITICAL)
Apply these rules in the Firebase Console -> Firestore Database -> Rules.
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Function to check user role
    function getRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Users Collection Rules
    match /users/{userId} {
      // Admin can read/write all. Teacher can read students in their class. Student can only read their own.
      allow read: if request.auth.uid == userId || getRole() == 'admin' || getRole() == 'teacher';
      // Only Admin or the user themselves can update their profile.
      allow write: if request.auth.uid == userId || getRole() == 'admin';
    }

    // Classes Collection Rules
    match /classes/{classId} {
      allow read: if request.auth != null; // Anyone logged in can see class list
      allow write: if getRole() == 'admin'; // Only admin can create/edit classes
    }

    // Messages Collection Rules
    match /messages/{messageId} {
      // Anyone in the school can read messages (can restrict to classId if needed)
      allow read: if request.auth != null;
      // ONLY Admin and Teacher can send messages. Students CANNOT write.
      allow create: if getRole() in ['admin', 'teacher'];
      allow update, delete: if getRole() == 'admin';
    }
  }
}

5. Gemini AI Integration Logic (Retrofit)
Do NOT expose your API key directly in the APK if possible. For production, keep it in local.properties and inject via BuildConfig.
// Android system prompt setup for Gemini
val systemInstruction = "I am Jarvis. I was created by Anuj Sir to help students. Tone: Professional, helpful."
// API Call Endpoint:
// POST [https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY)

  
