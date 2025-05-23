
import { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BMICalculator from '@/components/tools/BMICalculator';
import HealthRiskCalculator from '@/components/tools/HealthRiskCalculator';
import SymptomChecker from '@/components/tools/SymptomChecker';

const HealthTools = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Tools</h1>
          <p className="text-gray-600">
            Use these interactive tools to monitor your health status and learn more about potential risks
          </p>
        </div>

        <Tabs defaultValue="bmi" className="w-full">
          <TabsList className="mb-6 bg-gray-100">
            <TabsTrigger value="bmi">BMI Calculator</TabsTrigger>
            <TabsTrigger value="risk">Health Risk Assessment</TabsTrigger>
            <TabsTrigger value="symptom">Symptom Checker</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bmi" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Body Mass Index (BMI) Calculator</CardTitle>
                <CardDescription>
                  Calculate your BMI to determine if your weight is within a healthy range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BMICalculator />
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                <p>BMI is a screening tool, not a diagnostic of body fatness or health.</p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="risk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Health Risk Assessment</CardTitle>
                <CardDescription>
                  Evaluate your risk for common health conditions based on your health data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HealthRiskCalculator />
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                <p>This assessment provides estimations only and should not replace professional medical advice.</p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="symptom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Symptom Checker</CardTitle>
                <CardDescription>
                  Enter your symptoms to get guidance on potential conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SymptomChecker />
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                <p>This tool does not provide medical diagnoses and is for informational purposes only.</p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default HealthTools;
