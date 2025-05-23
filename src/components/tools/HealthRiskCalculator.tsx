
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  age: z.string()
    .min(1, { message: 'Age is required' })
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
      message: 'Age must be a positive number',
    }),
  gender: z.enum(['male', 'female', 'other']),
  smoker: z.boolean().default(false),
  familyHistory: z.object({
    cancer: z.boolean().default(false),
    heartDisease: z.boolean().default(false),
    diabetes: z.boolean().default(false),
  }),
  exerciseFrequency: z.enum(['none', 'occasional', 'regular', 'frequent']),
  bloodPressure: z.enum(['normal', 'elevated', 'high', 'unknown']).default('unknown'),
});

type FormValues = z.infer<typeof formSchema>;

const HealthRiskCalculator = () => {
  const [riskResults, setRiskResults] = useState<{
    cancer: { risk: string, score: number, tips: string[] };
    heart: { risk: string, score: number, tips: string[] };
    diabetes: { risk: string, score: number, tips: string[] };
  } | null>(null);
  
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: '',
      gender: 'male',
      smoker: false,
      familyHistory: {
        cancer: false,
        heartDisease: false,
        diabetes: false,
      },
      exerciseFrequency: 'occasional',
      bloodPressure: 'unknown',
    },
  });

  const calculateRisks = (values: FormValues) => {
    const age = parseInt(values.age);
    
    // Cancer risk calculation (simplified for demo)
    let cancerScore = 0;
    if (age > 50) cancerScore += 10;
    if (values.smoker) cancerScore += 20;
    if (values.familyHistory.cancer) cancerScore += 15;
    if (values.exerciseFrequency === 'none') cancerScore += 5;
    
    // Heart disease risk calculation
    let heartScore = 0;
    if (age > 45) heartScore += 10;
    if (values.smoker) heartScore += 15;
    if (values.familyHistory.heartDisease) heartScore += 15;
    if (values.exerciseFrequency === 'none') heartScore += 10;
    if (values.bloodPressure === 'high') heartScore += 20;
    else if (values.bloodPressure === 'elevated') heartScore += 10;
    
    // Diabetes risk calculation
    let diabetesScore = 0;
    if (age > 40) diabetesScore += 5;
    if (values.familyHistory.diabetes) diabetesScore += 15;
    if (values.exerciseFrequency === 'none') diabetesScore += 10;
    if (values.exerciseFrequency === 'occasional') diabetesScore += 5;

    // Determine risk levels
    const getRiskLevel = (score: number) => {
      if (score < 15) return 'Low';
      if (score < 30) return 'Moderate';
      if (score < 45) return 'High';
      return 'Very High';
    };

    // Tips based on risk factors
    const getCancerTips = () => {
      const tips = [];
      if (values.smoker) tips.push('Consider smoking cessation programs to reduce cancer risk.');
      if (values.familyHistory.cancer) tips.push('Regular cancer screenings are important given your family history.');
      if (values.exerciseFrequency === 'none' || values.exerciseFrequency === 'occasional') 
        tips.push('Increasing physical activity can help reduce cancer risk.');
      if (tips.length === 0) tips.push('Continue maintaining a healthy lifestyle to minimize cancer risk.');
      return tips;
    };

    const getHeartTips = () => {
      const tips = [];
      if (values.smoker) tips.push('Smoking significantly increases heart disease risk. Consider quitting.');
      if (values.bloodPressure === 'high' || values.bloodPressure === 'elevated') 
        tips.push('Monitor your blood pressure regularly and follow your doctor\'s recommendations.');
      if (values.exerciseFrequency === 'none') 
        tips.push('Regular physical activity helps maintain heart health.');
      if (tips.length === 0) tips.push('Continue heart-healthy habits like balanced diet and regular exercise.');
      return tips;
    };

    const getDiabetesTips = () => {
      const tips = [];
      if (values.familyHistory.diabetes) 
        tips.push('With family history of diabetes, regular screening is recommended.');
      if (values.exerciseFrequency === 'none' || values.exerciseFrequency === 'occasional') 
        tips.push('Regular exercise helps improve insulin sensitivity and reduces diabetes risk.');
      tips.push('Maintain a balanced diet low in refined sugars and processed foods.');
      return tips;
    };

    return {
      cancer: { 
        risk: getRiskLevel(cancerScore), 
        score: cancerScore,
        tips: getCancerTips() 
      },
      heart: { 
        risk: getRiskLevel(heartScore), 
        score: heartScore,
        tips: getHeartTips() 
      },
      diabetes: { 
        risk: getRiskLevel(diabetesScore), 
        score: diabetesScore,
        tips: getDiabetesTips() 
      }
    };
  };

  const onSubmit = (values: FormValues) => {
    const results = calculateRisks(values);
    setRiskResults(results);
    
    toast({
      title: "Risk Assessment Complete",
      description: "Your health risk assessment has been calculated.",
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-500';
      case 'Moderate': return 'text-yellow-500';
      case 'High': return 'text-orange-500';
      case 'Very High': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your age"
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="exerciseFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercise Frequency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="How often do you exercise?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None (Less than once a week)</SelectItem>
                    <SelectItem value="occasional">Occasional (1-2 times per week)</SelectItem>
                    <SelectItem value="regular">Regular (3-4 times per week)</SelectItem>
                    <SelectItem value="frequent">Frequent (5+ times per week)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bloodPressure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Pressure</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your blood pressure category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unknown">Unknown</SelectItem>
                    <SelectItem value="normal">Normal (Less than 120/80 mm Hg)</SelectItem>
                    <SelectItem value="elevated">Elevated (120-129/less than 80 mm Hg)</SelectItem>
                    <SelectItem value="high">High (130/80 mm Hg or higher)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="smoker"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Do you smoke?
                  </FormLabel>
                  <FormDescription>
                    Current smoking status
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Family History</FormLabel>
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="familyHistory.cancer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Cancer in immediate family
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="familyHistory.heartDisease"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Heart disease in immediate family
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="familyHistory.diabetes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Diabetes in immediate family
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">Calculate Health Risks</Button>
        </form>
      </Form>

      {riskResults && (
        <div className="mt-8">
          <h3 className="text-xl font-medium mb-4">Your Risk Assessment Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Cancer Risk</h4>
                <div className={`text-xl font-bold mb-2 ${getRiskColor(riskResults.cancer.risk)}`}>
                  {riskResults.cancer.risk}
                </div>
                <div className="text-sm space-y-2 mt-4">
                  <p className="font-medium">Recommendations:</p>
                  <ul className="list-disc pl-4">
                    {riskResults.cancer.tips.map((tip, index) => (
                      <li key={index} className="text-gray-600">{tip}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Heart Disease Risk</h4>
                <div className={`text-xl font-bold mb-2 ${getRiskColor(riskResults.heart.risk)}`}>
                  {riskResults.heart.risk}
                </div>
                <div className="text-sm space-y-2 mt-4">
                  <p className="font-medium">Recommendations:</p>
                  <ul className="list-disc pl-4">
                    {riskResults.heart.tips.map((tip, index) => (
                      <li key={index} className="text-gray-600">{tip}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Diabetes Risk</h4>
                <div className={`text-xl font-bold mb-2 ${getRiskColor(riskResults.diabetes.risk)}`}>
                  {riskResults.diabetes.risk}
                </div>
                <div className="text-sm space-y-2 mt-4">
                  <p className="font-medium">Recommendations:</p>
                  <ul className="list-disc pl-4">
                    {riskResults.diabetes.tips.map((tip, index) => (
                      <li key={index} className="text-gray-600">{tip}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <p className="font-medium">Important Note:</p>
            <p className="mt-1">This assessment is based on the limited information provided and is for educational purposes only. It is not a medical diagnosis. Please consult with healthcare professionals for proper medical advice and diagnosis.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRiskCalculator;
