
import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPointsProps {
  className?: string;
}

const UserPoints: React.FC<UserPointsProps> = ({ className }) => {
  const [points, setPoints] = useState(0);
  const { user, isGuest } = useAuth();
  
  useEffect(() => {
    const fetchPoints = async () => {
      const userId = user?.id || (isGuest ? '00000000-0000-0000-0000-000000000000' : null);
      
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();
      
      if (!error && data) {
        setPoints(data.total_points || 0);
      }
    };
    
    fetchPoints();
    
    // Set up realtime subscription for points updates
    const channel = supabase
      .channel('user_points_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_points',
          filter: user?.id 
            ? `user_id=eq.${user.id}` 
            : `user_id=eq.00000000-0000-0000-0000-000000000000`,
        },
        (payload: any) => {
          if (payload.new && payload.new.total_points !== undefined) {
            setPoints(payload.new.total_points);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isGuest]);
  
  if (points === 0) return null;
  
  return (
    <Badge variant="outline" className={`bg-primary/20 text-primary border-primary/30 font-medium ${className}`}>
      {points} points
    </Badge>
  );
};

export default UserPoints;
