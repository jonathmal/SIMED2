// client/src/components/auth/withAuth.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';

export function withAuth(WrappedComponent, allowedRoles = []) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = () => {
        if (!authService.isAuthenticated()) {
          router.replace('/login');
          return;
        }

        if (allowedRoles.length > 0) {
          const user = authService.getCurrentUser();
          if (!user || !allowedRoles.includes(user.rol)) {
            router.replace('/unauthorized');
            return;
          }
        }

        setLoading(false);
      };

      checkAuth();
    }, [router]);

    if (loading) {
      return <div>Cargando...</div>; // Consider using a proper loading component
    }

    return <WrappedComponent {...props} />;
  };
}