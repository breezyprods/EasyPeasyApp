
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Challenge {
  id: number;
  text: string;
}

const DailyChallenge = () => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);
  
  const { toast } = useToast();
  const { user, isGuest } = useAuth();
  
  useEffect(() => {
    fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const fetchChallenge = async () => {
    setLoading(true);
    
    try {
      // Get today's date in YYYY-MM-DD format for comparison
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Get a random challenge for today based on the date
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Use the day of year to pick a challenge (cycling through the challenges)
        const challengeIndex = dayOfYear % data.length;
        setChallenge(data[challengeIndex]);
      }
      
      // Check if user has completed today's challenge
      if (user || isGuest) {
        const userId = user?.id || (isGuest ? 'guest' : null);
        
        if (userId) {
          const { data: pointsData } = await supabase
            .from('user_points')
            .select('last_completed, total_points')
            .eq('user_id', userId)
            .single();
          
          if (pointsData) {
            setPoints(pointsData.total_points || 0);
            
            // Check if the challenge was completed today
            if (pointsData.last_completed === todayString) {
              setCompleted(true);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const completeChallenge = async () => {
    if (completed) return;
    
    try {
      const userId = user?.id || (isGuest ? 'guest' : null);
      
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please sign in or continue as guest to track your progress",
        });
        return;
      }
      
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      // Get current points
      const { data: existingData } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();
      
      const currentPoints = existingData?.total_points || 0;
      const newPoints = currentPoints + 10;
      
      // Upsert points
      const { error } = await supabase
        .from('user_points')
        .upsert({
          user_id: userId,
          total_points: newPoints,
          last_completed: todayString
        });
      
      if (error) throw error;
      
      setPoints(newPoints);
      setCompleted(true);
      
      toast({
        title: "Challenge completed!",
        description: "You've earned 10 points for today's challenge.",
      });
      
      // Check if reached milestone (every 100 points)
      if (Math.floor(newPoints / 100) > Math.floor(currentPoints / 100)) {
        setShowMilestone(true);
      }
      
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast({
        title: "Error",
        description: "Failed to mark challenge as complete",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden border-2">
      <div className="bg-ep-yellow p-4 flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <Trophy size={18} className="mr-2" />
          Daily Mindful Challenge
        </h3>
        <span className="text-sm font-medium">+10 points</span>
      </div>
      
      <div className="p-6">
        {challenge ? (
          <>
            <p className="text-lg mb-6">{challenge.text}</p>
            
            <div className="flex justify-center">
              {completed ? (
                <Button disabled variant="outline" className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Completed Today
                </Button>
              ) : (
                <Button onClick={completeChallenge} className="flex items-center gap-2">
                  Mark as Complete
                </Button>
              )}
            </div>
            
            {showMilestone && (
              <Alert className="mt-4 bg-ep-green border-green-300">
                <AlertDescription>
                  You've earned {Math.floor(points / 100) * 100} clarity points. Stay free, stay clear.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground">No challenge available today. Check back tomorrow!</p>
        )}
      </div>
    </Card>
  );
};

export default DailyChallenge;
