import { useMutation } from '@tanstack/react-query';
import { post } from '../requestHelpers';

export const login = async (payload: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  const response = await post('/auth/login', payload);
  return response.data;
};

export const signup = async (payload: Record<string, unknown>) => {
  const response = await post('/auth/signup', payload);
  return response.data;
};

export const useLoginMutation = (options = {}) =>
  useMutation({
    mutationFn: login,
    ...options,
  });

export const useSignupMutation = (options = {}) =>
  useMutation({
    mutationFn: signup,
    ...options,
  });
