import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Plus } from 'lucide-react';

const MedicalRecords = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [records, setRecords] = useState([
    {
      id: '1',
      title: 'Annual Check-up',
      date: '2024-02-15',
      doctor: 'Dr. Smith',
      type: 'General Health',
      status: 'Completed'
    },
    {
      id: '2',
      title: 'Blood Test Results',
      date: '2024-02-10',
      doctor: 'Dr. Johnson',
      type: 'Laboratory',
      status: 'Pending'
    },
    {
      id: '3',
      title: 'X-Ray Report',
      date: '2024-02-01',
      doctor: 'Dr. Williams',
      type: 'Radiology',
      status: 'Completed'
    }
  ]);

  const handleDownload = (recordId: string) => {
    // Implement record download logic
    console.log('Downloading record:', recordId);
  };

  const handleAddRecord = () => {
    // Implement add record logic
    console.log('Adding new record');
  };

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Medical Records</h1>
          {currentUser?.role === 'doctor' && (
            <Button onClick={handleAddRecord} className="bg-primary text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{record.title}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {record.type} • {record.doctor} • {record.date}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        record.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(record.id)}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}

          {records.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No medical records available</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MedicalRecords;
