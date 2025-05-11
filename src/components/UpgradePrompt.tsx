
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const UpgradePrompt = () => {
  const { isGuest } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  
  if (!isGuest || dismissed) {
    return null;
  }
  
  return (
    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-primary mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium mb-1">Want to save across devices?</h3>
          <p className="text-sm mb-3">
            Create a free account to sync your progress and journal entries across all your devices.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              onClick={() => navigate('/auth')}
            >
              Create an Account
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDismissed(true)}
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
