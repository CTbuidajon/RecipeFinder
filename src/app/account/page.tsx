'use client';

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { User } from "firebase/auth";
interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  rating: number;
}


export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[] | null>(null);

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

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/auth/signin");
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteRecipes([]);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        setFavoriteRecipes([]);
        return;
      }

      const userData = userSnap.data();
      const favorites = userData.favorites || [];

      if (favorites.length === 0) {
        setFavoriteRecipes([]);
        return;
      }
  
      const recipesRef = collection(db, "recipes");
      const chunks = [];
  
      for (let i = 0; i < favorites.length; i += 10) {
        const idsChunk = favorites.slice(i, i + 10);
        const q = query(recipesRef, where("__name__", "in", idsChunk));
        const snapshot = await getDocs(q);
        chunks.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe)));
      }
  
      setFavoriteRecipes(chunks);
    };
  
    fetchFavorites();
  }, [user]);
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-xl text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <section className="flex flex-col p-6 sm:p-12 bg-background min-h-screen">
     
      <div className="lg:flex lg:flex-row flex-col justify-between items-center gap-2 mb-8">
        <div className="flex items-center gap-2">
          <Image
            src="/user.svg"
            alt="User Avatar"
            width={80}
            height={80}
            className="rounded-full"
          />
          <div>
            <h1 className="lg:text-2xl text-lg font-semibold text-profile-light">
              {user?.displayName || "Unnamed User"}
            </h1>
            <p className="lg:text-base text-sm text-profile-grey">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4">
          <button 
            onClick={() => router.push('/recipes')}
            className="flex items-center gap-2 px-[16] py-[12] text-black font-semibold text-base bg-yellow rounded-[12] hover:bg-yellow-hover transition-colors"
          >
            <Image src="/arrow-icon.svg" alt="Arrow Left" width={12} height={14} />
            <span className="text-base font-medium">Back</span>
          </button>
          <button
            className="px-4 py-2 bg-yellow rounded-[8px] text-black font-medium hover:bg-yellow-hover transition"
            onClick={() => alert("Edit Profile (Coming soon)")}
          >
            Edit Profile
          </button>
          <button
            className="px-4 py-2 bg-yellow text-black font-medium rounded-[8px] hover:bg-yellow-hover transition"
            onClick={handleSignOut}
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="mb-8 w-full border-t border-dark"></div>

      <div className="">
        <h3 className="text-lg font-medium text-profile-light mb-8">Favorite Recipes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 md:w-fit justify-self-center lg:grid-cols-3 gap-6">
          {favoriteRecipes && favoriteRecipes.map((recipe) => (
            <div key={recipe.id} className="relative max-w-[330px] w-full h-[328px] ">
            <div
              onClick={() => router.push(`/recipes/${recipe.id}`)}
              className="bg-light-grey rounded-[8px] border border-border-light w-full h-[328px] cursor-pointer overflow-hidden"
            >
              <div className="h-[164px] w-full">
                {recipe.image && <Image src={recipe.image} alt="Recipe" width={330} height={164} className="w-full h-full object-cover" />}
              </div>

              <div className="flex gap-[6px] p-[16px]">
                <div className="max-w-[245px] w-full">
                  <h3 className="text-profile-light font-semibold text-base">{recipe.title}</h3>
                  <p className="text-sm font-normal text-profile-light">{recipe.description}</p>
                  <p className="text-xs text-profile-light font-semibold">{recipe.category}</p>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Image src="/star.svg" alt="Star" width={20} height={20} />
                  <span className="text-xs text-yellow font-semibold">{recipe.rating}</span>
                </div>
              </div>

              <div className='flex justify-between p-[16]'> 
                 <div className='flex gap-[8]'> 
                   <div className='bg-yellow rounded-[8] py-[6] px-[16] text-xs font-medium text-black'>
                     <span className='text-sm font-semibold text-black'>1 hr</span>
                   </div> 
                   <div className='bg-yellow rounded-[8] py-[6] px-[16] text-xs font-medium text-black'>
                     <span className='text-sm font-semibold text-black'>1.5 hr</span>
                   </div> 
                   <div className='bg-yellow rounded-[8] py-[6] px-[16] text-xs font-medium text-black'>
                     <span className='text-sm font-semibold text-black'>2 hr</span>
                   </div> 
                 </div> 
               </div> 
            </div>
          </div>
          ))}
        </div>
      </div>

    </section>
  );
}
