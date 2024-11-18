# Frontend Documentation

## Architecture Overview

### Tech Stack
- React with TypeScript
- Vite for build tooling
- TanStack Query for API state management
- Zustand for global state
- Tailwind CSS for styling
- Socket.IO client for real-time updates

### Core Components

```typescript
// src/components/Layout/DashboardLayout.tsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
```

### State Management

```typescript
// src/store/auth.store.ts
import create from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: async (credentials) => {
    const response = await api.auth.login(credentials);
    set({ user: response.user, token: response.token });
    localStorage.setItem('token', response.token);
  },
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  }
}));
```

## API Integration

### API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Query Hooks

```typescript
// src/hooks/usePrescriptions.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api/client';

export const usePrescriptions = (patientId: string) => {
  return useQuery(['prescriptions', patientId], async () => {
    const { data } = await api.get(`/prescriptions?patientId=${patientId}`);
    return data;
  });
};

export const useCreatePrescription = () => {
  return useMutation(async (prescription: PrescriptionData) => {
    const { data } = await api.post('/prescriptions', prescription);
    return data;
  });
};
```

## Real-time Updates

```typescript
// src/services/socket.service.ts
import io from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

const socket = io(import.meta.env.VITE_WS_URL, {
  autoConnect: false
});

export const initializeSocket = () => {
  const token = useAuthStore.getState().token;
  
  socket.auth = { token };
  socket.connect();

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('prescription_update', (data) => {
    // Handle real-time prescription updates
  });
};
```

## Protected Routes

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

## Form Handling

```typescript
// src/components/PrescriptionForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { prescriptionSchema } from '../schemas/prescription.schema';

const PrescriptionForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(prescriptionSchema)
  });

  const onSubmit = async (data) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

## Error Handling

```typescript
// src/utils/error.utils.ts
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
  } else {
    toast.error('An unexpected error occurred');
  }
};
```

## Environment Configuration

```env
# .env.development
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
VITE_ENABLE_MOCK_API=true

# .env.production
VITE_API_URL=/api
VITE_WS_URL=wss://your-domain.com
VITE_ENABLE_MOCK_API=false
```

## Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```