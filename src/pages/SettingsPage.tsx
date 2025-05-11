
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, Trash2 } from 'lucide-react';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      const userData = {
        email: user.email,
        createdAt: user.created_at,
      };
      
      // Get user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (progressError) throw progressError;
      
      // Get journal entries
      const { data: journalData, error: journalError } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id);
      
      if (journalError) throw journalError;
      
      // Combine all data
      const exportData = {
        user: userData,
        progress: progressData || [],
        journals: journalData || [],
      };
      
      // Create downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `easyPeasy-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded to your device.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // User data in other tables will be automatically deleted due to cascade delete
      await supabase.auth.admin.deleteUser(user.id);
      await signOut();
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been deleted.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion failed",
        description: "There was an error deleting your account.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto my-12 p-6">
        <h1 className="text-2xl font-medium mb-6">Account Settings</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-lg font-medium mb-4">Your Profile</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input value={user?.email || ''} disabled className="bg-gray-50" />
          </div>
          
          <Button
            variant="outline"
            onClick={() => signOut().then(() => navigate('/'))}
          >
            Sign Out
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h2 className="text-lg font-medium mb-4">Data & Privacy</h2>
          
          <div className="space-y-4">
            <div>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={isExporting}
                onClick={handleExportData}
              >
                <Download size={16} />
                {isExporting ? "Exporting..." : "Export Your Data"}
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Download a copy of all your data in JSON format
              </p>
            </div>
            
            <div>
              <Button 
                variant="destructive" 
                className="flex items-center gap-2"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 size={16} />
                Delete Account
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all your data
              </p>
            </div>
          </div>
        </div>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove all of your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount}>
                Yes, delete my account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default SettingsPage;
