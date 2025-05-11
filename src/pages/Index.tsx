
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from "@/components/ui/button";
import AffirmationBox from '../components/AffirmationBox';
import DistractionToolkit from '../components/DistractionToolkit';
import ChaptersList from '../components/ChaptersList';
import StreakTracker from '../components/StreakTracker';
import UpgradePrompt from '../components/UpgradePrompt';
import DailyChallenge from '../components/DailyChallenge';
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { Coffee } from 'lucide-react';

const Index = () => {
  const { completedChapters } = useProgress();
  const { isGuest } = useAuth();
  
  // Check if the user has completed chapter 20
  const hasCompletedJourney = completedChapters.includes(20);
  
  return (
    <Layout>
      <section className="py-8 sm:py-12 md:py-20 text-center max-w-3xl mx-auto px-4">
        {isGuest && <UpgradePrompt />}
        
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-medium mb-4 sm:mb-6">
          EasyPeasy – Escape the Porn Trap
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-muted-foreground">
          This is not another willpower method. It's the exit door.
        </p>
        <Link to="/chapter/1">
          <Button className="btn-primary text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-5">
            Start Journey
          </Button>
        </Link>
      </section>
      
      <section className="my-8 sm:my-12 px-4">
        <ChaptersList />
      </section>
      
      <section className="my-8 sm:my-16 px-4">
        <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6 text-center">Support Tools</h2>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {hasCompletedJourney ? (
            <StreakTracker />
          ) : (
            <AffirmationBox />
          )}
          <DistractionToolkit />
        </div>
      </section>
      
      <section className="my-8 sm:my-10 px-4">
        <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6 text-center">Daily Mindful Challenge</h2>
        <div className="max-w-lg mx-auto">
          <DailyChallenge />
        </div>
      </section>
      
      <section className="my-8 sm:my-16 max-w-2xl mx-auto px-4">
        <h2 className="text-xl sm:text-2xl font-medium mb-3 sm:mb-4 text-center">About EasyPeasy</h2>
        <div className="card-container">
          <p className="mb-4">
            EasyPeasy is based on Allen Carr's Easyway method, adapted specifically for quitting pornography. 
            It works by helping you understand the psychological trap that keeps you stuck.
          </p>
          <p className="mb-4">
            Unlike most approaches, this is not about using willpower or feeling deprived. 
            It's about seeing the situation clearly so you can simply walk away.
          </p>
          <div className="text-center mt-5 sm:mt-6 space-y-4">
            <Link to="/chapter/1" className="btn-primary inline-block">
              Begin Reading
            </Link>
            <div className="flex justify-center">
              <a 
                href="https://ko-fi.com/breezyprods" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <Coffee className="mr-1 h-4 w-4" />
                Support this project on Ko-fi
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
