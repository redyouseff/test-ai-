
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchSpecialties, fetchDoctors } from '@/api/healthyTalk';

interface HealthPostFiltersProps {
  onSpecialtyChange: (specialty: string | null) => void;
  onDoctorChange: (doctor: string | null) => void;
  selectedSpecialty: string | null;
  selectedDoctor: string | null;
}

export const HealthPostFilters: React.FC<HealthPostFiltersProps> = ({
  onSpecialtyChange,
  onDoctorChange,
  selectedSpecialty,
  selectedDoctor
}) => {
  const { data: specialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: fetchSpecialties
  });

  const { data: doctors } = useQuery({
    queryKey: ['doctors', selectedSpecialty],
    queryFn: () => fetchDoctors(selectedSpecialty),
    enabled: true
  });

  const handleSpecialtyChange = (value: string) => {
    onDoctorChange(null); // Reset doctor when specialty changes
    onSpecialtyChange(value === 'all' ? null : value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Filter by Specialty</h3>
          <RadioGroup 
            value={selectedSpecialty || 'all'} 
            onValueChange={handleSpecialtyChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer">All Specialties</Label>
            </div>
            
            {specialties?.map(specialty => (
              <div key={specialty.id} className="flex items-center space-x-2">
                <RadioGroupItem value={specialty.id} id={specialty.id} />
                <Label htmlFor={specialty.id} className="cursor-pointer">{specialty.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Filter by Doctor</h3>
          <RadioGroup 
            value={selectedDoctor || 'all'} 
            onValueChange={(value) => onDoctorChange(value === 'all' ? null : value)}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all-doctors" />
              <Label htmlFor="all-doctors" className="cursor-pointer">All Doctors</Label>
            </div>
            
            {doctors?.map(doctor => (
              <div key={doctor.id} className="flex items-center space-x-2">
                <RadioGroupItem value={doctor.id} id={`doctor-${doctor.id}`} />
                <Label htmlFor={`doctor-${doctor.id}`} className="cursor-pointer">Dr. {doctor.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
};
