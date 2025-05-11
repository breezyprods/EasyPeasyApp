
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  CircleCheck, 
  BookOpen, 
  ListCheck, 
  UserCircle,
  FileText,
  Settings,
  LogOut,
  Award,
  Calendar,
  Coffee
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StreakTracker from './StreakTracker';
import UserPoints from './UserPoints';
import DailyChallengeModal from './DailyChallengeModal';
import DailyMessages from './DailyMessages';
import SendMessageModal from './SendMessageModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { progressPercentage, resetProgress } = useProgress();
  const { user, isGuest, signOut } = useAuth();
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-3">
        <div className="container-custom flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <CircleCheck size={24} className="text-primary" />
            <span className="font-serif text-xl font-medium">EasyPeasy</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
            <Link to="/resources" className="text-sm font-medium hover:text-primary">Resources</Link>
            <Link to="/journal" className="text-sm font-medium hover:text-primary">Journal</Link>
            
            {(user || isGuest) && (
              <SendMessageModal />
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <UserCircle size={16} />
                  <span className="truncate max-w-[100px]">
                    {user ? user.email?.split('@')[0] : isGuest ? "Guest" : "Account"}
                  </span>
                  {(user || isGuest) && <UserPoints className="ml-2" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user ? (
                    <div className="truncate">
                      <div>{user.email}</div>
                      <span className="text-xs text-muted-foreground">Signed In</span>
                    </div>
                  ) : isGuest ? (
                    <div>
                      <div>Guest User</div>
                      <span className="text-xs text-muted-foreground">Local Storage Only</span>
                    </div>
                  ) : (
                    "Account"
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {(user || isGuest) && (
                  <DropdownMenuItem onClick={() => setShowChallengeModal(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Daily Challenge</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link to="/journal" className="flex items-center w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Journal</span>
                  </Link>
                </DropdownMenuItem>
                
                {(user || isGuest) && (
                  <DropdownMenuItem onClick={() => resetProgress()}>
                    <ListCheck className="mr-2 h-4 w-4" />
                    <span>Reset Progress</span>
                  </DropdownMenuItem>
                )}
                
                {user && (
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <a href="https://ko-fi.com/breezyprods" target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                    <Coffee className="mr-2 h-4 w-4" />
                    <span>Support Us</span>
                  </a>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {!user && !isGuest && (
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="flex items-center w-full">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {(user || isGuest) && (
                  <DropdownMenuItem onClick={() => {
                    signOut().then(() => window.location.href = '/');
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {(user || isGuest) && (
              <div className="ml-2">
                <DailyMessages />
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            {(user || isGuest) && (
              <DailyMessages />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <UserCircle size={20} />
                  {(user || isGuest) && <UserPoints className="ml-2" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user ? (
                    <div className="truncate">
                      <div>{user.email}</div>
                      <span className="text-xs text-muted-foreground">Signed In</span>
                    </div>
                  ) : isGuest ? (
                    <div>
                      <div>Guest User</div>
                      <span className="text-xs text-muted-foreground">Local Storage Only</span>
                    </div>
                  ) : (
                    "Menu"
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {(user || isGuest) && (
                  <>
                    <DropdownMenuItem>
                      <SendMessageModal />
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={() => setShowChallengeModal(true)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Daily Challenge</span>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex items-center w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/resources" className="flex items-center w-full">
                    <ListCheck className="mr-2 h-4 w-4" />
                    <span>Resources</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/journal" className="flex items-center w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Journal</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <a href="https://ko-fi.com/breezyprods" target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                    <Coffee className="mr-2 h-4 w-4" />
                    <span>Support Us</span>
                  </a>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {!user && !isGuest && (
                  <DropdownMenuItem asChild>
                    <Link to="/auth" className="flex items-center w-full">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {user && (
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {(user || isGuest) && (
                  <DropdownMenuItem onClick={() => {
                    signOut().then(() => window.location.href = '/');
                  }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-8">
        <div className="container-custom">
          {children}
        </div>
      </main>
      
      <footer className="py-6 border-t bg-gray-50">
        <div className="container-custom text-center text-sm text-muted-foreground">
          <p>EasyPeasy - Freedom Found Within</p>
          <p className="mt-1">No tracking. No accounts. Just freedom.</p>
        </div>
      </footer>

      <DailyChallengeModal 
        open={showChallengeModal} 
        onOpenChange={setShowChallengeModal}
      />
    </div>
  );
};

export default Layout;
