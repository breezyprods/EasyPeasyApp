
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Tag, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import UpgradePrompt from '@/components/UpgradePrompt';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  getJournalEntries, 
  createJournalEntry, 
  updateJournalEntry, 
  deleteJournalEntry,
  getGuestJournalEntries,
  saveGuestJournalEntry,
  deleteGuestJournalEntry,
  JournalEntry
} from '@/services/journalService';

const JournalPage = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  
  // Redirect if not logged in (but allow guest mode)
  useEffect(() => {
    if (!user && !isGuest) {
      navigate('/auth');
    }
  }, [user, isGuest, navigate]);
  
  // Fetch entries
  useEffect(() => {
    if (user || isGuest) {
      fetchEntries();
    }
  }, [user, isGuest]);
  
  const fetchEntries = async () => {
    if (isGuest) {
      const guestEntries = getGuestJournalEntries();
      setEntries(guestEntries);
      setIsLoading(false);
      return;
    }
    
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await getJournalEntries(user.id);
      setEntries(data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch journal entries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const resetForm = () => {
    setSelectedEntry(null);
    setTitle('');
    setEntry('');
    setDate(new Date());
    setTags([]);
    setTagInput('');
  };
  
  const handleOpenSheet = (existingEntry?: JournalEntry) => {
    if (existingEntry) {
      setSelectedEntry(existingEntry);
      setTitle(existingEntry.title || '');
      setEntry(existingEntry.entry || '');
      setDate(new Date(existingEntry.date));
      setTags(existingEntry.tags || []);
    } else {
      resetForm();
    }
    setIsSheetOpen(true);
  };
  
  const handleSaveEntry = async () => {
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Handle guest mode
      if (isGuest) {
        const entryData: JournalEntry = {
          title,
          entry,
          date: formattedDate,
          tags,
        };
        
        if (selectedEntry?.id) {
          entryData.id = selectedEntry.id;
        }
        
        const savedEntry = saveGuestJournalEntry(entryData);
        
        if (selectedEntry) {
          setEntries(entries.map(e => e.id === selectedEntry.id ? savedEntry : e));
        } else {
          setEntries([savedEntry, ...entries]);
        }
        
        toast({
          title: selectedEntry ? 'Entry Updated' : 'Entry Added',
          description: 'Your journal entry has been saved locally.',
        });
        
        setIsSheetOpen(false);
        resetForm();
        return;
      }
      
      // Handle authenticated user
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to save entries',
          variant: 'destructive',
        });
        return;
      }
      
      if (selectedEntry?.id) {
        // Update existing entry
        const updatedEntry = await updateJournalEntry(selectedEntry.id, {
          title,
          entry,
          date: formattedDate,
          tags,
        });
        
        setEntries(entries.map(e => e.id === selectedEntry.id ? updatedEntry : e));
        
        toast({
          title: 'Entry Updated',
          description: 'Your journal entry has been updated',
        });
      } else {
        // Create new entry
        const newEntry = await createJournalEntry(user.id, {
          title,
          entry,
          date: formattedDate,
          tags,
        });
        
        setEntries([newEntry, ...entries]);
        
        toast({
          title: 'Entry Added',
          description: 'Your journal entry has been saved',
        });
      }
      
      setIsSheetOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your journal entry',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteEntry = async () => {
    if (!selectedDeleteId) return;
    
    setIsDeleting(true);
    
    try {
      if (isGuest) {
        const success = deleteGuestJournalEntry(selectedDeleteId);
        if (success) {
          setEntries(entries.filter(e => e.id !== selectedDeleteId));
        }
      } else if (user) {
        await deleteJournalEntry(selectedDeleteId);
        setEntries(entries.filter(e => e.id !== selectedDeleteId));
      }
      
      toast({
        title: 'Entry Deleted',
        description: 'Your journal entry has been removed',
      });
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete your journal entry',
        variant: 'destructive',
      });
    } finally {
      setSelectedDeleteId(null);
      setIsDeleting(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <UpgradePrompt />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">Your Journal</h1>
          
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={() => handleOpenSheet()}>
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{selectedEntry ? 'Edit Entry' : 'New Journal Entry'}</SheetTitle>
                <SheetDescription>
                  Record your thoughts and reflections
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(newDate) => newDate && setDate(newDate)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    placeholder="Title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Entry
                  </label>
                  <Textarea
                    placeholder="Write your thoughts..."
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tags
                  </label>
                  <div className="flex items-center mb-2">
                    <Input
                      placeholder="Add tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={handleAddTag}
                    >
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <div
                          key={tag}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            className="ml-1 text-secondary-foreground/80 hover:text-secondary-foreground"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEntry}>
                    {selectedEntry ? 'Update Entry' : 'Save Entry'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-ep-gray rounded-lg">
            <h3 className="text-lg font-medium mb-2">No Journal Entries Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start writing about your journey and track your progress
            </p>
            <Button onClick={() => handleOpenSheet()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Entry
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                className="p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      {entry.title || "Untitled Entry"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSheet(entry)}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDeleteId(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2 whitespace-pre-wrap">
                  {entry.entry || <span className="text-muted-foreground italic">No content</span>}
                </div>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <div
                        key={tag}
                        className="bg-secondary/50 px-2 py-0.5 rounded-md text-xs"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
        
        <AlertDialog 
          open={!!selectedDeleteId} 
          onOpenChange={(open) => !open && setSelectedDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this journal entry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteEntry}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default JournalPage;
