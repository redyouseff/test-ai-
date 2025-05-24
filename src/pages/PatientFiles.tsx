import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Plus } from 'lucide-react';

const PatientFiles = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [files, setFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    size: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to fetch patient files
    const fetchFiles = async () => {
      try {
        // Simulated API response
        const mockFiles = [
          {
            id: '1',
            name: 'Blood Test Results',
            type: 'PDF',
            date: '2024-02-15',
            size: '2.3 MB'
          },
          {
            id: '2',
            name: 'X-Ray Report',
            type: 'PDF',
            date: '2024-02-10',
            size: '5.1 MB'
          },
          {
            id: '3',
            name: 'Medical History',
            type: 'PDF',
            date: '2024-02-01',
            size: '1.8 MB'
          }
        ];
        setFiles(mockFiles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching files:', error);
        setLoading(false);
      }
    };

    fetchFiles();
  }, [patientId]);

  const handleDownload = (fileId: string) => {
    // Implement file download logic
    console.log('Downloading file:', fileId);
  };

  const handleUpload = () => {
    // Implement file upload logic
    console.log('Uploading new file');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <p>Loading patient files...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Patient Files</h1>
          {currentUser?.role === 'doctor' && (
            <Button onClick={handleUpload} className="bg-primary text-white">
              <Plus className="mr-2 h-4 w-4" /> Upload File
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {files.map((file) => (
            <Card key={file.id}>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{file.name}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {file.type} • {file.size} • {file.date}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file.id)}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}

          {files.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No files available</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientFiles;
