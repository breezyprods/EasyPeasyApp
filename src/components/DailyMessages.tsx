
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, MessageCircle, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/sonner';

interface Message {
  id: string;
  message_text: string;
  sent_at: string;
  read: boolean;
}

const DailyMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user, isGuest } = useAuth();
  
  useEffect(() => {
    const fetchMessages = async () => {
      const userId = user?.id || (isGuest ? '00000000-0000-0000-0000-000000000000' : null);
      
      if (!userId) return;
      
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_messages')
        .select('id, message_text, sent_at, read')
        .eq('user_id', userId)
        .gte('sent_at', today)
        .order('sent_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching daily messages:', error);
        return;
      }
      
      if (data) {
        setMessages(data);
        const unreadMessages = data.filter(message => !message.read).length;
        setUnreadCount(unreadMessages);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('daily_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_messages',
          filter: user?.id 
            ? `user_id=eq.${user.id}` 
            : `user_id=eq.00000000-0000-0000-0000-000000000000`,
        },
        (payload) => {
          if (payload.new) {
            const newMessage = payload.new as Message;
            setMessages((prev) => [newMessage, ...prev].slice(0, 5));
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isGuest]);
  
  const markAsRead = async (messageId: string) => {
    try {
      // Update the message in the database
      const { error } = await supabase
        .from('daily_messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        return;
      }

      // Update local state
      setMessages(prev => 
        prev.map(message => 
          message.id === messageId ? { ...message, read: true } : message
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = user?.id || (isGuest ? '00000000-0000-0000-0000-000000000000' : null);
      if (!userId) return;
      
      const messagesToUpdate = messages
        .filter(message => !message.read)
        .map(message => message.id);
        
      if (messagesToUpdate.length === 0) return;

      // Update all unread messages
      const { error } = await supabase
        .from('daily_messages')
        .update({ read: true })
        .in('id', messagesToUpdate);

      if (error) {
        console.error('Error marking messages as read:', error);
        return;
      }

      // Update local state
      setMessages(prev => 
        prev.map(message => ({ ...message, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      toast.success('All messages marked as read');
      
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };
  
  const handleOpen = () => {
    setIsOpen(true);
    // We don't mark everything as read on open, we'll do it when the user clicks on a specific message
  };

  if (messages.length === 0) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger onClick={handleOpen} className="relative">
        <MessageCircle size={20} className="text-foreground hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] bg-primary text-[10px] flex items-center justify-center"
            variant="default"
          >
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0"
      >
        <div className="p-3 border-b flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <MessageCircle size={16} />
            Daily Motivation
          </h4>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead} 
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-[300px]">
          {messages.length > 0 ? (
            <div className="p-3">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 my-2 rounded-md relative ${!message.read ? 'bg-muted/80 border-l-2 border-primary' : 'bg-muted/40'}`}
                >
                  <p className="text-sm italic pr-6">"{message.message_text}"</p>
                  {!message.read && (
                    <button
                      onClick={() => markAsRead(message.id)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                      title="Mark as read"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <AlertCircle className="mb-2 h-10 w-10 opacity-50" />
              <p className="text-sm">No messages yet today</p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DailyMessages;
