
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BMIRange = {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
};

const bmiRanges: BMIRange[] = [
  {
    min: 0,
    max: 18.5,
    label: 'Underweight',
    color: 'bg-blue-500',
    description: 'You are underweight. Consider consulting with a healthcare provider about healthy weight gain strategies.',
  },
  {
    min: 18.5,
    max: 24.9,
    label: 'Normal',
    color: 'bg-green-500',
    description: 'You are at a healthy weight. Maintain your current lifestyle with balanced diet and regular exercise.',
  },
  {
    min: 25,
    max: 29.9,
    label: 'Overweight',
    color: 'bg-yellow-500',
    description: 'You are overweight. Consider making lifestyle changes including diet modifications and increased physical activity.',
  },
  {
    min: 30,
    max: 34.9,
    label: 'Obese (Class 1)',
    color: 'bg-orange-500',
    description: 'You have Class 1 obesity. It is advisable to consult with a healthcare provider for weight management strategies.',
  },
  {
    min: 35,
    max: 39.9,
    label: 'Obese (Class 2)',
    color: 'bg-red-400',
    description: 'You have Class 2 obesity. We strongly recommend consulting with a healthcare provider for personalized advice.',
  },
  {
    min: 40,
    max: 100,
    label: 'Obese (Class 3)',
    color: 'bg-red-600',
    description: 'You have Class 3 obesity. Please consult with a healthcare provider as soon as possible for medical guidance.',
  },
];

const BMICalculator = () => {
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiRange, setBmiRange] = useState<BMIRange | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset values when changing units
  useEffect(() => {
    setHeight('');
    setWeight('');
    setBmi(null);
    setBmiRange(null);
    setError(null);
  }, [unit]);

  const calculateBMI = () => {
    if (height === '' || weight === '') {
      setError('Please enter both height and weight');
      return;
    }

    if (Number(height) <= 0 || Number(weight) <= 0) {
      setError('Height and weight must be greater than zero');
      return;
    }

    setError(null);
    let bmiValue: number;

    if (unit === 'metric') {
      // Metric: BMI = weight (kg) / height (m)²
      bmiValue = Number(weight) / Math.pow(Number(height) / 100, 2);
    } else {
      // Imperial: BMI = (weight (lbs) * 703) / height (inches)²
      bmiValue = (Number(weight) * 703) / Math.pow(Number(height), 2);
    }

    bmiValue = Math.round(bmiValue * 10) / 10; // Round to 1 decimal place
    setBmi(bmiValue);

    // Determine BMI category
    const range = bmiRanges.find(
      (range) => bmiValue >= range.min && bmiValue < range.max
    );
    
    if (range) {
      setBmiRange(range);
    } else if (bmiValue >= 100) {
      setBmiRange(bmiRanges[bmiRanges.length - 1]); // Use the highest range
    }
  };

  const getBmiPercentage = (): number => {
    if (bmi === null) return 0;
    // Map BMI value to percentage (0-50 BMI maps to 0-100%)
    const percentage = (bmi / 50) * 100;
    return Math.min(100, Math.max(0, percentage)); // Clamp between 0 and 100
  };

  const handleHeightChange = (value: string) => {
    if (value === '' || !isNaN(Number(value))) {
      setHeight(value === '' ? '' : Number(value));
    }
  };

  const handleWeightChange = (value: string) => {
    if (value === '' || !isNaN(Number(value))) {
      setWeight(value === '' ? '' : Number(value));
    }
  };

  const handleAgeChange = (value: string) => {
    if (value === '' || !isNaN(Number(value))) {
      setAge(value === '' ? '' : Number(value));
    }
  };

  const getHeightLabel = () => {
    return unit === 'metric' ? 'Height (cm)' : 'Height (inches)';
  };

  const getWeightLabel = () => {
    return unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">BMI Calculator</CardTitle>
        <CardDescription className="text-center">
          Calculate your Body Mass Index (BMI)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="metric" value={unit} onValueChange={(v) => setUnit(v as 'metric' | 'imperial')}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="metric">Metric</TabsTrigger>
            <TabsTrigger value="imperial">Imperial</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">{getHeightLabel()}</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(e.target.value)}
                min="0"
                placeholder={unit === 'metric' ? '170' : '67'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">{getWeightLabel()}</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                min="0"
                placeholder={unit === 'metric' ? '70' : '154'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => handleAgeChange(e.target.value)}
                min="0"
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={gender === 'male' ? 'default' : 'outline'}
                  onClick={() => setGender('male')}
                  className="w-full"
                >
                  Male
                </Button>
                <Button
                  type="button"
                  variant={gender === 'female' ? 'default' : 'outline'}
                  onClick={() => setGender('female')}
                  className="w-full"
                >
                  Female
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <Button onClick={calculateBMI} className="w-full">
          Calculate BMI
        </Button>

        {bmi !== null && bmiRange && (
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{bmi}</div>
              <div className={`text-lg font-medium ${bmiRange.color.replace('bg-', 'text-')}`}>
                {bmiRange.label}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>

              <Progress 
                value={getBmiPercentage()} 
                className="h-3 bg-gray-200" 
              />
              
              <div className={`p-3 rounded mt-2 ${bmiRange.color} bg-opacity-20`}>
                <p className="text-sm">{bmiRange.description}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-gray-500 text-center">
        <p>
          BMI is a screening tool, not a diagnostic. Consult a healthcare professional for personalized advice.
        </p>
      </CardFooter>
    </Card>
  );
};

export default BMICalculator;
