
import { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { distractionTools } from '../data/chaptersData';
import { ListCheck } from 'lucide-react';

const DistractionToolkit = () => {
  const [currentTool, setCurrentTool] = useState<string | null>(null);
  
  const getRandomTool = () => {
    const randomIndex = Math.floor(Math.random() * distractionTools.length);
    setCurrentTool(distractionTools[randomIndex]);
  };
  
  return (
    <Card className="bg-ep-peach border-orange-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ListCheck size={18} />
          <CardTitle className="text-lg">Distraction Toolkit</CardTitle>
        </div>
        <CardDescription>
          Quick activities to help ground yourself
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentTool ? (
          <div className="mb-4">
            <p className="text-base font-medium mb-3">{currentTool}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentTool(null)}
              className="w-full"
            >
              Show All Tools
            </Button>
          </div>
        ) : (
          <>
            <ul className="space-y-2 mb-4">
              {distractionTools.slice(0, 5).map((tool, index) => (
                <li key={index} className="text-sm">
                  • {tool}
                </li>
              ))}
            </ul>
            <Button
              variant="default"
              size="sm" 
              onClick={getRandomTool}
              className="w-full"
            >
              What should I do right now?
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DistractionToolkit;
