
import { supabase } from '@/integrations/supabase/client';

export interface JournalEntry {
  id?: string;
  title: string | null;
  entry: string | null;
  date: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

// Get all journal entries for a user
export const getJournalEntries = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

// Create a new journal entry
export const createJournalEntry = async (userId: string, entry: Omit<JournalEntry, 'id' | 'user_id'>) => {
  try {
    const { data, error } = await supabase
      .from('journals')
      .insert({
        user_id: userId,
        ...entry,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

// Update an existing journal entry
export const updateJournalEntry = async (entryId: string, entry: Partial<JournalEntry>) => {
  try {
    const { data, error } = await supabase
      .from('journals')
      .update({
        ...entry,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};

// Delete a journal entry
export const deleteJournalEntry = async (entryId: string) => {
  try {
    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', entryId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// Save journal entry for guest user
export const saveGuestJournalEntry = (entry: JournalEntry) => {
  try {
    const storedEntries = localStorage.getItem('guestJournalEntries');
    let entries: JournalEntry[] = storedEntries ? JSON.parse(storedEntries) : [];
    
    if (entry.id) {
      // Update existing entry
      entries = entries.map(e => e.id === entry.id ? entry : e);
    } else {
      // Create new entry
      const newEntry = {
        ...entry,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      entries = [newEntry, ...entries];
    }
    
    localStorage.setItem('guestJournalEntries', JSON.stringify(entries));
    return entry.id ? entry : entries[0];
  } catch (error) {
    console.error('Error saving guest journal entry:', error);
    throw error;
  }
};

// Get all journal entries for a guest user
export const getGuestJournalEntries = (): JournalEntry[] => {
  try {
    const storedEntries = localStorage.getItem('guestJournalEntries');
    return storedEntries ? JSON.parse(storedEntries) : [];
  } catch (error) {
    console.error('Error fetching guest journal entries:', error);
    return [];
  }
};

// Delete a guest journal entry
export const deleteGuestJournalEntry = (entryId: string) => {
  try {
    const storedEntries = localStorage.getItem('guestJournalEntries');
    if (!storedEntries) return false;
    
    const entries = JSON.parse(storedEntries);
    const filteredEntries = entries.filter((e: JournalEntry) => e.id !== entryId);
    
    localStorage.setItem('guestJournalEntries', JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error('Error deleting guest journal entry:', error);
    return false;
  }
};
