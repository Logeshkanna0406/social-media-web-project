import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ResumeAnalyzerModal } from '../components/ai/ResumeAnalyzerModal';
import { BioGeneratorModal } from '../components/ai/BioGeneratorModal';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { MapPin, Globe, Github, Linkedin, Twitter, Sparkles, Edit3, Briefcase, GraduationCap, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { User, Profile } from '../types';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const isOwnProfile = !userId || (currentUser && currentUser.id === userId);
  const targetId = userId || currentUser?.id || 'usr-demo-1';

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/users/${targetId}`);
      setProfileUser(res.data.user);
      setProfile(res.data.profile);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  if (isLoading || !profileUser) {
    return <div className="text-center py-20 text-slate-400">Loading Profile...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Cover & Main Profile Header */}
      <GlassCard className="!p-0 overflow-hidden">
        <div className="h-44 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 relative">
          {profileUser.coverUrl && (
            <img src={profileUser.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
          )}
        </div>

        <div className="p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 mb-4">
            <img
              src={profileUser.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt={profileUser.fullName}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-900 shadow-2xl bg-slate-800"
            />
            {isOwnProfile && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditProfileModalOpen(true)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-400" />}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBioModalOpen(true)}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                >
                  AI Bio Builder
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => setIsResumeModalOpen(true)}
                  leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                >
                  AI Resume Review
                </Button>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-white">{profileUser.fullName}</h2>
          <p className="text-sm font-medium text-indigo-400 mt-0.5">{profileUser.headline}</p>

          {profile?.bio && (
            <p className="text-xs text-slate-300 mt-3 leading-relaxed max-w-2xl">{profile.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {profile.location}
              </span>
            )}
            {profile?.websiteUrl && (
              <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" /> Website
              </a>
            )}
            {profile?.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                <Github className="w-3.5 h-3.5" /> GitHub
              </a>
            )}
            {profile?.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Skills Grid */}
      <GlassCard>
        <h3 className="text-sm font-bold text-slate-100 mb-3">Technical Skills & Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map((skill) => (
              <Badge key={skill.id} variant="brand" size="md">
                {skill.name} {skill.level ? `(${skill.level})` : ''}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-500">No skills specified yet. Click 'Edit Profile' to add your tech stack.</span>
          )}
        </div>
      </GlassCard>

      {/* Experience Timeline */}
      <GlassCard>
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-4">
          <Briefcase className="w-4 h-4 text-indigo-400" /> Experience
        </h3>
        <div className="flex flex-col gap-4">
          {profile?.experiences && profile.experiences.length > 0 ? (
            profile.experiences.map((exp) => (
              <div key={exp.id} className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-100">{exp.position}</h4>
                  <span className="text-[10px] text-slate-400">
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : ''} - {' '}
                    {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : '')}
                  </span>
                </div>
                <span className="text-xs font-semibold text-indigo-400">{exp.company}</span>
                {exp.description && <p className="text-xs text-slate-300 mt-1">{exp.description}</p>}
              </div>
            ))
          ) : (
            <span className="text-xs text-slate-500">No work experience listed yet. Click 'Edit Profile' to add position history.</span>
          )}
        </div>
      </GlassCard>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        user={profileUser}
        profile={profile}
        onProfileUpdated={fetchProfile}
      />
      <ResumeAnalyzerModal isOpen={isResumeModalOpen} onClose={() => setIsResumeModalOpen(false)} />
      <BioGeneratorModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        onBioAccepted={(newBio) => {
          if (profile) setProfile({ ...profile, bio: newBio });
        }}
      />
    </div>
  );
};
