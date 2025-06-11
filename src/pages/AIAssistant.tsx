import { useState, useRef } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Sparkles,
  AlertCircle,
  Dna,
  ExternalLink,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";
import api from "../redux/api";
import { useToast } from "@/components/ui/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "../redux/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AIInsight {
  type: "diagnosis" | "recommendation" | "alert";
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

interface SkinCancerAnalysis {
  confidence: number;
  diagnosis: string;
  input_url: string;
  predicted_class: string;
}

const validGenes = [
  "ABL1",
  "ACVR1",
  "AGO2",
  "AKT1",
  "AKT2",
  "AKT3",
  "ALK",
  "APC",
  "AR",
  "ARAF",
  "ARID1A",
  "ARID1B",
  "ARID2",
  "ARID5B",
  "ASXL1",
  "ASXL2",
  "ATM",
  "ATR",
  "ATRX",
  "AURKA",
  "AURKB",
  "AXIN1",
  "AXL",
  "B2M",
  "BAP1",
  "BARD1",
  "BCL10",
  "BCL2",
  "BCL2L11",
  "BCOR",
  "BRAF",
  "BRCA1",
  "BRCA2",
  "BRD4",
  "BRIP1",
  "BTK",
  "CARD11",
  "CARM1",
  "CASP8",
  "CBL",
  "CCND1",
  "CCND2",
  "CCND3",
  "CCNE1",
  "CDH1",
  "CDK12",
  "CDK4",
  "CDK6",
  "CDK8",
  "CDKN1A",
  "CDKN1B",
  "CDKN2A",
  "CDKN2B",
  "CDKN2C",
  "CEBPA",
  "CHEK2",
  "CIC",
  "CREBBP",
  "CTCF",
  "CTLA4",
  "CTNNB1",
  "DDR2",
  "DICER1",
  "DNMT3A",
  "DNMT3B",
  "DUSP4",
  "EGFR",
  "EIF1AX",
  "ELF3",
  "EP300",
  "EPAS1",
  "EPCAM",
  "ERBB2",
  "ERBB3",
  "ERBB4",
  "ERCC2",
  "ERCC3",
  "ERCC4",
  "ERG",
  "ERRFI1",
  "ESR1",
  "ETV1",
  "ETV6",
  "EWSR1",
  "EZH2",
  "FAM58A",
  "FANCA",
  "FANCC",
  "FAT1",
  "FBXW7",
  "FGF19",
  "FGF3",
  "FGF4",
  "FGFR1",
  "FGFR2",
  "FGFR3",
  "FGFR4",
  "FLT1",
  "FLT3",
  "FOXA1",
  "FOXL2",
  "FOXO1",
  "FOXP1",
  "FUBP1",
  "GATA3",
  "GLI1",
  "GNA11",
  "GNAQ",
  "GNAS",
  "H3F3A",
  "HIST1H1C",
  "HLA-A",
  "HLA-B",
  "HNF1A",
  "HRAS",
  "IDH1",
  "IDH2",
  "IGF1R",
  "IKBKE",
  "IKZF1",
  "IL7R",
  "INPP4B",
  "JAK1",
  "JAK2",
  "JUN",
  "KDM5A",
  "KDM5C",
  "KDM6A",
  "KDR",
  "KEAP1",
  "KIT",
  "KLF4",
  "KMT2A",
  "KMT2B",
  "KMT2C",
  "KMT2D",
  "KNSTRN",
  "KRAS",
  "LATS1",
  "LATS2",
  "MAP2K1",
  "MAP2K2",
  "MAP2K4",
  "MAP3K1",
  "MAPK1",
  "MDM2",
  "MDM4",
  "MED12",
  "MEF2B",
  "MEN1",
  "MET",
  "MGA",
  "MLH1",
  "MPL",
  "MSH2",
  "MSH6",
  "MTOR",
  "MYC",
  "MYCN",
  "MYD88",
  "MYOD1",
  "NCOR1",
  "NF1",
  "NF2",
  "NFE2L2",
  "NFKBIA",
  "NKX2-1",
  "NOTCH1",
  "NOTCH2",
  "NPM1",
  "NRAS",
  "NSD1",
  "NTRK1",
  "NTRK2",
  "NTRK3",
  "NUP93",
  "PAK1",
  "PAX8",
  "PBRM1",
  "PDGFRA",
  "PDGFRB",
  "PIK3CA",
  "PIK3CB",
  "PIK3CD",
  "PIK3R1",
  "PIK3R2",
  "PIK3R3",
  "PIM1",
  "PMS1",
  "PMS2",
  "POLE",
  "PPM1D",
  "PPP2R1A",
  "PPP6C",
  "PRDM1",
  "PTCH1",
  "PTEN",
  "PTPN11",
  "PTPRD",
  "PTPRT",
  "RAB35",
  "RAC1",
  "RAD21",
  "RAD50",
  "RAD51B",
  "RAD51C",
  "RAD51D",
  "RAD54L",
  "RAF1",
  "RARA",
  "RASA1",
  "RB1",
  "RBM10",
  "RET",
  "RHEB",
  "RHOA",
  "RICTOR",
  "RIT1",
  "RNF43",
  "ROS1",
  "RRAS2",
  "RUNX1",
  "RXRA",
  "RYBP",
  "SDHB",
  "SDHC",
  "SETD2",
  "SF3B1",
  "SHOC2",
  "SHQ1",
  "SMAD2",
  "SMAD3",
  "SMAD4",
  "SMARCA4",
  "SMARCB1",
  "SMO",
  "SOS1",
  "SOX9",
  "SPOP",
  "SRC",
  "SRSF2",
  "STAG2",
  "STAT3",
  "STK11",
  "TCF3",
  "TCF7L2",
  "TERT",
  "TET1",
  "TET2",
  "TGFBR1",
  "TGFBR2",
  "TMPRSS2",
  "TP53",
  "TP53BP1",
  "TSC1",
  "TSC2",
  "U2AF1",
  "VEGFA",
  "VHL",
  "WHSC1",
  "WHSC1L1",
  "XPO1",
  "XRCC2",
  "YAP1",
];

const validVariations = [
  "1_2009trunc",
  "2010_2471trunc",
  "256_286trunc",
  "3' Deletion",
  "385_418del",
  "422_605trunc",
  "533_534del",
  "534_536del",
  "550_592del",
  "560_561insER",
  "596_619splice",
  "963_D1010splice",
  "981_1028splice",
  "A1020V",
  "A1022E",
  "A1065T",
  "A1066V",
  "A1099T",
  "A111P",
  "A1131T",
  "A113_splice",
  "A1170V",
  "A11_G12insGA",
  "A1200V",
  "A120S",
  "A121E",
  "A121P",
  "A121V",
  "A122*",
  "A1234T",
  "A126D",
  "A126G",
  "A126S",
  "A126V",
  "A134D",
  "A1374V",
  "A1459P",
  "A146T",
  "A146V",
  "A148T",
  "A149P",
  "A1519T",
  "A151T",
  "A159T",
  "A161S",
  "A161T",
  "A1669S",
  "A1685S",
  "A1701P",
  "A1708E",
  "A1708V",
  "A171V",
  "A1752P",
  "A1752V",
  "A1789S",
  "A1789T",
  "A1823T",
  "A1830T",
  "A1843P",
  "A1843T",
  "A18D",
  "A197T",
  "A19V",
  "A2034V",
  "A205T",
  "A209T",
  "A211D",
  "A232V",
  "A2351G",
  "A23E",
  "A2425T",
  "A246P",
  "A263V",
  "A2643G",
  "A2717S",
  "A272V",
  "A2770T",
  "A290T",
  "A298T",
  "A339V",
  "A347T",
  "A349P",
  "A34D",
  "A36P",
  "A389T",
  "A391E",
  "A39P",
  "A40E",
  "A41P",
  "A41T",
  "A4419S",
  "A459V",
  "A500T",
  "A502_Y503dup",
  "A504_Y505ins",
  "A530T",
  "A530V",
  "A532H",
  "A546D",
  "A57V",
  "A598T",
  "A598V",
  "A59G",
  "A59T",
  "A60V",
  "A614D",
  "A617T",
  "A627T",
  "A633T",
  "A633V",
  "A634D",
  "A634V",
  "A636P",
  "A648T",
  "A677G",
  "A707T",
  "A717G",
  "A723D",
  "A727V",
  "A728V",
  "A72S",
  "A72V",
  "A750P",
  "A750_E758del",
  "A750_E758delinsP",
  "A75P",
  "A763_Y764insFQEA",
  "A767_V769del",
  "A767_V769dup",
  "A77P",
  "A77S",
  "A77T",
  "A829P",
  "A859_L883delinsV",
  "A864T",
  "A883F",
  "A883T",
  "A889P",
  "A8S",
  "A919V",
  "A95D",
];

const AIAssistant = () => {
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Genetic Analysis states
  const [geneName, setGeneName] = useState("");
  const [variation, setVariation] = useState("");
  const [analysisNotes, setAnalysisNotes] = useState("");
  const [geneticResults, setGeneticResults] =
    useState<GeneticAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tumorAnalysis, setTumorAnalysis] = useState<BrainTumorAnalysis | null>(
    null
  );
  const [skinAnalysis, setSkinAnalysis] = useState<SkinCancerAnalysis | null>(
    null
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        // Automatically analyze when image is selected
        if (user?.specialty === "Skin Cancer") {
          handleSkinCancerAnalysis(file);
        } else {
          handleBrainTumorAnalysis(file);
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAiInsights([]);
    setTumorAnalysis(null);
    setSkinAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAIAnalysis = async (file: File) => {
    setIsLoadingAI(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/api/v1/ai/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAiInsights(response.data.insights || []);
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const analyzeGenetics = async () => {
    setIsAnalyzing(true);
    try {
      const response = await api.post("/api/v1/diagnosis/gene-classify", {
        gene: geneName,
        variation: variation,
        text: analysisNotes,
      });

      setGeneticResults(response.data.data);

      toast({
        title: "Analysis Complete",
        description: "Genetic analysis results are ready",
      });
    } catch (error) {
      console.error("Error analyzing genetics:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze genetic information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBrainTumorAnalysis = async (file: File) => {
    setIsLoadingAI(true);
    setTumorAnalysis(null);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post(
        "/api/v1/diagnosis/brain-tumor",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setTumorAnalysis(response.data.data);

      toast({
        title: "Analysis Complete",
        description: "Brain scan analysis results are ready",
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the brain scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSkinCancerAnalysis = async (file: File) => {
    setIsLoadingAI(true);
    setSkinAnalysis(null);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post(
        "/api/v1/diagnosis/skin-cancer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSkinAnalysis(response.data.data);

      toast({
        title: "Analysis Complete",
        description: "Skin lesion analysis results are ready",
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Analysis Failed",
        description:
          "Failed to analyze the skin lesion image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "diagnosis":
        return <Brain className="w-5 h-5 text-blue-500" />;
      case "recommendation":
        return <Sparkles className="w-5 h-5 text-green-500" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  const getPredictionColor = (prediction: number) => {
    if (prediction >= 4) return "text-green-600";
    if (prediction >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getTumorClassName = (className: string) => {
    switch (className) {
      case "no_tumor":
        return "No Tumor Detected";
      case "glioma":
        return "Glioma";
      case "meningioma":
        return "Meningioma";
      case "pituitary":
        return "Pituitary Tumor";
      default:
        return className;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">AI Medical Assistant</h1>
          <p className="text-gray-500">
            Get AI-powered insights and recommendations for your medical
            practice
          </p>
        </div>

        {/* Genetic Analysis Section */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md border-indigo-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Dna className="w-6 h-6" />
              Genetic Analysis
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Analyze genetic variations to assess mutation risks and treatment
              recommendations
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Gene Name
                    </label>
                    <Select value={geneName} onValueChange={setGeneName}>
                      <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
                        <SelectValue placeholder="Select a gene" />
                      </SelectTrigger>
                      <SelectContent>
                        {validGenes.map((gene) => (
                          <SelectItem key={gene} value={gene}>
                            {gene}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Variation
                    </label>
                    <Select value={variation} onValueChange={setVariation}>
                      <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
                        <SelectValue placeholder="Select a variation" />
                      </SelectTrigger>
                      <SelectContent>
                        {validVariations.map((var_) => (
                          <SelectItem key={var_} value={var_}>
                            {var_}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Analysis Notes
                    </label>
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
                      "Analyze Genetic Variation"
                    )}
                  </Button>
                </div>

                <div className="bg-white rounded-lg p-6 border border-indigo-100">
                  {geneticResults ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-900">
                          Analysis Results
                        </h3>
                        <div className="mt-4 space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Gene:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {geneName}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Variation:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {variation}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Treatment Recommendation
                        </h4>
                        <p className="text-sm text-gray-600">
                          {geneticResults.treatment}
                        </p>
                      </div>
                      {geneticResults.url && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Reference
                          </h4>
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

        {/* Updated Image Analysis Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-md border-blue-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Brain className="w-6 h-6" />
              {user?.specialty === "Skin Cancer"
                ? "Skin Lesion Analysis"
                : "Brain Scan Analysis"}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {user?.specialty === "Skin Cancer"
                ? "Upload skin lesion images for AI-powered cancer detection"
                : "Upload brain scan images for AI-powered tumor detection"}
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
                        <p className="text-sm font-medium text-gray-700">
                          Click to upload{" "}
                          {user?.specialty === "Skin Cancer"
                            ? "a skin lesion image"
                            : "a brain scan"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          or drag and drop
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        Supported formats: JPG, PNG
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt={
                        user?.specialty === "Skin Cancer"
                          ? "Selected skin lesion"
                          : "Selected brain scan"
                      }
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
                    <p className="text-sm text-gray-600">
                      Analyzing{" "}
                      {user?.specialty === "Skin Cancer"
                        ? "skin lesion"
                        : "brain scan"}
                      ...
                    </p>
                  </div>
                )}
              </div>

              {(user?.specialty === "Skin Cancer"
                ? skinAnalysis
                : tumorAnalysis) && (
                <div className="space-y-4 border-t border-blue-100 pt-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Analysis Results
                  </h3>
                  <div className="bg-white rounded-lg p-6 border border-gray-100">
                    {user?.specialty === "Skin Cancer" ? (
                      // Skin Cancer Results
                      <div className="space-y-4">
                        <div>
                          <p className="text-lg font-semibold text-blue-700">
                            {skinAnalysis?.diagnosis}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {skinAnalysis?.predicted_class}
                          </p>
                          <p className="text-sm font-medium text-gray-600 mt-1">
                            {skinAnalysis?.confidence?.toFixed(2)}
                          </p>
                        </div>
                        {skinAnalysis?.input_url && (
                          <div className="mt-4">
                            <img
                              src={skinAnalysis.input_url}
                              alt="Processed skin lesion"
                              className="max-w-full h-auto rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      // Brain Tumor Results
                      <div className="space-y-4">
                        <div>
                          <p className="text-lg font-semibold text-blue-700">
                            {getTumorClassName(tumorAnalysis?.class || "")}
                          </p>
                          <p className="text-sm font-medium text-gray-600">
                            {(tumorAnalysis?.confidence || 0 * 100).toFixed(2)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {tumorAnalysis?.predictions &&
                            Object.entries(tumorAnalysis.predictions).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between items-center"
                                >
                                  <span className="text-sm text-gray-600">
                                    {getTumorClassName(key)}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {(value * 100).toFixed(2)}
                                  </span>
                                </div>
                              )
                            )}
                        </div>

                        {tumorAnalysis?.processing_time && (
                          <div className="text-xs text-gray-500">
                            {tumorAnalysis.processing_time.toFixed(2)}s
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!imagePreview && !isLoadingAI && (
                <div className="text-center py-4 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>
                    Upload{" "}
                    {user?.specialty === "Skin Cancer"
                      ? "a skin lesion image"
                      : "a brain scan"}{" "}
                    to get AI-powered analysis
                  </p>
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
