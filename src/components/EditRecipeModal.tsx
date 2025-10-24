'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function EditRecipeModal({ recipe, onClose, onSave }: any) {
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [cuisine, setCuisine] = useState(recipe.cuisine);
  const [rating, setRating] = useState(recipe.rating);

  const handleSave = async () => {
    try {
      const recipeRef = doc(db, 'recipes', recipe.id);
      await updateDoc(recipeRef, {
        title,
        title_lowercase: title.toLowerCase(),
        description,
        cuisine,
        rating: parseFloat(rating),
      });
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating recipe:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-half-transparent flex justify-center items-center z-50">
      <div className="bg-background border border-border-light rounded-[12px] p-[24px] w-[400px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-profile-light mb-4">Edit Recipe</h2>

        <label className="block mb-3">
          <span className="text-sm text-profile-light">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 p-2 border border-profile-light rounded-[8px] bg-transparent text-profile-light focus:outline-none"
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-profile-light">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 p-2 border border-profile-light rounded-[8px] bg-transparent text-profile-light focus:outline-none"
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-profile-light">Cuisine</span>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full mt-1 p-2 border border-profile-light rounded-[8px] bg-transparent text-profile-light focus:outline-none"
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-profile-light">Rating</span>
          <input
            type="number"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full mt-1 p-2 border border-profile-light rounded-[8px] bg-transparent text-profile-light focus:outline-none"
          />
        </label>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-transparent border border-profile-light rounded-[8px] text-profile-light hover:bg-dark-grey transition focus:outline-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-yellow text-black font-medium rounded-[8px] hover:bg-yellow-hover transition focus:outline-none"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
