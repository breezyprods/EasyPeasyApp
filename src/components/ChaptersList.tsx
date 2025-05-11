import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";
import { useProgress } from '../contexts/ProgressContext';
import { chapters } from '../data/chaptersData';
import { BookOpen } from 'lucide-react';

const ChaptersList = () => {
  const { isChapterCompleted, progressPercentage } = useProgress();
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium">Progress</h2>
          <span className="text-sm text-muted-foreground">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-3">
        {chapters.map((chapter, index) => {
          const isCompleted = isChapterCompleted(chapter.id);
          // First chapter is always accessible
          // Other chapters are accessible if previous chapter is completed
          const isAccessible = chapter.id === 1 || isChapterCompleted(chapter.id - 1);
          
          return (
            <div key={chapter.id}>
              <div className={`flex items-start p-3 rounded-lg transition-colors ${
                isCompleted 
                  ? 'bg-ep-green border-green-200' 
                  : isAccessible 
                    ? 'bg-white hover:bg-ep-gray border-gray-200' 
                    : 'bg-gray-100 border-gray-200 opacity-70'
              } border`}>
                <div className={`mr-4 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {chapter.id}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{chapter.title}</h3>
                    <div className="flex items-center">
                      {isCompleted && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{chapter.summary}</p>
                  
                  {isAccessible ? (
                    <Link 
                      to={`/chapter/${chapter.id}`}
                      className="inline-flex items-center text-sm text-primary mt-2 hover:underline"
                    >
                      <BookOpen size={14} className="mr-1" />
                      {isCompleted ? "Review Chapter" : "Begin Chapter"}
                    </Link>
                  ) : (
                    <div className="inline-flex items-center text-sm text-muted-foreground mt-2">
                      <BookOpen size={14} className="mr-1" />
                      Complete previous chapter to unlock
                    </div>
                  )}
                </div>
              </div>
              
              {index < chapters.length - 1 && <Separator className="my-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChaptersList;
