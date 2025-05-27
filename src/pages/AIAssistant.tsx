import { useState, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Sparkles, AlertCircle, Dna, ExternalLink, Image as ImageIcon, X, Upload } from 'lucide-react';
import api from '../redux/api';
import { useToast } from "@/components/ui/use-toast";

interface AIInsight {
  type: 'diagnosis' | 'recommendation' | 'alert';
  content: string;
  confidence: number;
}

interface GeneticAnalysisResponse {
  prediction: number;
  treatment: string;
  url: string;
}

interface BrainTumorAnalysis {
  class: string;
  confidence: number;
  predictions: {
    glioma: number;
    meningioma: number;
    no_tumor: number;
    pituitary: number;
  };
  processing_time: number;
}

const AIAssistant = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Genetic Analysis states
  const [geneName, setGeneName] = useState('');
  const [variation, setVariation] = useState('');
  const [analysisNotes, setAnalysisNotes] = useState('');
  const [geneticResults, setGeneticResults] = useState<GeneticAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tumorAnalysis, setTumorAnalysis] = useState<BrainTumorAnalysis | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        // Automatically analyze when image is selected
        handleBrainTumorAnalysis(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAiInsights([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAIAnalysis = async (file: File) => {
    setIsLoadingAI(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/api/v1/ai/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAiInsights(response.data.insights || []);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const analyzeGenetics = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.post('/api/v1/diagnosis/gene-classify', {
        gene: geneName,
        variation: variation,
        text: analysisNotes
      });

      setGeneticResults(response.data.data);
      
      toast({
        title: "Analysis Complete",
        description: "Genetic analysis results are ready",
      });
    } catch (error) {
      console.error('Error analyzing genetics:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze genetic information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBrainTumorAnalysis = async (file: File) => {
    setIsLoadingAI(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/api/v1/diagnosis/brain-tumor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTumorAnalysis(response.data.data);
      
      toast({
        title: "Analysis Complete",
        description: "Brain scan analysis results are ready",
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the brain scan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'diagnosis':
        return <Brain className="w-5 h-5 text-blue-500" />;
      case 'recommendation':
        return <Sparkles className="w-5 h-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPredictionColor = (prediction: number) => {
    if (prediction >= 4) return 'text-green-600';
    if (prediction >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTumorClassName = (className: string) => {
    switch (className) {
      case 'no_tumor':
        return 'No Tumor Detected';
      case 'glioma':
        return 'Glioma';
      case 'meningioma':
        return 'Meningioma';
      case 'pituitary':
        return 'Pituitary Tumor';
      default:
        return className;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">AI Medical Assistant</h1>
          <p className="text-gray-500">Get AI-powered insights and recommendations for your medical practice</p>
        </div>

        {/* Genetic Analysis Section */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md border-indigo-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Dna className="w-6 h-6" />
              Genetic Analysis
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Analyze genetic variations to assess mutation risks and treatment recommendations
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Gene Name</label>
                    <Input
                      placeholder="e.g., BRCA1"
                      value={geneName}
                      onChange={(e) => setGeneName(e.target.value)}
                      className="border-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Variation</label>
                    <Input
                      placeholder="e.g., V600E"
                      value={variation}
                      onChange={(e) => setVariation(e.target.value)}
                      className="border-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Analysis Notes</label>
                    <Input
                      placeholder="Enter patient genetic report information..."
                      value={analysisNotes}
                      onChange={(e) => setAnalysisNotes(e.target.value)}
                      className="border-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <Button
                    onClick={analyzeGenetics}
                    disabled={isAnalyzing || !geneName || !variation}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Analyzing...
                      </div>
                    ) : (
                      'Analyze Genetic Variation'
                    )}
                  </Button>
                </div>

                <div className="bg-white rounded-lg p-6 border border-indigo-100">
                  {geneticResults ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-900">Analysis Results</h3>
                        <div className="mt-4 space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Gene:</span>
                            <span className="ml-2 text-gray-900">{geneName}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Variation:</span>
                            <span className="ml-2 text-gray-900">{variation}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Prediction Score:</span>
                            <span className={`ml-2 font-medium ${getPredictionColor(geneticResults.prediction)}`}>
                              {geneticResults.prediction}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Treatment Recommendation</h4>
                        <p className="text-sm text-gray-600">{geneticResults.treatment}</p>
                      </div>
                      {geneticResults.url && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Reference</h4>
                          <a 
                            href={geneticResults.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            View Research Paper
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Dna className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Submit genetic information to get analysis results</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updated Brain Scan Analysis Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-md border-blue-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Brain className="w-6 h-6" />
              Brain Scan Analysis
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Upload brain scan images for AI-powered tumor detection
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                {!imagePreview ? (
                  <div 
                    className="border-2 border-dashed border-blue-200 rounded-lg p-8 w-full max-w-md hover:border-blue-400 transition-colors cursor-pointer bg-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Upload className="w-10 h-10 text-blue-500" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">Click to upload a brain scan</p>
                        <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-400">Supported formats: JPG, PNG</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Selected brain scan"
                      className="max-w-md w-full h-auto rounded-lg border border-blue-200 shadow-md"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {isLoadingAI && (
                  <div className="mt-6 flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <p className="text-sm text-gray-600">Analyzing brain scan...</p>
                  </div>
                )}
              </div>

              {tumorAnalysis && (
                <div className="space-y-4 border-t border-blue-100 pt-6">
                  <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
                  <div className="bg-white rounded-lg p-6 border border-gray-100">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">Diagnosis</h4>
                          <p className="text-lg font-semibold text-blue-700">
                            {getTumorClassName(tumorAnalysis.class)}
                          </p>
                        </div>
                        <span className={`text-sm font-medium ${getConfidenceColor(tumorAnalysis.confidence)}`}>
                          {Math.round(tumorAnalysis.confidence * 100)}% confidence
                        </span>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Detailed Predictions</h4>
                        <div className="space-y-2">
                          {Object.entries(tumorAnalysis.predictions).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{getTumorClassName(key)}</span>
                              <span className="text-sm font-medium">
                                {Math.round(value * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Processing Time: {tumorAnalysis.processing_time.toFixed(2)}s
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!imagePreview && !isLoadingAI && (
                <div className="text-center py-4 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Upload a brain scan to get AI-powered analysis</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant; 