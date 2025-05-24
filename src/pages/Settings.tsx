import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RootState } from '../redux/types';
import axios from 'axios';
import { AppDispatch } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/actions/authActions';

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [resultNotifications, setResultNotifications] = useState(true);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    fullName: currentUser?.fullName || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Update password state to match API requirements
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    password: '',
    passwordConfirm: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.patch(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/me',
        {
          fullName: formData.fullName || formData.name,
          phoneNumber: formData.phone,
          email: formData.email,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Update the user in Redux store
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: response.data.data
        });

        toast({
          title: "Success",
          description: "Your account information has been updated successfully.",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });
      }
    } catch (error) {
      let errorMessage = "Failed to update account information.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.password !== passwordData.passwordConfirm) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (passwordData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.patch(
        'https://care-insight-api-9ed25d3ea3ea.herokuapp.com/api/v1/users/changePassword',
        {
          currentPassword: passwordData.currentPassword,
          password: passwordData.password,
          passwordConfirm: passwordData.passwordConfirm
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Password changed successfully. Please log in with your new password.",
          variant: "default",
          className: "bg-green-500 text-white border-none"
        });

        // Clear form
        setPasswordData({
          currentPassword: '',
          password: '',
          passwordConfirm: '',
        });

        // Logout and redirect to login page
        setTimeout(() => {
          dispatch(logout());
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      let errorMessage = "Failed to change password.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveChanges} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName || formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.password}
                        onChange={handlePasswordInputChange}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordConfirm">Confirm New Password</Label>
                      <Input
                        id="passwordConfirm"
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.passwordConfirm}
                        onChange={handlePasswordInputChange}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      className="bg-primary hover:bg-primary-dark text-white"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how we contact you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Notifications</h3>
                    <p className="text-sm text-gray-500">Receive updates via text message</p>
                  </div>
                  <Switch 
                    checked={smsNotifications} 
                    onCheckedChange={setSmsNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Appointment Reminders</h3>
                    <p className="text-sm text-gray-500">Receive reminders for upcoming appointments</p>
                  </div>
                  <Switch 
                    checked={appointmentReminders} 
                    onCheckedChange={setAppointmentReminders} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Test Results</h3>
                    <p className="text-sm text-gray-500">Get notified when test results are available</p>
                  </div>
                  <Switch 
                    checked={resultNotifications} 
                    onCheckedChange={setResultNotifications} 
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    className="bg-primary hover:bg-primary-dark text-white"
                    onClick={handleSaveNotifications}
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Manage your data and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Data Sharing</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Share medical data with your doctors</p>
                      <p className="text-xs text-gray-500">Allow your primary care doctors to access your medical information</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Share medical data with laboratories</p>
                      <p className="text-xs text-gray-500">Allow laboratories to access relevant medical information for testing</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Account Security</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Two-factor authentication</p>
                      <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Login notifications</p>
                      <p className="text-xs text-gray-500">Receive alerts when your account is accessed from a new device</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    className="bg-primary hover:bg-primary-dark text-white"
                    onClick={() => toast({
                      title: "Privacy Settings Updated",
                      description: "Your privacy and security settings have been saved.",
                    })}
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    These actions are permanent and cannot be undone.
                  </p>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full md:w-auto justify-start text-left"
                    >
                      Export My Data
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full md:w-auto justify-start text-left border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
