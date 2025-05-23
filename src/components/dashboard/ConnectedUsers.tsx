
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from 'lucide-react';
import { DoctorProfile, PatientProfile, UserRole } from '@/types';

interface ConnectedUsersProps {
  users: (DoctorProfile | PatientProfile)[];
  currentUserRole: UserRole;
}

export default function ConnectedUsers({ users, currentUserRole }: ConnectedUsersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {currentUserRole === 'patient' ? 'Your Doctors' : 'Your Patients'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={24} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium">
                    {currentUserRole === 'patient' ? `Dr. ${user.name}` : user.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentUserRole === 'patient' 
                      ? (user as DoctorProfile).specialty?.replace('-', ' ') 
                      : user.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {currentUserRole === 'patient' 
                ? 'You have no doctors yet.' 
                : 'You have no patients yet.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
