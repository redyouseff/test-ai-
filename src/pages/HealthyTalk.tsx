import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, PlusCircle } from "lucide-react";
import HealthPost from '@/components/healthyTalk/HealthPost';
import { HealthPostFilters } from '@/components/healthyTalk/HealthPostFilters';
import { fetchHealthPosts } from '@/api/healthyTalk';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { useNavigate } from 'react-router-dom';

const HealthyTalk = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const { data: healthPosts, isLoading, error } = useQuery({
    queryKey: ['healthPosts', selectedSpecialty, selectedDoctor],
    queryFn: () => fetchHealthPosts(selectedSpecialty, selectedDoctor)
  });

  const filteredPosts = healthPosts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePost = () => {
    navigate('/doctor-contributions');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-bold text-center mb-2">Healthy Talk</h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl">
            Expert medical insights, tips, and discussions from our community of healthcare professionals and patients
          </p>
          
          <div className="flex w-full max-w-lg mt-6 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search articles..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button>Search</Button>
            {currentUser && (
              <Button onClick={handleCreatePost} className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-1" />
                Create Post
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <HealthPostFilters 
              onSpecialtyChange={setSelectedSpecialty}
              onDoctorChange={setSelectedDoctor}
              selectedSpecialty={selectedSpecialty}
              selectedDoctor={selectedDoctor}
            />
          </div>
          
          <div className="lg:col-span-9">
            <Tabs defaultValue="latest" className="w-full mb-6">
              <TabsList>
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {isLoading ? (
              <div className="flex justify-center">
                <p>Loading posts...</p>
              </div>
            ) : error ? (
              <div className="text-red-500">
                Error loading posts. Please try again later.
              </div>
            ) : filteredPosts && filteredPosts.length > 0 ? (
              <div className="space-y-8">
                {filteredPosts.map((post) => (
                  <HealthPost key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-accent rounded-lg">
                <h3 className="font-semibold text-xl">No posts found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters or search term</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HealthyTalk;
