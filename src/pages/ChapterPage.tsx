
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from '../components/Layout';
import ReflectionJournal from '../components/ReflectionJournal';
import AffirmationBox from '../components/AffirmationBox';
import DistractionToolkit from '../components/DistractionToolkit';
import StreakTracker from '../components/StreakTracker';
import UpgradePrompt from '../components/UpgradePrompt';
import { chapters } from '../data/chaptersData';
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/use-mobile';
import { CheckCircle, ArrowLeft, ArrowRight, BookOpen, Eye, EyeOff } from 'lucide-react';

const ChapterPage = () => {
  const { id } = useParams<{ id: string }>();
  const chapterId = parseInt(id || '1', 10);
  const { isGuest } = useAuth();
  const isMobile = useIsMobile();
  const [distractionFree, setDistractionFree] = useState(false);
  
  const { completeChapter, isChapterCompleted, completedChapters } = useProgress();
  const chapter = chapters.find(c => c.id === chapterId);
  
  const nextChapter = chapters.find(c => c.id === chapterId + 1);
  const prevChapter = chapters.find(c => c.id === chapterId - 1);
  
  const isCompleted = isChapterCompleted(chapterId);
  const canAccessNextChapter = isCompleted || (!nextChapter);
  
  // Check if the user has completed chapter 20
  const hasCompletedJourney = completedChapters.includes(20);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterId]);

  // Toggle distraction-free reading mode
  const toggleDistractionFree = () => {
    setDistractionFree(prev => !prev);
  };
  
  if (!chapter) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-4">Chapter not found</h2>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  // If in distraction-free mode, render a simplified version without the Layout
  if (distractionFree) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif">
              {chapter.id}. {chapter.title}
            </h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleDistractionFree}
              className="flex items-center gap-1"
            >
              <Eye size={16} />
              <span className="hidden sm:inline">Exit Focus Mode</span>
            </Button>
          </div>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-6">{chapter.summary}</p>
          
          <Card className="p-4 sm:p-6 mb-6">
            <div className="prose max-w-none">
              {chapter.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            {chapter.takeaway && (
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-ep-green rounded-md border border-green-200">
                <p className="font-medium">{chapter.takeaway}</p>
              </div>
            )}
          </Card>
          
          <div className="flex justify-between items-center pt-6 border-t mt-8">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={toggleDistractionFree}
            >
              <Eye size={16} />
              Exit Focus Mode
            </Button>
            
            {nextChapter && canAccessNextChapter && (
              <Link to={`/chapter/${nextChapter.id}`}>
                <Button className="flex items-center gap-1">
                  Next Chapter
                  <ArrowRight size={16} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Regular mode with Layout
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {isGuest && <UpgradePrompt />}
        
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={16} className="mr-1" /> Back
              </Button>
            </Link>
            <span className="text-muted-foreground">
              Chapter {chapter.id} of 20
            </span>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDistractionFree}
              className="flex items-center gap-1 flex-1 sm:flex-auto"
            >
              <EyeOff size={16} />
              <span className="ml-1">Focus Mode</span>
            </Button>
            
            <Button
              variant={isCompleted ? "outline" : "default"}
              size="sm"
              onClick={() => completeChapter(chapterId)}
              className="flex items-center gap-1 flex-1 sm:flex-auto"
            >
              <CheckCircle size={16} />
              {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
            </Button>
          </div>
        </div>
        
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-serif mb-3 sm:mb-4">
            {chapter.id}. {chapter.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-5 sm:mb-6">{chapter.summary}</p>
          
          <Card className="p-4 sm:p-6 mb-6">
            <div className="prose max-w-none">
              {chapter.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            {chapter.takeaway && (
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-ep-green rounded-md border border-green-200">
                <p className="font-medium">{chapter.takeaway}</p>
              </div>
            )}
          </Card>
          
          {/* Only render the Journal if there's a reflection prompt */}
          {chapter.reflectionPrompt && (
            <div className="mb-8 sm:mb-12">
              <h3 className="text-xl font-medium mb-3 sm:mb-4">Reflection</h3>
              <p className="mb-4 sm:mb-6 text-muted-foreground">{chapter.reflectionPrompt}</p>
              <ReflectionJournal />
            </div>
          )}
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4 mb-8 sm:mb-10">
          {hasCompletedJourney ? (
            <StreakTracker />
          ) : (
            <AffirmationBox />
          )}
          <DistractionToolkit />
        </div>
        
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'} border-t pt-6`}>
          {prevChapter ? (
            <Link to={`/chapter/${prevChapter.id}`} className={isMobile ? 'w-full' : ''}>
              <Button variant="outline" className={`flex items-center gap-1 ${isMobile ? 'w-full' : ''}`}>
                <ArrowLeft size={16} />
                Previous Chapter
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
          
          {nextChapter && (
            <div className={isMobile ? 'w-full' : ''}>
              {canAccessNextChapter ? (
                <Link to={`/chapter/${nextChapter.id}`} className={isMobile ? 'w-full' : ''}>
                  <Button className={`flex items-center gap-1 ${isMobile ? 'w-full' : ''}`}>
                    Next Chapter
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              ) : (
                <Button disabled className={`flex items-center gap-1 ${isMobile ? 'w-full' : ''}`}>
                  Mark as Complete to Continue
                  <ArrowRight size={16} />
                </Button>
              )}
            </div>
          )}
          
          {!nextChapter && (
            <Link to="/" className={isMobile ? 'w-full' : ''}>
              <Button className={`flex items-center gap-1 ${isMobile ? 'w-full' : ''}`}>
                <BookOpen size={16} className="mr-1" />
                Finish & Return Home
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChapterPage;
