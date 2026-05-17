import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/resources';
import { useAuthStore } from '../../store/auth.store';
import { getErrorMessage } from '../../utils/helpers';
import { Briefcase } from 'lucide-react';
import { useState } from 'react';

interface FormData {
  name: string; email: string; password: string; businessName?: string;
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  const setAuth = useAuthStore((s: any) => s.setAuth);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function onSubmit(data: FormData) {
    try {
      setError('');
      const res = await authApi.register(data);
      setAuth(res.token, res.user);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start managing your freelance business</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="label">Full name <span className="text-red-500">*</span></label>
              <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                className="input" placeholder="Alex Johnson" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Business name <span className="text-gray-400 font-normal">(optional)</span></label>
              <input {...register('businessName')} className="input" placeholder="AJ Design Studio" />
            </div>

            <div>
              <label className="label">Email address <span className="text-red-500">*</span></label>
              <input {...register('email', { required: 'Email is required' })}
                type="email" className="input" placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password <span className="text-red-500">*</span></label>
              <input {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                type="password" className="input" placeholder="Min 8 characters" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}