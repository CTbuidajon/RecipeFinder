# Recipe App

A modern recipe management web application with user authentication, favorites, and detailed recipe pages.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Project Structure Overview

/app # Next.js pages and client components
/components # Reusable UI components (NavBar, RecipeCard, Modals, etc.)
/lib # Firebase initialization and helper functions
/public # Static assets (images, icons, logos)
/styles # Global and modular CSS/SCSS files

Key pages and features:

pages/recipes – List of all recipes with search and filters
pages/recipes/[id] – Recipe detail page
pages/account – User account page with favorite recipes
pages/auth - Authentication with email and password or Google
components/NewRecipeModal.tsx – Modal for adding new recipes
components/EditRecipeModal.tsx – Modal for editing recipes
components/NavBar.tsx – Responsive navigation bar

## Firebase Setup

Create a new project in Firebase Console.
Enable:
Authentication → Email/Password + Google
Firestore Database
Add the following to your .env.local:
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

​
Initialize Firebase in /lib/firebase.ts:
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

## Tech Stack Summary

Framework: Next.js 13 with React 18

Authentication: Firebase Auth (Google Sign-In)

Database: Firebase Firestore

Styling: Tailwind CSS

Hosting: Vercel

Image Optimization: Next.js Image component

## Vercel Deployment Link

The app is deployed and accessible at:
https://recipe-finder-seven-phi.vercel.app
