import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { AuthPage } from '../features/auth/pages/AuthPage';
import { NotesPage } from '../features/notes/pages/NotesPage';
import { QuestionsPage } from '../features/questions/pages/QuestionsPage';
import { GoalsPage } from '../features/goals/pages/GoalsPage';
import { RevisionPage } from '../features/revision/pages/RevisionPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { TaxonomyPage } from '../features/taxonomy/pages/TaxonomyPage';

const AuthGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-medium">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

const GuestGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-medium">
        Loading...
      </div>
    );
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export const routes = [
  {
    element: <GuestGuard />,
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
      },
      {
        path: '/notes',
        element: <NotesPage />,
      },
      {
        path: '/questions',
        element: <QuestionsPage />,
      },
      {
        path: '/goals',
        element: <GoalsPage />,
      },
      {
        path: '/revision',
        element: <RevisionPage />,
      },
      {
        path: '/taxonomy',
        element: <TaxonomyPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];
