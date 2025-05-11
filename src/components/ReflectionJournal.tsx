import React, { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserPoints from './UserPoints';

interface JournalEntry {
  id?: string;
  date: string;
  title?: string;
  entry?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

const ReflectionJournal = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = React.useState(false)

  useEffect(() => {
    if (user || isGuest) {
      fetchJournalEntry();
      fetchAllTags();
    }
  }, [date, user, isGuest]);

  const fetchJournalEntry = async () => {
    setLoading(true);
    try {
      const userId = user?.id || 'guest';
      const formattedDate = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', userId)
        .eq('date', formattedDate)
        .single();

      if (error) {
        console.error("Error fetching journal entry:", error);
        return;
      }

      setJournalEntry(data);
      setTitle(data?.title || '');
      setEntry(data?.entry || '');
      setTags(data?.tags || []);
    } catch (error) {
      console.error("Unexpected error fetching journal entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTags = async () => {
    try {
      const userId = user?.id || 'guest';
      const { data, error } = await supabase
        .from('journals')
        .select('tags')
        .eq('user_id', userId);

      if (error) {
        console.error("Error fetching all tags:", error);
        return;
      }

      // Extract all unique tags from the entries
      const allTagsArray = data.reduce((acc: string[], entry) => {
        if (entry.tags && Array.isArray(entry.tags)) {
          entry.tags.forEach(tag => {
            if (!acc.includes(tag)) {
              acc.push(tag);
            }
          });
        }
        return acc;
      }, []);

      setAllTags(allTagsArray);
    } catch (error) {
      console.error("Unexpected error fetching all tags:", error);
    }
  };

  const saveJournalEntry = async () => {
    setLoading(true);
    try {
      const userId = user?.id || 'guest';
      const formattedDate = format(date, 'yyyy-MM-dd');

      const entryData = {
        date: formattedDate,
        title,
        entry,
        tags,
        user_id: userId,
      };

      if (journalEntry?.id) {
        // Update existing entry
        const { error } = await supabase
          .from('journals')
          .update(entryData)
          .eq('id', journalEntry.id);

        if (error) {
          console.error("Error updating journal entry:", error);
          toast({
            title: "Error",
            description: "Failed to update journal entry.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success",
          description: "Journal entry updated successfully.",
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journals')
          .insert({
            ...entryData,
            id: generateId(),
          });

        if (error) {
          console.error("Error creating journal entry:", error);
          toast({
            title: "Error",
            description: "Failed to create journal entry.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success",
          description: "Journal entry created successfully.",
        });
      }

      // Refresh the journal entries and tags
      fetchJournalEntry();
      fetchAllTags();
    } catch (error) {
      console.error("Unexpected error saving journal entry:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const handleTagChange = (newTags: string[]) => {
    setTags(newTags);
  };

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Calendar and Tags Section */}
      <div className="md:col-span-1">
        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date() || date < subDays(new Date(), 365)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Tag Management */}
        <div>
          <Label htmlFor="tags" className="text-sm font-bold mb-2 block">
            Tags
          </Label>
          <Command className="rounded-md border">
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup heading="Tags">
                {allTags.map((tag) => (
                  <CommandItem
                    key={tag}
                    onSelect={() => {
                      if (tags.includes(tag)) {
                        handleTagChange(tags.filter((t) => t !== tag));
                      } else {
                        handleTagChange([...tags, tag]);
                      }
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        tags.includes(tag) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Suggestions">
                {tags.map((tag) => (
                  <CommandItem
                    key={tag}
                    onSelect={() => {
                      handleTagChange(tags.filter((t) => t !== tag));
                      setOpen(false)
                    }}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-100" />
                    {tag} (Remove)
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
        <div className="mt-4">
          <UserPoints />
        </div>
      </div>

      {/* Journal Entry Section */}
      <div className="md:col-span-3">
        <Label htmlFor="title" className="text-sm font-bold">Title</Label>
        <Input
          type="text"
          id="title"
          placeholder="Title your reflection"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4"
        />

        <Label htmlFor="entry" className="text-sm font-bold">Entry</Label>
        <Textarea
          id="entry"
          placeholder="Write your thoughts and reflections here..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          className="mb-4 h-96 resize-none"
        />

        <Button
          onClick={saveJournalEntry}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Entry'}
        </Button>
      </div>
    </div>
  );
};

export default ReflectionJournal;
