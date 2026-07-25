import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Upload, Plus, Trash2, Camera, MapPin, Globe, Github, Linkedin, Twitter } from 'lucide-react';
import { api } from '../../services/api';
import { User, Profile, Skill, Experience, Education } from '../../types';
import { useToast } from '../../hooks/useToast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  profile: Profile | null;
  onProfileUpdated: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  onProfileUpdated
}) => {
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(user.fullName || '');
  const [headline, setHeadline] = useState(user.headline || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl || '');
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || '');
  const [twitterUrl, setTwitterUrl] = useState(profile?.twitterUrl || '');

  // Media Base64 Data URIs
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(null);
  const [coverDataUri, setCoverDataUri] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatarUrl || '');
  const [coverPreview, setCoverPreview] = useState<string>(user.coverUrl || '');

  // Skills State
  const [skills, setSkills] = useState<Skill[]>(profile?.skills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');

  // Experience State
  const [experiences, setExperiences] = useState<Experience[]>(profile?.experiences || []);
  const [newExp, setNewExp] = useState({
    company: '', position: '', location: '', startDate: '', endDate: '', isCurrent: false, description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert File to Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File too large', 'Please select an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'avatar') {
        setAvatarDataUri(base64);
        setAvatarPreview(base64);
      } else {
        setCoverDataUri(base64);
        setCoverPreview(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { id: `sk-${Date.now()}`, name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const handleAddExperience = () => {
    if (!newExp.company || !newExp.position || !newExp.startDate) {
      addToast('error', 'Incomplete experience fields');
      return;
    }
    setExperiences([
      ...experiences,
      {
        id: `exp-${Date.now()}`,
        company: newExp.company,
        position: newExp.position,
        location: newExp.location,
        startDate: newExp.startDate,
        endDate: newExp.isCurrent ? null : newExp.endDate,
        isCurrent: newExp.isCurrent,
        description: newExp.description
      }
    ]);
    setNewExp({ company: '', position: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' });
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter(e => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        fullName,
        headline,
        bio,
        location,
        websiteUrl,
        githubUrl,
        linkedinUrl,
        twitterUrl,
        avatarDataUri,
        coverDataUri,
        skills,
        experiences
      };

      const res = await api.put('/users/profile', payload);
      
      // Update local storage cached user if avatar/name updated
      const currentUser = JSON.parse(localStorage.getItem('connecthub_user') || '{}');
      const updatedUser = { ...currentUser, ...res.data.user };
      localStorage.setItem('connecthub_user', JSON.stringify(updatedUser));

      addToast('success', 'Profile Updated!', 'Your profile and Cloudinary images are saved.');
      onProfileUpdated();
      onClose();
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Professional Profile" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Cover & Avatar Upload Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
          <div className="h-32 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 relative">
            {coverPreview && (
              <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover opacity-80" />
            )}
            <label className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black rounded-xl text-white text-xs cursor-pointer flex items-center gap-1.5 backdrop-blur-md">
              <Camera className="w-4 h-4 text-indigo-400" />
              <span>Change Cover</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, 'cover')} />
            </label>
          </div>

          <div className="p-4 flex items-end justify-between -mt-12">
            <div className="relative group">
              <img
                src={avatarPreview || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-900 bg-slate-800"
              />
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white cursor-pointer transition-opacity">
                <Camera className="w-5 h-5 text-indigo-400" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageFileChange(e, 'avatar')} />
              </label>
            </div>
            <span className="text-[11px] text-slate-400">Click avatar/cover to upload image file</span>
          </div>
        </div>

        {/* Core Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Professional Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Senior Full Stack Engineer" />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300">About / Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your professional story..."
            className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 placeholder-slate-400 resize-none mt-1"
          />
        </div>

        {/* Links & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} icon={<MapPin className="w-4 h-4 text-slate-400" />} />
          <Input label="Website" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} icon={<Globe className="w-4 h-4 text-slate-400" />} />
          <Input label="GitHub URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} icon={<Github className="w-4 h-4 text-slate-400" />} />
          <Input label="LinkedIn URL" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} icon={<Linkedin className="w-4 h-4 text-slate-400" />} />
        </div>

        {/* Skills Section */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-200">Skills & Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {skills.map(s => (
              <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-300">
                {s.name} ({s.level || 'Intermediate'})
                <button type="button" onClick={() => handleRemoveSkill(s.id)} className="hover:text-rose-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 items-center mt-1">
            <input
              type="text"
              placeholder="Add skill (e.g. React, Docker)"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="flex-1 glass-input rounded-xl px-3 py-1.5 text-xs text-slate-100"
            />
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              className="glass-input rounded-xl px-2 py-1.5 text-xs text-slate-100 bg-slate-900"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
            <Button type="button" variant="outline" size="sm" onClick={handleAddSkill}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Experience Section */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-200">Work Experience</h4>
          <div className="flex flex-col gap-2">
            {experiences.map(exp => (
              <div key={exp.id} className="p-3 rounded-lg bg-slate-950 border border-white/5 flex justify-between items-start">
                <div>
                  <h5 className="text-xs font-bold text-slate-100">{exp.position} at {exp.company}</h5>
                  <p className="text-[11px] text-slate-400">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
                </div>
                <button type="button" onClick={() => handleRemoveExperience(exp.id)} className="text-slate-400 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Experience Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <input
              type="text"
              placeholder="Company Name"
              value={newExp.company}
              onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
              className="glass-input rounded-lg px-3 py-1.5 text-xs text-slate-100"
            />
            <input
              type="text"
              placeholder="Position Title"
              value={newExp.position}
              onChange={(e) => setNewExp({ ...newExp, position: e.target.value })}
              className="glass-input rounded-lg px-3 py-1.5 text-xs text-slate-100"
            />
            <input
              type="date"
              value={newExp.startDate}
              onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
              className="glass-input rounded-lg px-3 py-1.5 text-xs text-slate-100"
            />
            <input
              type="date"
              disabled={newExp.isCurrent}
              value={newExp.endDate}
              onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
              className="glass-input rounded-lg px-3 py-1.5 text-xs text-slate-100"
            />
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={handleAddExperience} className="w-full">
            + Add Experience Position
          </Button>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" size="md" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
