'use client';

import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import NavBar from "@/components/NavBar";

export default function RecipeDetails() {
  const params = useParams();
  const recipeId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);


  const addToFavorites = async (recipeId: string, userId: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      favorites: arrayUnion(recipeId),
    });
  };

  const removeFromFavorites = async (recipeId: string, userId: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      favorites: arrayRemove(recipeId),
    });
  };  

  const handleFavoriteClick = async () => {
    if (!user) return alert("Please sign in to add to favorites");
  
    if (isFavorite) {
      await removeFromFavorites(recipeId, user.uid);
      setIsFavorite(false);
    } else {
      await addToFavorites(recipeId, user.uid);
      setIsFavorite(true);
    }
  };
  
  

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const docRef = doc(db, "recipes", recipeId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setNotFound(true);
        } else {
          setRecipe(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        setNotFound(true);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const favorites = userSnap.data().favorites || [];
        setIsFavorite(favorites.includes(recipeId));
      }
    };
  
    checkFavorite();
  }, [user, recipeId]);  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/auth/signin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-xl text-profile-light">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-xl text-profile-light">Recipe not found</div>
      </div>
    );
  }

  return (

    <main className="min-h-screen bg-background px-12">
      <NavBar/>
      <section className="w-full pt-[24px] pb-[48px]">
        <button 
          onClick={() => router.push('/recipes')}
          className="flex items-center gap-2 px-[16] py-[12] text-black font-semibold text-base bg-yellow rounded-[12] hover:bg-yellow-hover transition-colors"
        >
          <Image src="/arrow-icon.svg" alt="Arrow Left" width={12} height={14} />
          <span className="text-base font-medium">Back</span>
        </button>
        
        <h1 className="text-5xl font-medium text-profile-light my-6">{recipe.title}</h1>
        <div className="flex items-center gap-2 my-4">
          <button
            onClick={handleFavoriteClick}
            className="flex items-center gap-2 text-xl font-medium text-black bg-yellow hover:bg-yellow-hover rounded-[8px] p-2"
          >
            <Image src="/heart-icon.svg" alt="Heart" width={20} height={20} />
            <span className="text-black text-base font-medium">
              {isFavorite ? "In Favorites" : "Add to Favorites"}
            </span>
          </button>
        </div>

        {recipe.image && (
          <div className="mb-6  overflow-hidden w-full">
            <Image
              src={recipe.image}
              alt={recipe.title}
              width={800}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        <div className="w-full">
          <span className="text-sm font-semibold text-profile-light">{recipe.createdAt.toDate().toLocaleDateString()}</span>

          <div className="flex items-center gap-[12] mt-[18] mb-[24]">
            <Image src="/user.svg" alt="User" width={36} height={36} />
            <div className="flex flex-col">
              <span className="text-profile-light text-base font-normal">{recipe.author}</span>
              <span className="text-profile-grey text-sm font-semibold">Pastry Chef</span>
            </div>
          </div>

          <div className="py-[24]">
            <h3 className="text-3xl font-medium text-profile-light mb-[8]">Introduction</h3>
            <p className="text-profile-light text-lg font-normal">{recipe.description}</p>
          </div>

          <div className="py-[24]">
            <h3 className="text-3xl font-medium text-profile-light mb-[8]">Ingredients</h3>
              {recipe.ingredients.map((ingredient: any) => (
                <label key={ingredient} className="flex items-center gap-2 mb-[8]">
                  <input type="checkbox" className="appearance-none w-6 h-6 border border-profile-lightchecked checked:bg-yellow checked:border-yellow transition cursor-pointer rounded-[4] bg-transparent" />
                  <span className="text-lg font-normal text-profile-light">{ingredient}</span>
                </label>
              ))}
          </div>

          <div className="py-[24]">
            <h3 className="text-3xl font-medium text-profile-light mb-[8]">Instructions</h3>
            <ol className="list-decimal list-inside">
              {recipe.instructions.map((instruction: any) => (
                <li key={instruction} className="text-lg font-normal text-profile-light">{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="flex items-center gap-[8] py-[24]">
            <Image src="/star.svg" alt="Star" width={20} height={20} />
            <span className="text-profile-light text-lg font-normal">{recipe.rating}</span>
          </div>

          <div className="py-[24]">
            <span className="text-profile-light text-lg font-normal">Prep Time: {recipe.prepTime} minutes</span>
          </div>
        </div>
      </section>
    </main>
  );
}
