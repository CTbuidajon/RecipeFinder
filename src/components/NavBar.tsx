'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import NewRecipeModal from "./NewRecipeModal";

interface NavBarProps {
  onSearch?: (query: string) => void;
}

export default function NavBar({ onSearch }: NavBarProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openNewRecipeModal, setOpenNewRecipeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, onSearch]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => { 
      if (isDropdownOpen) setIsDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-xl text-profile-light">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <nav className="w-full bg-background flex justify-between items-center h-24">
        <div className="flex items-center gap-[24px]">
          <div className="cursor-pointer " onClick={() => router.push('/recipes')}>
            <Image src="/logo.svg" alt="RecipeFinder" width={184} height={32} />
          </div>
          <div className="hidden lg:block w-[180px] md:w-[240px] lg:w-[300px] xl:w-[400px] transition-all duration-300">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full p-3 rounded-[12px] border border-dark placeholder-grey text-foreground focus:outline-none"
            />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-[24px] max-w-[440px] ">
          <div>
            <Image src="/bell.svg" alt="Notifications" width={24} height={24} />
          </div>

          <div className="relative flex items-center gap-[12px] bg-light-grey rounded-[12px] px-[16px] py-[4px] h-[48px] ">
            <Image src="/user.svg" alt="User" width={36} height={36} />
            <div className="flex flex-col">
              <span className="text-profile-light text-lg font-medium">
                {user?.displayName || user?.email}
              </span>
              <span className="text-profile-grey text-sm font-medium">Pastry Chef</span>
            </div>
            <button
              className="flex items-center justify-center w-[24px] h-[24px] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <Image src="/arrow-down.svg" alt="Arrow Down" width={12} height={6} className='scale-y-[-1]'/>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-full bg-yellow rounded-[8px] p-1 z-10 shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/account");
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-[8px] w-full text-left p-1 h-[28px] text-sm text-black font-medium hover:bg-yellow-hover transition"
                >
                  <Image src="/settings.svg" alt="Settings" width={16} height={16} />
                  <span>Settings</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignOut();
                  }}
                  className="flex items-center gap-[8px] w-full text-left p-1 h-[28px] text-sm text-black font-medium hover:bg-yellow-hover transition"
                >
                  <Image src="/log-out.svg" alt="Log Out" width={16} height={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setOpenNewRecipeModal(!openNewRecipeModal)}
            className="flex items-center gap-[6px] px-[16px] py-[12px] text-sm font-medium text-black bg-yellow hover:bg-yellow-hover rounded-[12px] transition-colors"
          >
            <Image src="/add-icon.svg" alt="add" width={14} height={14} />
            <span className="text-lg text-black font-medium">New post</span>
          </button>
        </div>

        <div className="flex lg:hidden items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-yellow hover:bg-yellow-hover transition"
          >
            <Image src="/menu-icon.svg" alt="Menu" width={24} height={24} />
          </button>

          {isMobileMenuOpen && (
            <div className="absolute top-20 right-4 bg-background border border-dark rounded-[12px] shadow-lg p-4 z-5 w-[200px]">
              <div className="relative flex items-center gap-[12px] bg-light-grey rounded-[12px] px-[16px] py-[4px] h-auto ">
                <Image src="/user.svg" alt="User" width={36} height={36} />
                <div className="flex flex-col">
                  <span className="text-profile-light text-lg font-medium">
                    {user?.displayName || user?.email}
                  </span>
                  <span className="text-profile-grey text-sm font-medium">Pastry Chef</span>
                </div>
              </div>
              <div className="w-full mt-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full p-3 rounded-[12px] border border-dark placeholder-grey text-foreground focus:outline-none"
                />
              </div>
              <button
                onClick={() => setOpenNewRecipeModal(true)}
                className="flex items-center gap-2 w-full text-left text-black mt-2 p-2 bg-yellow rounded-[12px] hover:bg-yellow-hover transition"
              >
                <Image src="/add-icon.svg" alt="add" width={14} height={14} />
                <span>New post</span>
              </button>

              <button
                onClick={() => router.push("/account")}
                className="flex items-center gap-2 w-full text-left text-profile-light py-2 hover:text-yellow transition"
              >
                <Image src="/settings.svg" alt="Settings" width={16} height={16} />
                <span>Settings</span>
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full text-left text-profile-light py-2 hover:text-yellow transition"
              >
                <Image src="/log-out.svg" alt="Log Out" width={16} height={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>

      </nav>

      <div className="mb-8 w-full border-t border-dark"></div>

      {openNewRecipeModal && <NewRecipeModal onClose={() => setOpenNewRecipeModal(false)} />}
    </>
  );
}

