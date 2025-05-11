
import { supabase } from '@/integrations/supabase/client';
import { useProgress } from '@/contexts/ProgressContext';

export interface UserProgress {
  id?: string;
  user_id: string;
  chapter_number: number;
  completed_at: string;
}

// Sync local progress to Supabase when logged in
export const syncProgressToSupabase = async (userId: string, completedChapters: number[]) => {
  // Skip if no completed chapters
  if (!completedChapters.length) return { added: 0 };
  
  try {
    // Get existing progress entries
    const { data: existingEntries } = await supabase
      .from('user_progress')
      .select('chapter_number')
      .eq('user_id', userId);
    
    const existingChapters = existingEntries?.map(entry => entry.chapter_number) || [];
    
    // Find chapters to add (in local but not in DB)
    const chaptersToAdd = completedChapters.filter(
      chapter => !existingChapters.includes(chapter)
    );
    
    // If no chapters to add, return
    if (!chaptersToAdd.length) return { added: 0 };
    
    // Create progress entries for new chapters
    const entries = chaptersToAdd.map(chapter_number => ({
      user_id: userId,
      chapter_number,
      completed_at: new Date().toISOString(),
    }));
    
    // Insert new progress entries
    const { error } = await supabase
      .from('user_progress')
      .insert(entries);
    
    if (error) throw error;
    
    return { added: chaptersToAdd.length };
  } catch (error) {
    console.error('Error syncing progress to Supabase:', error);
    throw error;
  }
};

// Get user progress from Supabase
export const getProgressFromSupabase = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('chapter_number')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return data?.map(entry => entry.chapter_number) || [];
  } catch (error) {
    console.error('Error fetching progress from Supabase:', error);
    throw error;
  }
};

// Check and update milestone emails
export const checkAndUpdateMilestones = async (userId: string, chapter: number) => {
  const milestoneChapters = [5, 10, 20];
  
  if (!milestoneChapters.includes(chapter)) {
    return false; // Not a milestone chapter
  }
  
  try {
    // Check if milestone already sent
    const { data, error } = await supabase
      .from('milestones_sent')
      .select('*')
      .eq('user_id', userId)
      .eq('chapter', chapter)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }
    
    if (data) {
      return false; // Milestone already recorded
    }
    
    // Record the milestone
    const { error: insertError } = await supabase
      .from('milestones_sent')
      .insert({
        user_id: userId,
        chapter,
      });
    
    if (insertError) throw insertError;
    
    // Trigger milestone email via edge function
    try {
      // Fix: Using the correct way to access Supabase URL and key
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dvmghvscfwvigfpmzujx.supabase.co';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-milestone-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2bWdodnNjZnd2aWdmcG16dWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyOTkyNzcsImV4cCI6MjA2MTg3NTI3N30.PjpH1tRhybzsB7SIdukVdBZP2yklgFzjgYVPYtTb9Ks'}`,
        },
        body: JSON.stringify({
          userId,
          chapter,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to trigger milestone email: ${response.status}`);
      }
      
      return true; // Milestone successfully recorded and email triggered
    } catch (emailError) {
      console.error('Error triggering milestone email:', emailError);
      return false;
    }
  } catch (error) {
    console.error('Error checking/recording milestone:', error);
    return false;
  }
};

// Update user completion date when Chapter 20 is completed
export const updateCompletionDate = async (userId: string, chapter: number) => {
  if (chapter !== 20) return false;
  
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('completion_date')
      .eq('id', userId)
      .single();
    
    // If already has completion date, don't update
    if (data?.completion_date) return false;
    
    // Update completion date
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        completion_date: new Date().toISOString(),
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error updating completion date:', error);
    return false;
  }
};
