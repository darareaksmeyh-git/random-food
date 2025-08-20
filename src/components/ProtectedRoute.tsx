import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/joy';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated - using your login logic
      const admin = localStorage.getItem('admin');
      
      if (admin === 'true') {
        setIsAuthenticated(true);
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    // Show loading spinner while checking authentication
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#000'
        }}
      >
        <CircularProgress size="lg" />
        <Typography sx={{ color: '#fff' }}>Checking authentication...</Typography>
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}