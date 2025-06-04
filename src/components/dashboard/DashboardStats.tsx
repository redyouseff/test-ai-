import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from 'lucide-react';

interface DashboardStatsProps {
  upcomingAppointmentsCount: number;
  unreadMessagesCount: number;
  availableRecordsCount: number;
  userRole: 'patient' | 'doctor';
}

export default function DashboardStats({
  upcomingAppointmentsCount,
  unreadMessagesCount,
  availableRecordsCount,
  userRole
}: DashboardStatsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Appointments</CardTitle>
          <Calendar size={20} className="text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{upcomingAppointmentsCount}</p>
          <p className="text-muted-foreground text-sm">Upcoming appointments</p>
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary text-sm mt-2"
            onClick={() => navigate('/appointments')}
          >
            View all appointments
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Medical Records</CardTitle>
          <FileText size={20} className="text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{availableRecordsCount}</p>
          <p className="text-muted-foreground text-sm">Available records</p>
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary text-sm mt-2"
            onClick={() => navigate('/medical-records')}
          >
            View all files
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
