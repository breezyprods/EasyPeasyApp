
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { MessageCirclePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Template {
  id: number;
  text: string;
}

const SendMessageModal = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const { user, isGuest } = useAuth();
  
  // Fetch templates when dialog opens
  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    
    if (isOpen && templates.length === 0) {
      const { data, error } = await supabase
        .from('motivational_templates')
        .select('id, text');
        
      if (error) {
        console.error('Error fetching templates:', error);
        toast.error('Could not load message templates');
        return;
      }
      
      if (data) {
        setTemplates(data);
        if (data.length > 0) setSelectedTemplate(data[0].id);
      }
    }
    
    // Reset state when modal is closed
    if (!isOpen) {
      setSelectedTemplate(null);
      setHasSent(false);
    }
  };
  
  const sendMessage = async () => {
    if (!selectedTemplate || (!user && !isGuest)) return;
    
    setLoading(true);
    
    try {
      // Get the current user ID (for filtering)
      const currentUserId = user?.id || '00000000-0000-0000-0000-000000000000';
      
      // Get all users except the current one
      const { data: allUsers, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .neq('id', currentUserId)
        .limit(100);
        
      if (userError) throw userError;
      
      if (!allUsers || allUsers.length === 0) {
        // Handle the case when no other users are available
        // Insert a message to the current user instead (simulating another user sending a message)
        const selectedMessage = templates.find(t => t.id === selectedTemplate);
        if (!selectedMessage) throw new Error('Selected message not found');
        
        const { error: insertError } = await supabase
          .from('daily_messages')
          .insert({
            user_id: currentUserId,
            message_text: selectedMessage.text + " (This is your own encouragement sent to yourself because you're the only user at the moment)",
          });
          
        if (insertError) throw insertError;
        
        toast.success('Encouragement sent!');
        setHasSent(true);
        setTimeout(() => setOpen(false), 2000);
        return;
      }
      
      // Select a random user
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      
      // Get the selected template text
      const selectedMessage = templates.find(t => t.id === selectedTemplate);
      if (!selectedMessage) throw new Error('Selected message not found');
      
      // Insert the message
      const { error: insertError } = await supabase
        .from('daily_messages')
        .insert({
          user_id: randomUser.id,
          message_text: selectedMessage.text,
        });
        
      if (insertError) throw insertError;
      
      toast.success('Encouragement sent anonymously!');
      setHasSent(true);
      setTimeout(() => setOpen(false), 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Could not send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!user && !isGuest) return null;
  
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs gap-1 hover:bg-primary hover:text-primary-foreground"
        >
          <MessageCirclePlus size={16} />
          <span className="hidden sm:inline">Encourage someone</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Anonymous Encouragement</DialogTitle>
          <DialogDescription>
            Choose a message to send to someone who might need it today.
            It will be delivered anonymously.
          </DialogDescription>
        </DialogHeader>
        
        {hasSent ? (
          <div className="py-6 text-center space-y-2">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm font-medium">Your encouragement has been sent!</p>
            <p className="text-xs text-muted-foreground">Thank you for spreading positivity today.</p>
          </div>
        ) : (
          <div className="py-4">
            <RadioGroup value={selectedTemplate?.toString()} onValueChange={(val) => setSelectedTemplate(parseInt(val))}>
              {templates.map((template) => (
                <div key={template.id} className="flex items-start space-x-2 mb-3">
                  <RadioGroupItem 
                    value={template.id.toString()} 
                    id={`template-${template.id}`}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={`template-${template.id}`}
                    className="text-sm font-normal leading-relaxed"
                  >
                    "{template.text}"
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={sendMessage} 
            disabled={!selectedTemplate || loading || hasSent}
            className={hasSent ? "hidden" : ""}
          >
            {loading ? "Sending..." : "Send Encouragement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageModal;
