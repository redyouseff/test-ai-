import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, Doctor } from '../../redux/types';
import { logout, AuthAction } from '../../redux/actions/authActions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  FileText,
  Menu,
  MessageSquare,
  Settings,
  User,
  LogOut,
  ChevronDown,
  BookOpen,
  Users,
  Brain
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';

interface NavigationItem {
  path?: string;
  label: string;
  icon?: JSX.Element;
  type?: 'dropdown';
  items?: DropdownItem[];
}

interface DropdownItem {
  label: string;
  image?: string;
  onClick: () => void;
}

export default function Header() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<Dispatch<AuthAction>>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
    navigate('/login');
  };

  // Both doctors and patients will have access to Healthy Talk
  const navigationItems: NavigationItem[] = user ? [
    { path: '/dashboard', label: 'Dashboard', icon: <FileText className="h-4 w-4" /> },
    { path: '/appointments', label: 'Appointments', icon: <Calendar className="h-4 w-4" /> },
    ...(user.role === 'patient' ? [
      { path: '/messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
      {
        type: 'dropdown' as const,
        label: 'My Doctors',
        icon: <Users className="h-4 w-4" />,
        items: user.doctors?.map((doctor: Doctor) => ({
          label: doctor.fullName,
          image: doctor.profileImage,
          onClick: () => navigate(`/doctor/${doctor._id}`)
        })) || []
      }
    ] : []),
    { path: '/healthy-talk', label: 'Healthy Talk', icon: <BookOpen className="h-4 w-4" /> },
    { path: '/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    ...(user.role === 'doctor' ? [
      { path: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
      { path: '/ai-assistant', label: 'AI Assistant', icon: <Brain className="h-4 w-4" /> }
    ] : [])
  ] : [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' }
  ];

  const isActive = (path: string) => location.pathname === path;

  const renderNavigationItem = (item: NavigationItem) => {
    if (item.type === 'dropdown') {
      return (
        <DropdownMenu key={item.label}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost"
              className="px-3 py-2 text-sm text-gray-600 hover:text-primary"
            >
              <div className="flex items-center gap-1">
                {item.icon}
                <span>{item.label}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {item.items?.length > 0 ? (
              item.items.map((subItem: DropdownItem, index: number) => (
                <DropdownMenuItem 
                  key={index} 
                  onClick={subItem.onClick}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {subItem.image ? (
                      <img 
                        src={subItem.image} 
                        alt={subItem.label} 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                    <span>{subItem.label}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-4 text-sm text-gray-500 text-center">
                No doctors found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button 
        key={item.path}
        variant={isActive(item.path) ? "default" : "ghost"}
        className={`px-3 py-2 text-sm ${isActive(item.path) ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'}`}
        onClick={() => navigate(item.path)}
      >
        <div className="flex items-center gap-1">
          {item.icon}
          <span>{item.label}</span>
        </div>
      </Button>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate('/')}
            >
              CareInsight
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user && navigationItems.map((item) => renderNavigationItem(item))}

            {!user && navigationItems.map((item) => (
              <Button 
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                className={`px-3 py-2 text-sm ${isActive(item.path) ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            {/* User Menu (if logged in) */}
            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full">
                  <div className="text-sm">
                    <span className="text-gray-500">Welcome,</span>
                    <span className="font-medium text-primary ml-1">
                      {user.fullName || user.name}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name} 
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <span className="text-primary-dark font-semibold">
                            {(user && user.name ? user.name.charAt(0).toUpperCase() : '')}
                          </span>
                        )}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 mb-1 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user.fullName || user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* Login/Register buttons (if not logged in) */}
            {!user && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  className="bg-primary text-white hover:bg-primary-dark"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4">
            {navigationItems.map((item) => {
              if (item.type === 'dropdown') {
                return (
                  <div key={item.label} className="px-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      {item.items?.length > 0 ? (
                        item.items.map((subItem: DropdownItem, index: number) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-sm text-gray-600"
                            onClick={() => {
                              subItem.onClick();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {subItem.image ? (
                                <img 
                                  src={subItem.image} 
                                  alt={subItem.label} 
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-gray-400" />
                              )}
                              <span>{subItem.label}</span>
                            </div>
                          </Button>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 pl-2">
                          No doctors found
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`w-full justify-start px-4 py-2 text-sm ${
                    isActive(item.path) ? 'bg-primary text-white' : 'text-gray-600'
                  }`}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
