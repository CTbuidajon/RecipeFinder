'use client';

import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface NewRecipeModalProps {
  onClose: () => void;
}

export default function NewRecipeModal({ onClose}: NewRecipeModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [rating, setRating] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleAddInstruction = () => setInstructions([...instructions, '']);

  const handleIngredientChange = (i: number, value: string) => {
    const updated = [...ingredients];
    updated[i] = value;
    setIngredients(updated);
  };

  const handleInstructionChange = (i: number, value: string) => {
    const updated = [...instructions];
    updated[i] = value;
    setInstructions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please sign in first.');
        router.push('/auth/signin');
        return;
      }

      await addDoc(collection(db, 'recipes'), {
        title,
        title_lowercase: title.toLowerCase(),
        description,
        category,
        cuisine,
        prepTime: Number(prepTime),
        rating: Number(rating),
        ingredients: ingredients.filter(i => i.trim() !== ''),
        instructions: instructions.filter(i => i.trim() !== ''),
        image: image,
        author: user.displayName || user.email,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      alert('Recipe added successfully!');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Error adding recipe. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-half-transparent flex items-center justify-center z-10">
      <div className="bg-background rounded-2xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4 p-8 relative">
        <div className="flex justify-between items-center mb-8"> 
          <h1 className="text-4xl font-semibold text-profile-light">Create a New Recipe</h1>
          <button  className="text-profile-light text-2xl font-semibold hover:text-yellow-hover transition" onClick={onClose}>
            x
          </button>
        </div>
      

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div>
            <label className="block text-profile-light font-medium mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-dark rounded-[12px] p-3 bg-transparent text-profile-light focus:outline-none"
              placeholder="Lemon Drizzle Cake"
              required
            />
          </div>

          <div>
            <label className="block text-profile-light font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-dark rounded-[12px] p-3 bg-transparent text-profile-light focus:outline-none"
              rows={4}
              placeholder="A classic lemon cake with a tangy drizzle."
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-profile-light font-medium mb-2">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-dark rounded-[12px] p-3 bg-transparent text-profile-light focus:outline-none"
                placeholder="Dessert"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-profile-light font-medium mb-2">Cuisine</label>
              <input
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full border border-dark rounded-[12px] p-3 bg-transparent text-profile-light focus:outline-none"
                placeholder="British"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-profile-light font-medium mb-2">Prep time (minutes)</label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full border border-dark rounded-[12px] p-3 bg-transparent text-profile-light focus:outline-none"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-profile-light font-medium mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                max="5"
                value={rating}
                onChange={(e) => setRating(String(e.target.value))}
                className="w-full border border-dark rounded-[12px] p-3 bg-transparent text-profile-light focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-profile-light font-medium mb-2">Ingredients</label>
            {ingredients.map((ingredient, i) => (
              <input
                key={i}
                value={ingredient}
                onChange={(e) => handleIngredientChange(i, e.target.value)}
                className="w-full border border-dark rounded-[12px] p-3 bg-transparent text-profile-light mb-2 focus:outline-none"
                placeholder={`Ingredient ${i + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="text-yellow font-semibold hover:underline"
            >
              + Add Ingredient
            </button>
          </div>

          <div>
            <label className="block text-profile-light font-medium mb-2">Instructions</label>
            {instructions.map((instruction, i) => (
              <textarea
                key={i}
                value={instruction}
                onChange={(e) => handleInstructionChange(i, e.target.value)}
                className="w-full border border-dark rounded-[12px] p-3 bg-transparent text-profile-light mb-2 focus:outline-none"
                rows={2}
                placeholder={`Step ${i + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={handleAddInstruction}
              className="text-yellow font-semibold hover:underline"
            >
              + Add Step
            </button>
          </div>

          <div>
            <label className="block text-profile-light font-medium mb-2">Image</label>
            <input
              type="text"
              name="image"
              placeholder="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full border border-dark rounded-[12px] p-3 bg-transparent text-profile-light mb-2 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-yellow hover:bg-yellow-hover text-black font-semibold rounded-[12px] px-6 py-3 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Recipe'}
          </button>
        </form>
      </div>
    </div>
  );
}
