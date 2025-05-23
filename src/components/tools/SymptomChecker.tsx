
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, ChevronRight, AlertCircle } from 'lucide-react';

const commonSymptoms = [
  'Headache',
  'Fever',
  'Fatigue',
  'Cough',
  'Sore throat',
  'Nausea',
  'Vomiting',
  'Abdominal pain',
  'Back pain',
  'Joint pain',
  'Dizziness',
  'Shortness of breath',
];

interface PossibleCondition {
  name: string;
  likelihood: 'high' | 'medium' | 'low';
  symptoms: string[];
  recommendations: string[];
}

const SymptomChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PossibleCondition[]>([]);

  const { toast } = useToast();

  const filteredSymptoms = commonSymptoms.filter(symptom => 
    symptom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAddCustomSymptom = () => {
    if (!searchTerm.trim()) return;
    
    if (!commonSymptoms.includes(searchTerm) && !selectedSymptoms.includes(searchTerm)) {
      setSelectedSymptoms(prev => [...prev, searchTerm]);
      setSearchTerm('');
    }
  };

  const checkSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      toast({
        title: "No symptoms selected",
        description: "Please select at least one symptom to continue",
        variant: "destructive",
      });
      return;
    }

    // This is a simplified mock analysis - in a real app, this would use a more sophisticated algorithm
    // or connect to a medical API
    const mockAnalysis = analyzeSymptoms(selectedSymptoms);
    setResults(mockAnalysis);
    setShowResults(true);

    toast({
      title: "Symptoms Analyzed",
      description: `Found ${mockAnalysis.length} potential conditions based on your symptoms.`,
    });
  };

  const analyzeSymptoms = (symptoms: string[]): PossibleCondition[] => {
    const conditions: PossibleCondition[] = [];

    // Very simplified mock analysis
    if (symptoms.includes('Headache')) {
      if (symptoms.includes('Fever')) {
        conditions.push({
          name: 'Common Cold',
          likelihood: 'high',
          symptoms: ['Headache', 'Fever', 'Cough', 'Sore throat'],
          recommendations: [
            'Rest and hydrate',
            'Over-the-counter pain relievers if needed',
            'See a doctor if symptoms persist for more than 7 days'
          ]
        });
      }
      
      conditions.push({
        name: 'Tension Headache',
        likelihood: symptoms.includes('Fatigue') ? 'medium' : 'low',
        symptoms: ['Headache', 'Fatigue', 'Neck pain'],
        recommendations: [
          'Rest in a quiet, dark room',
          'Over-the-counter pain relievers',
          'Stress management techniques',
          'See a doctor if headaches are severe or frequent'
        ]
      });
    }

    if (symptoms.includes('Cough')) {
      if (symptoms.includes('Shortness of breath')) {
        conditions.push({
          name: 'Bronchitis',
          likelihood: 'medium',
          symptoms: ['Cough', 'Shortness of breath', 'Fatigue'],
          recommendations: [
            'Rest and hydrate',
            'Avoid smoking or secondhand smoke',
            'Use a humidifier',
            'See a doctor if symptoms worsen or include fever'
          ]
        });
      } else {
        conditions.push({
          name: 'Upper Respiratory Infection',
          likelihood: 'medium',
          symptoms: ['Cough', 'Sore throat', 'Congestion'],
          recommendations: [
            'Rest and hydrate',
            'Over-the-counter cough medications',
            'Throat lozenges for sore throat',
            'See a doctor if symptoms persist beyond 10 days'
          ]
        });
      }
    }

    if (symptoms.includes('Abdominal pain')) {
      if (symptoms.includes('Nausea') || symptoms.includes('Vomiting')) {
        conditions.push({
          name: 'Gastroenteritis',
          likelihood: 'high',
          symptoms: ['Abdominal pain', 'Nausea', 'Vomiting'],
          recommendations: [
            'Stay hydrated with clear fluids',
            'Rest and gradually reintroduce bland foods',
            'See a doctor if symptoms persist beyond 48 hours or if severe'
          ]
        });
      }
    }

    if (symptoms.includes('Joint pain')) {
      conditions.push({
        name: 'Arthritis',
        likelihood: 'medium',
        symptoms: ['Joint pain', 'Stiffness', 'Swelling'],
        recommendations: [
          'Over-the-counter pain relievers',
          'Rest affected joints',
          'Apply ice or heat',
          'See a doctor for proper diagnosis and treatment plan'
        ]
      });
    }

    // If no specific conditions match or very few symptoms provided
    if (conditions.length === 0) {
      conditions.push({
        name: 'Non-specific symptoms',
        likelihood: 'low',
        symptoms: selectedSymptoms,
        recommendations: [
          'Monitor your symptoms',
          'Rest and hydrate',
          'See a healthcare provider if symptoms worsen or persist'
        ]
      });
    }

    return conditions;
  };

  const resetChecker = () => {
    setSelectedSymptoms([]);
    setShowResults(false);
    setResults([]);
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div>
      {!showResults ? (
        <div className="space-y-6">
          <div>
            <Label htmlFor="symptom-search">Search or select symptoms</Label>
            <div className="relative mt-1">
              <Input
                id="symptom-search"
                placeholder="Type to search symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            {searchTerm && !commonSymptoms.includes(searchTerm) && (
              <Button 
                variant="ghost" 
                onClick={handleAddCustomSymptom} 
                className="mt-2 text-sm"
              >
                + Add "{searchTerm}" as custom symptom
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <Label>Common symptoms</Label>
            <div className="grid grid-cols-2 gap-2">
              {filteredSymptoms.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`symptom-${symptom}`}
                    checked={selectedSymptoms.includes(symptom)}
                    onCheckedChange={() => toggleSymptom(symptom)}
                  />
                  <label 
                    htmlFor={`symptom-${symptom}`}
                    className="text-sm"
                  >
                    {symptom}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {selectedSymptoms.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <Label>Selected symptoms ({selectedSymptoms.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSymptoms.map((symptom) => (
                  <div 
                    key={`selected-${symptom}`} 
                    className="bg-white px-3 py-1 rounded-full text-sm border flex items-center"
                  >
                    {symptom}
                    <button 
                      onClick={() => toggleSymptom(symptom)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={resetChecker}>
              Clear All
            </Button>
            <Button onClick={checkSymptoms} disabled={selectedSymptoms.length === 0}>
              Check Symptoms
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Possible Conditions</h3>
            <Button variant="ghost" onClick={resetChecker} className="text-sm">
              Check Different Symptoms
            </Button>
          </div>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Important Medical Disclaimer</p>
              <p className="mt-1">This tool provides information only and is not a substitute for professional medical advice, diagnosis or treatment. Always seek the advice of a qualified healthcare provider with any questions regarding your health.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {results.map((condition, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-lg">{condition.name}</h4>
                      <p className={`text-sm font-medium ${getLikelihoodColor(condition.likelihood)}`}>
                        {condition.likelihood.charAt(0).toUpperCase() + condition.likelihood.slice(1)} likelihood
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 font-medium">Related symptoms:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {condition.symptoms.map((symptom, i) => (
                        <span 
                          key={i} 
                          className={`text-xs px-2 py-1 rounded-full ${
                            selectedSymptoms.includes(symptom) 
                              ? 'bg-primary-light text-primary-dark' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 font-medium">Recommendations:</p>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      {condition.recommendations.map((rec, i) => (
                        <li key={i} className="text-gray-700">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline" onClick={resetChecker}>
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
