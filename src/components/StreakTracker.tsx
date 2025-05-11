
import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from 'lucide-react';

const StreakTracker = () => {
  const { user } = useAuth();
  const [streakDays, setStreakDays] = useState(0);
  const [completionDate, setCompletionDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchCompletionDate();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (completionDate) {
      calculateStreak();
    }
  }, [completionDate]);
  
  const fetchCompletionDate = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('completion_date')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      
      setCompletionDate(data?.completion_date || null);
    } catch (error) {
      console.error('Error fetching completion date:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateStreak = () => {
    if (!completionDate) {
      setStreakDays(0);
      return;
    }
    
    const start = new Date(completionDate);
    const today = new Date();
    const days = differenceInDays(today, start) + 1; // +1 to include the completion day
    setStreakDays(Math.max(0, days));
  };
  
  if (isLoading) {
    return <div className="bg-ep-green/50 p-3 rounded-lg text-center">Loading...</div>;
  }
  
  if (!completionDate) {
    return null; // Don't show the streak tracker if user hasn't completed the journey
  }
  
  return (
    <div className="bg-ep-green p-4 rounded-lg text-center">
      <div className="flex items-center justify-center mb-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left">
          <h3 className="font-medium">Your Streak</h3>
          <p className="text-sm text-muted-foreground">
            Since {format(new Date(completionDate), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      <div className="text-3xl font-bold mb-1">
        {streakDays} {streakDays === 1 ? 'day' : 'days'}
      </div>
      <div className="text-sm font-medium">Clean and free!</div>
    </div>
  );
};

export default StreakTracker;
