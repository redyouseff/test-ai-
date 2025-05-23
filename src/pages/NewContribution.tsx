import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const NewContribution = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'article' | 'case' | 'research'>('article');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    // هنا يمكنك إرسال البيانات إلى API أو mock
    setTimeout(() => {
      console.log({
        title,
        content,
        category,
        doctorId: currentUser?.id,
        date: new Date().toISOString(),
      });
      toast({
        title: 'Post Created',
        description: 'Your contribution has been published!',
      });
      setLoading(false);
      navigate('/doctor-contributions');
    }, 1000);
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Create New Contribution</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-1 font-medium">Title</label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter the title"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Content</label>
                <textarea
                  className="w-full border rounded p-2 min-h-[120px]"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your article, case, or research..."
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Type</label>
                <Tabs defaultValue={category} onValueChange={val => setCategory(val as any)}>
                  <TabsList>
                    <TabsTrigger value="article">Article</TabsTrigger>
                    <TabsTrigger value="case">Case Study</TabsTrigger>
                    <TabsTrigger value="research">Research</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <Button type="submit" className="w-full bg-primary text-white" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewContribution; 