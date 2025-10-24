'use client';

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDocs, query, where, Query, DocumentData } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EditRecipeModal from '@/components/EditRecipeModal';
import NavBar from '@/components/NavBar';

interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  cuisine: string;
  rating: number;
  image?: string;
  userId?: string;
  [key: string]: unknown;
}

export default function RecipesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [openEditMenuId, setOpenEditMenuId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPrepTimeOpen, setIsPrepTimeOpen] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 6;



  const fetchRecipes = useCallback(async () => {
    try {
      let q: Query<DocumentData> = collection(db, "recipes");
      const filters: ReturnType<typeof where>[] = [];

      if (selectedCategories.length > 0) {
        filters.push(where("category", "in", selectedCategories.slice(0, 10)));
      }

      if (prepTime) {
        switch (prepTime) {
          case "<15": filters.push(where("prepTime", "<", 15)); break;
          case "15-30": filters.push(where("prepTime", ">=", 15), where("prepTime", "<=", 30)); break;
          case "30-60": filters.push(where("prepTime", ">=", 30), where("prepTime", "<=", 60)); break;
          case ">60": filters.push(where("prepTime", ">", 60)); break;
        }
      }

      if (filters.length > 0) q = query(q, ...filters);

      if (searchQuery) {
        const normalizedQuery = searchQuery.toLowerCase();
        q = query(q, where("title_lowercase", ">=", normalizedQuery), where("title_lowercase", "<=", normalizedQuery + "\uf8ff"));
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setRecipes(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }, [selectedCategories, prepTime, searchQuery]);
  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
  
    try {
      await deleteDoc(doc(db, "recipes", recipeId));
      setRecipes(prev => prev.filter(r => r.id !== recipeId)); 
      setOpenEditMenuId(null);
      alert("Recipe deleted successfully!");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe");
    }
  };
  

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push('/auth/signin');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = () => { 
      if (openEditMenuId) setOpenEditMenuId(null); };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openEditMenuId]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;

  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const paginatedRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <main className="min-h-screen bg-background px-12">
      <NavBar onSearch={setSearchQuery} />

      <section className="w-full pb-[48px]">
        <div className="max-w-7xl flex-col lg:flex-row flex gap-[48px] ">

          <aside className="hidden lg:block max-w-[240px] w-auto">
            <span className="text-lg font-medium text-profile-light">Filter by Category</span>
            <button
              onClick={() => { setSelectedCategories([]); setPrepTime(''); setSearchQuery(''); }}
              className="mt-2 px-3 py-1 text-sm font-medium text-black bg-yellow rounded-[8px] hover:bg-yellow-hover transition"
            >
              Clear Filters
            </button>
            <div className="mt-[16]">
              {["Vegan", "Dessert", "Italian", "Breakfast", "Mexican", "Asian"].map(cat => (
                <label key={cat} className="flex items-center gap-2 mb-[14px]">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                    className="appearance-none w-4 h-4 border border-profile-light checked:bg-yellow checked:border-yellow transition cursor-pointer rounded-[4px] bg-transparent"
                  />
                  <span className="text-sm font-medium text-profile-light">{cat}</span>
                </label>
              ))}
            </div>

            <div className="my-[24] w-full border-t border-dark"></div>

            <div className="mt-[48]">
              <span className="text-lg font-medium text-profile-light">Filter by Prep Time</span>
            </div>
            <div className="mt-[16]">
              {[
                { label: "Under 15 mins", value: "<15" },
                { label: "15-30 mins", value: "15-30" },
                { label: "30-60 mins", value: "30-60" },
                { label: "Over 1 hour", value: ">60" },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 mb-[14px]">
                  <input
                    type="radio"
                    name="prep-time"
                    value={opt.value}
                    checked={prepTime === opt.value}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="appearance-none w-4 h-4 border border-profile-light checked:bg-yellow checked:border-yellow transition cursor-pointer rounded-full bg-transparent"
                  />
                  <span className="text-sm font-medium text-profile-light">{opt.label}</span>
                </label>
              ))}
            </div>
          </aside>

          <div className="flex lg:hidden gap-2 justify-between items-center">
            <span className="text-lg font-medium text-profile-light">Filters</span>
            
            <div className="flex gap-2">

              <div className="relative">
                <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="text-sm font-medium text-profile-light p-2 border border-dark rounded-[8px]">Category</button>
                {isCategoryOpen && (
                  <div className="absolute top-full right-0 w-auto h-auto bg-background border border-dark rounded-[8px] mt-2 p-2 z-10">
                  {["Vegan", "Dessert", "Italian", "Breakfast", "Mexican", "Asian"].map(cat => (
                    <label key={cat} className="flex items-center gap-2 mb-[14px]">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="appearance-none w-4 h-4 border border-profile-light checked:bg-yellow checked:border-yellow transition cursor-pointer rounded-[4px] bg-transparent"
                      />
                      <span className="text-sm font-medium text-profile-light">{cat}</span>
                    </label>
                  ))}
                </div>
                )}
              </div>

              <div className="relative">
                <button onClick={() => setIsPrepTimeOpen(!isPrepTimeOpen)} className="text-sm font-medium text-profile-light p-2 border border-dark rounded-[8px]">Prep Time</button>
                {isPrepTimeOpen && (
                  <div className="absolute top-full left-0 w-auto h-auto bg-background border border-dark rounded-[8px] mt-2 p-2 z-10">
                  {[
                    { label: "Under 15 mins", value: "<15" },
                    { label: "15-30 mins", value: "15-30" },
                    { label: "30-60 mins", value: "30-60" },
                    { label: "Over 1 hour", value: ">60" },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 mb-[14px] w-auto">
                      <input
                        type="radio"
                        name="prep-time"
                        value={opt.value}
                        checked={prepTime === opt.value}
                        onChange={(e) => setPrepTime(e.target.value)}
                        className="flex-none appearance-none w-4 h-4 border border-profile-light checked:bg-yellow checked:border-yellow transition cursor-pointer rounded-full bg-transparent"
                      />
                      <span className="text-xs font-normal text-profile-light">{opt.label}</span>
                    </label>
                  ))}
                </div>
                )}
              </div>

              <button
                onClick={() => { setSelectedCategories([]); setPrepTime(''); setSearchQuery(''); }}
                className="p-2 text-sm font-medium text-black bg-yellow rounded-[8px] hover:bg-yellow-hover transition"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 xl:gap-6 md:grid-cols-2 md:gap-6  md:w-fit md:mx-auto grid-cols-1 gap-6 w-full justify-items-center">
            {paginatedRecipes.length > 0 ? (
              paginatedRecipes.map((recipe) => (
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
                       <div className='relative'> 
                         <button onClick={(e) => { e.stopPropagation(); setOpenEditMenuId(openEditMenuId === recipe.id ? null : recipe.id); }} 
                         className='flex items-center justify-center w-[32] h-[32] border border-button-border hover:border-yellow focus:border-yellow transition-colors rounded-[8] cursor-pointer' > 
                           <Image src="/dots.svg" alt="Dots" width={20} height={20} className='h-[20] w-[20]' /> 
                         </button> 
                       </div>
                     </div> 
                  </div>

                  {openEditMenuId === recipe.id && recipe.userId === user?.uid && (
                    <div className="absolute bottom-[-45px] right-0 w-[100px] bg-yellow rounded-[8px] p-1 z-10 shadow-lg">
                      <button
                        onClick={() => setEditingRecipe(recipe)}
                        className="flex items-center gap-[8px] w-full text-left p-1 h-[28px] text-sm text-black font-medium hover:bg-yellow-hover transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation();
                          handleDeleteRecipe(recipe.id); 
                          setOpenEditMenuId(null); }}
                        className="flex items-center gap-[8px] w-full text-left p-1 h-[28px] text-sm text-black font-medium hover:bg-yellow-hover transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-profile-light col-span-3">No recipes found</div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded transition ${currentPage === page ? 'bg-yellow text-black' : 'bg-light-grey text-profile-light hover:bg-yellow-hover'}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {editingRecipe && <EditRecipeModal recipe={editingRecipe} onClose={() => setEditingRecipe(null)} onSave={() => window.location.reload()} />}
      </section>
    </main>
  );
}
