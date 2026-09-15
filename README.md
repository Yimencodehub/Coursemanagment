# Course Management System

## Client

`ash
cd client
npm install
npm run dev
``n
## Server

`ash
cd server
npm install
node app.js
``n
## Firebase setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firestore Database.
3. Generate a service account key and save it as server/serviceAccountKey.json.
4. The server will use that file to connect to Firestore.

### Example Firestore collections

- users 
- courses 
- lessons 
- enrollments 

