import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockDoctors } from "@/data/mockData";
import { DoctorProfile } from "@/types";
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Search, Heart, MessageSquare, Calendar } from "lucide-react";
import MessageButton from '@/components/common/MessageButton';

interface Contribution {
  id: string;
  title: string;
  content: string;
  date: string;
  doctorId: string;
  likes: number;
  comments: number;
  category: "article" | "case" | "research";
}

// Mock data for contributions
const mockContributions: Contribution[] = [
  {
    id: "contrib1",
    title: "Managing Hypertension in Elderly Patients",
    content:
      "Hypertension is a common condition in elderly patients. This article discusses the latest guidelines for management.",
    date: "2025-03-15T10:30:00Z",
    doctorId: "doctor1",
    likes: 45,
    comments: 12,
    category: "article",
  },
  {
    id: "contrib2",
    title: "Case Study: Rare Presentation of Lyme Disease",
    content:
      "A 42-year-old patient presented with unusual symptoms that were eventually diagnosed as Lyme disease.",
    date: "2025-02-22T14:15:00Z",
    doctorId: "doctor2",
    likes: 28,
    comments: 8,
    category: "case",
  },
  {
    id: "contrib3",
    title: "New Research on Antibiotic Resistance",
    content:
      "Our team's recent research has uncovered potential new strategies for combating antibiotic resistance.",
    date: "2025-03-10T09:45:00Z",
    doctorId: "doctor3",
    likes: 67,
    comments: 23,
    category: "research",
  },
];

const DoctorContributions = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      // Simulate API fetch
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockDoctors.filter(doc => doc.role === "doctor") as DoctorProfile[];
    },
  });

  const { data: contributions } = useQuery({
    queryKey: ["contributions"],
    queryFn: async () => {
      // Simulate API fetch
      await new Promise((resolve) => setTimeout(resolve, 700));
      return mockContributions;
    },
  });

  const isDoctor = currentUser?.role === "doctor";

  const handleNewContribution = () => {
    if (!isDoctor) {
      toast({
        title: "Permission denied",
        description: "Only doctors can create new contributions",
        variant: "destructive",
      });
      return;
    }
    navigate('/doctor-contributions/new');
  };

  const filteredContributions = contributions?.filter((contrib) => {
    // Filter by search query
    const matchesSearch =
      contrib.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contrib.content.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by tab
    const matchesTab =
      activeTab === "all" || contrib.category === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Doctor Contributions</h1>
            <p className="text-muted-foreground mt-1">
              Expert insights, case studies, and research from our medical professionals
            </p>
          </div>
          
          {isDoctor && (
            <Button onClick={handleNewContribution}>
              <Plus className="mr-2 h-4 w-4" />
              New Contribution
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contributions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="article">Articles</TabsTrigger>
                <TabsTrigger value="case">Case Studies</TabsTrigger>
                <TabsTrigger value="research">Research</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-6">
                {filteredContributions?.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <p className="text-muted-foreground mb-4">No contributions found</p>
                      {isDoctor && (
                        <Button onClick={handleNewContribution}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create your first contribution
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredContributions?.map((contribution) => {
                      const doctor = doctors?.find(
                        (doc) => doc.id === contribution.doctorId
                      );

                      return (
                        <Card
                          key={contribution.id}
                          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate(`/healthy-talk/${contribution.id}`)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage src={doctor?.profileImage} alt={doctor?.name} />
                                <AvatarFallback>
                                  {doctor?.name?.charAt(0) || "D"}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg">
                                      {contribution.title}
                                    </h3>
                                    <div className="flex items-center mt-1">
                                      <span className="text-sm font-medium">
                                        Dr. {doctor?.name}
                                      </span>
                                      {doctor && doctor.role === 'doctor' && (
                                        <span className="text-sm text-muted-foreground ml-2">
                                          {doctor.specialty}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <span className="text-xs text-muted-foreground flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(contribution.date).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <p className="text-muted-foreground mt-2">
                                  {contribution.content}
                                </p>
                                
                                <div className="flex mt-4">
                                  <span className="text-sm flex items-center mr-4">
                                    <Heart className="h-4 w-4 mr-1" />
                                    {contribution.likes}
                                  </span>
                                  <span className="text-sm flex items-center">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    {contribution.comments}
                                  </span>
                                  <span className="ml-auto text-xs bg-accent px-2 py-1 rounded-full">
                                    {contribution.category === "article"
                                      ? "Article"
                                      : contribution.category === "case"
                                      ? "Case Study"
                                      : "Research"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Top Contributors</h3>
                <div className="space-y-3">
                  {doctors?.slice(0, 5).map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex items-center justify-between gap-2 cursor-pointer hover:bg-accent p-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-2" onClick={() => navigate(`/doctor/${doctor.id}`)}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={doctor.profileImage} alt={doctor.name} />
                          <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Dr. {doctor.name}</p>
                          {doctor.role === 'doctor' && (
                            <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                          )}
                        </div>
                      </div>
                      <MessageButton 
                        userId={doctor.id}
                        variant="ghost"
                        size="sm"
                        showIcon={true}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  <Button
                    variant={activeTab === "all" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("all")}
                  >
                    All Categories
                  </Button>
                  <Button
                    variant={activeTab === "article" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("article")}
                  >
                    Articles
                  </Button>
                  <Button
                    variant={activeTab === "case" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("case")}
                  >
                    Case Studies
                  </Button>
                  <Button
                    variant={activeTab === "research" ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("research")}
                  >
                    Research
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorContributions;
