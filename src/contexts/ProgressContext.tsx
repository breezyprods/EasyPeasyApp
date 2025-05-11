
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { 
  syncProgressToSupabase,
  getProgressFromSupabase,
  checkAndUpdateMilestones,
  updateCompletionDate
} from '@/services/progressService';

interface ProgressContextType {
  completedChapters: number[];
  completeChapter: (chapterId: number) => void;
  isChapterCompleted: (chapterId: number) => boolean;
  resetProgress: () => void;
  progressPercentage: number;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  
  return context;
};

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const TOTAL_CHAPTERS = 20;
  
  // Load progress from localStorage or Supabase depending on auth state
  useEffect(() => {
    loadProgress();
  }, [user, isGuest]);
  
  // Sync progress to Supabase when auth state or completed chapters change
  useEffect(() => {
    if (user && !isGuest && completedChapters.length > 0) {
      syncProgressToSupabase(user.id, completedChapters)
        .then(result => {
          if (result.added > 0) {
            console.log(`Synced ${result.added} completed chapters to Supabase`);
          }
        })
        .catch(error => {
          console.error('Error syncing progress to Supabase:', error);
        });
    }
  }, [user, isGuest, completedChapters]);
  
  const loadProgress = async () => {
    if (user && !isGuest) {
      try {
        // Load progress from Supabase
        const chapters = await getProgressFromSupabase(user.id);
        setCompletedChapters(chapters);
      } catch (error) {
        console.error('Failed to load progress from Supabase:', error);
        // Fall back to localStorage if Supabase fails
        const savedProgress = localStorage.getItem('easyPeasy-progress');
        if (savedProgress) {
          try {
            setCompletedChapters(JSON.parse(savedProgress));
          } catch (error) {
            console.error('Failed to parse progress data:', error);
            localStorage.removeItem('easyPeasy-progress');
          }
        }
      }
    } else {
      // Load progress from localStorage for guest users or when not authenticated
      const savedProgress = localStorage.getItem('easyPeasy-progress');
      if (savedProgress) {
        try {
          setCompletedChapters(JSON.parse(savedProgress));
        } catch (error) {
          console.error('Failed to parse progress data:', error);
          localStorage.removeItem('easyPeasy-progress');
        }
      }
    }
  };
  
  const completeChapter = async (chapterId: number) => {
    setCompletedChapters(prev => {
      const isCompleting = !prev.includes(chapterId);
      let newCompletedChapters: number[];
      
      if (isCompleting) {
        newCompletedChapters = [...prev, chapterId].sort((a, b) => a - b);
        
        // Check for milestone if this is a new completion
        if (user && !isGuest) {
          // Check for milestone chapters (5, 10, 20)
          checkAndUpdateMilestones(user.id, chapterId).catch(console.error);
          
          // If chapter 20, update completion date
          if (chapterId === 20) {
            updateCompletionDate(user.id, chapterId).catch(console.error);
          }
        }
      } else {
        newCompletedChapters = prev.filter(id => id !== chapterId);
      }
      
      // Always save to localStorage as backup
      localStorage.setItem('easyPeasy-progress', JSON.stringify(newCompletedChapters));
      
      return newCompletedChapters;
    });
  };
  
  const isChapterCompleted = (chapterId: number): boolean => {
    return completedChapters.includes(chapterId);
  };
  
  const resetProgress = () => {
    if (window.confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
      setCompletedChapters([]);
      localStorage.removeItem('easyPeasy-progress');
      
      toast({
        title: "Progress Reset",
        description: "Your progress has been reset successfully.",
      });
    }
  };
  
  const progressPercentage = (completedChapters.length / TOTAL_CHAPTERS) * 100;
  
  return (
    <ProgressContext.Provider
      value={{
        completedChapters,
        completeChapter,
        isChapterCompleted,
        resetProgress,
        progressPercentage
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
