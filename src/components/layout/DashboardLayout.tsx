import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/types';
import Header from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) {
    return <div className="p-8 text-center">Please log in to view the dashboard.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 p-4 md:p-6 bg-gray-50">
        {children}
      </div>
    </div>
  );
}
