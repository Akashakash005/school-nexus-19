import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  School, 
  User, 
  Home, 
  Users, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  FileText, 
  MessageSquare, 
  LogOut,
  Building,
  UserCog 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Sidebar component for application navigation
 * Shows different navigation options based on user role
 */
export default function Sidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen size is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle logout click
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user's display name (email for now)
  const displayName = user?.email ? user.email.split('@')[0] : 'User';
  
  // Classes for navigation items
  const baseNavClass = "flex items-center px-4 py-2 text-sm transition-colors";
  const activeNavClass = `${baseNavClass} bg-primary-800 text-white`;
  const inactiveNavClass = `${baseNavClass} text-white/80 hover:bg-primary-600`;

  // If sidebar should be hidden on mobile
  if (isMobile && !mobileOpen) {
    return null;
  }

  return (
    <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-30' : 'flex'} flex-col w-64 bg-primary-700 text-white`}>
      {/* Logo & App Title */}
      <div className="p-4 flex items-center justify-center border-b border-primary-600">
        <School className="mr-2 h-6 w-6" />
        <h1 className="text-xl font-bold">School Manager</h1>
      </div>
      
      {/* User Profile Summary */}
      <div className="p-4 flex items-center border-b border-primary-600">
        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
          <span className="font-medium">{displayName.charAt(0).toUpperCase()}</span>
        </div>
        <div className="ml-3">
          <p className="font-medium">{displayName}</p>
          <p className="text-xs text-primary-200">{user?.role.replace('_', ' ')}</p>
        </div>
      </div>
      
      {/* Navigation Links */}
      <ScrollArea className="flex-1">
        <nav className="py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-primary-200 uppercase">Main</div>
          
          <Link href="/">
            <a className={location === '/' ? activeNavClass : inactiveNavClass}>
              <Home className="mr-3 h-4 w-4" />
              <span>Dashboard</span>
            </a>
          </Link>
          
          <Link href="/profile">
            <a className={location === '/profile' ? activeNavClass : inactiveNavClass}>
              <User className="mr-3 h-4 w-4" />
              <span>Profile</span>
            </a>
          </Link>
          
          {/* Super Admin Navigation */}
          {user?.role === 'super_admin' && (
            <>
              <div className="px-4 mt-6 mb-2 text-xs font-semibold text-primary-200 uppercase">
                System Management
              </div>
              
              <Link href="/schools">
                <a className={location === '/schools' ? activeNavClass : inactiveNavClass}>
                  <Building className="mr-3 h-4 w-4" />
                  <span>Schools</span>
                </a>
              </Link>
              
              <Link href="/school-admins">
                <a className={location === '/school-admins' ? activeNavClass : inactiveNavClass}>
                  <UserCog className="mr-3 h-4 w-4" />
                  <span>School Admins</span>
                </a>
              </Link>
            </>
          )}
          
          {/* School Admin & Teacher Navigation */}
          {(user?.role === 'school_admin' || user?.role === 'teacher') && (
            <>
              <div className="px-4 mt-6 mb-2 text-xs font-semibold text-primary-200 uppercase">
                School Management
              </div>
              
              {user?.role === 'school_admin' && (
                <Link href="/staff">
                  <a className={location === '/staff' ? activeNavClass : inactiveNavClass}>
                    <Users className="mr-3 h-4 w-4" />
                    <span>Staff</span>
                  </a>
                </Link>
              )}
              
              <Link href="/students">
                <a className={location === '/students' ? activeNavClass : inactiveNavClass}>
                  <School className="mr-3 h-4 w-4" />
                  <span>Students</span>
                </a>
              </Link>
              
              <Link href="/classes">
                <a className={location === '/classes' ? activeNavClass : inactiveNavClass}>
                  <BookOpen className="mr-3 h-4 w-4" />
                  <span>Classes</span>
                </a>
              </Link>
              
              <Link href="/subjects">
                <a className={location === '/subjects' ? activeNavClass : inactiveNavClass}>
                  <BookOpen className="mr-3 h-4 w-4" />
                  <span>Subjects</span>
                </a>
              </Link>
              
              <Link href="/attendance">
                <a className={location === '/attendance' ? activeNavClass : inactiveNavClass}>
                  <Calendar className="mr-3 h-4 w-4" />
                  <span>Attendance</span>
                </a>
              </Link>
              
              {user?.role === 'school_admin' && (
                <>
                  <Link href="/fees">
                    <a className={location === '/fees' ? activeNavClass : inactiveNavClass}>
                      <DollarSign className="mr-3 h-4 w-4" />
                      <span>Fees</span>
                    </a>
                  </Link>
                  
                  <Link href="/bills">
                    <a className={location === '/bills' ? activeNavClass : inactiveNavClass}>
                      <FileText className="mr-3 h-4 w-4" />
                      <span>Bills</span>
                    </a>
                  </Link>
                </>
              )}
              
              <Link href="/messages">
                <a className={location === '/messages' ? activeNavClass : inactiveNavClass}>
                  <MessageSquare className="mr-3 h-4 w-4" />
                  <span>Messages</span>
                </a>
              </Link>
            </>
          )}
          
          {/* Student Navigation */}
          {user?.role === 'student' && (
            <>
              <div className="px-4 mt-6 mb-2 text-xs font-semibold text-primary-200 uppercase">
                Academic
              </div>
              
              <Link href="/attendance">
                <a className={location === '/attendance' ? activeNavClass : inactiveNavClass}>
                  <Calendar className="mr-3 h-4 w-4" />
                  <span>Attendance</span>
                </a>
              </Link>
              
              <Link href="/classes">
                <a className={location === '/classes' ? activeNavClass : inactiveNavClass}>
                  <BookOpen className="mr-3 h-4 w-4" />
                  <span>Classes & Subjects</span>
                </a>
              </Link>
              
              <Link href="/fees">
                <a className={location === '/fees' ? activeNavClass : inactiveNavClass}>
                  <DollarSign className="mr-3 h-4 w-4" />
                  <span>Fees</span>
                </a>
              </Link>
              
              <Link href="/messages">
                <a className={location === '/messages' ? activeNavClass : inactiveNavClass}>
                  <MessageSquare className="mr-3 h-4 w-4" />
                  <span>Messages</span>
                </a>
              </Link>
            </>
          )}
          
          {/* Parent Navigation */}
          {user?.role === 'parent' && (
            <>
              <div className="px-4 mt-6 mb-2 text-xs font-semibold text-primary-200 uppercase">
                Child Information
              </div>
              
              <Link href="/students">
                <a className={location === '/students' ? activeNavClass : inactiveNavClass}>
                  <School className="mr-3 h-4 w-4" />
                  <span>My Children</span>
                </a>
              </Link>
              
              <Link href="/attendance">
                <a className={location === '/attendance' ? activeNavClass : inactiveNavClass}>
                  <Calendar className="mr-3 h-4 w-4" />
                  <span>Attendance</span>
                </a>
              </Link>
              
              <Link href="/fees">
                <a className={location === '/fees' ? activeNavClass : inactiveNavClass}>
                  <DollarSign className="mr-3 h-4 w-4" />
                  <span>Fees</span>
                </a>
              </Link>
              
              <Link href="/messages">
                <a className={location === '/messages' ? activeNavClass : inactiveNavClass}>
                  <MessageSquare className="mr-3 h-4 w-4" />
                  <span>Messages</span>
                </a>
              </Link>
            </>
          )}
        </nav>
      </ScrollArea>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-primary-600">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white/80 hover:text-white hover:bg-primary-600"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-3 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
      
      {/* Mobile close button (if provided) */}
      {isMobile && onClose && (
        <div className="p-4 border-t border-primary-600">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClose}
          >
            Close Menu
          </Button>
        </div>
      )}
    </div>
  );
}
