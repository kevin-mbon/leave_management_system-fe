import { useAuth } from '@/context/AuthContext';

export const useUser = () => {
  const { getUser, hasRole } = useAuth();
  const user = getUser();

  return {
    user,
    isAdmin: hasRole('ADMIN'),
    isApproved: user?.status === 'APPROVED',
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    department: user?.department || '',
    email: user?.email || '',
  };
};

export default useUser; 