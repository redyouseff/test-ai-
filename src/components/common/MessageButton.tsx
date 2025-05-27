import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface MessageButtonProps {
  userId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

const API_BASE_URL = 'https://care-insight-api-9ed25d3ea3ea.herokuapp.com';

const MessageButton = ({ 
  userId, 
  variant = 'ghost',
  size = 'icon',
  showIcon = true,
  className = ''
}: MessageButtonProps) => {
  const navigate = useNavigate();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Try to fetch existing messages with this user
      const response = await fetch(`${API_BASE_URL}/api/v1/message/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok && response.status !== 404) {
        throw new Error('Failed to check messages');
      }

      // Whether we have existing messages or not, navigate to the messages page
      // The Messages component will handle both cases
      navigate(`/message/${userId}`);

    } catch (error) {
      console.error('Error checking messages:', error);
      // Still navigate to messages page even if check fails
      navigate(`/message/${userId}`);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      {showIcon && <MessageSquare className="h-4 w-4" />}
      {size !== 'icon' && 'Message'}
    </Button>
  );
};

export default MessageButton; 