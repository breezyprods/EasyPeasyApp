
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { affirmations } from '../data/chaptersData';

const AffirmationBox = () => {
  const [affirmation, setAffirmation] = useState('');
  
  const getRandomAffirmation = () => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex].text;
  };
  
  useEffect(() => {
    setAffirmation(getRandomAffirmation());
  }, []);
  
  const handleNewAffirmation = () => {
    setAffirmation(getRandomAffirmation());
  };
  
  return (
    <Card className="bg-ep-blue border border-blue-200 shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell size={16} className="text-primary" />
          <h3 className="text-lg font-medium">Daily Affirmation</h3>
        </div>
        <p className="text-md font-serif italic mb-3">{affirmation}</p>
        <button 
          onClick={handleNewAffirmation}
          className="text-sm text-primary hover:underline focus:outline-none"
        >
          Another affirmation
        </button>
      </CardContent>
    </Card>
  );
};

export default AffirmationBox;
