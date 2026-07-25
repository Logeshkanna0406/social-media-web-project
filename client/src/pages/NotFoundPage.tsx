import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <GlassCard className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-extrabold text-indigo-400">404</h1>
        <h2 className="text-xl font-bold text-white mt-2">Page Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          The requested page or route does not exist on ConnectHub AI.
        </p>
        <Link to="/feed">
          <Button variant="gradient" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Back to Feed
          </Button>
        </Link>
      </GlassCard>
    </div>
  );
};
