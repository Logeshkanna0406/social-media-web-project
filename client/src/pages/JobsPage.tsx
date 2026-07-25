import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Search, Briefcase, MapPin, DollarSign, Bookmark, Send, PlusCircle } from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

export const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Apply Modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Recruiter Create Job state
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [newJobData, setNewJobData] = useState({
    title: '',
    companyName: '',
    location: 'Remote',
    salaryRange: '$120,000 - $160,000',
    description: ''
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/jobs', {
        params: { query: searchQuery, remoteOnly }
      });
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [remoteOnly]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsApplying(true);
    try {
      await api.post('/jobs/apply', {
        jobId: selectedJob.id,
        coverLetter
      });
      addToast('success', 'Application Submitted!', `Your profile was sent to ${selectedJob.companyName}.`);
      setSelectedJob(null);
      setCoverLetter('');
    } catch (err: any) {
      addToast('error', err.response?.data?.error || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/jobs', newJobData);
      addToast('success', 'Job Posted Successfully!');
      setIsCreateJobOpen(false);
      fetchJobs();
    } catch (err) {
      addToast('error', 'Failed to create job listing');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Search Header */}
      <GlassCard className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          <Input
            placeholder="Filter engineering jobs by title, skill, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
          <Button variant="primary" size="md" onClick={fetchJobs}>
            Search
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded bg-slate-900 border-white/10 text-indigo-500 focus:ring-indigo-500"
            />
            Remote Only
          </label>

          {(user?.role === 'RECRUITER' || user?.role === 'ADMIN') && (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsCreateJobOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Post Job
            </Button>
          )}
        </div>
      </GlassCard>

      {/* Jobs List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading Job Opportunities...</div>
        ) : jobs.length > 0 ? (
          jobs.map(job => (
            <GlassCard key={job.id} hoverEffect className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <img src={job.companyLogo} alt={job.companyName} className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-slate-900" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{job.title}</h3>
                    {job.isRemote && <Badge variant="success" size="sm">Remote</Badge>}
                  </div>
                  <span className="text-xs font-semibold text-indigo-400 mt-0.5">{job.companyName}</span>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location}
                    </span>
                    {job.salaryRange && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {job.salaryRange}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="gradient" size="sm" onClick={() => setSelectedJob(job)}>
                  Apply Now
                </Button>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400">No jobs match your search criteria.</div>
        )}
      </div>

      {/* Apply Modal */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title={`Apply for ${selectedJob?.title}`}>
        <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
          <p className="text-xs text-slate-300">
            Applying to <span className="font-bold text-indigo-400">{selectedJob?.companyName}</span>. ConnectHub AI will automatically attach your verified profile resume score.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-300">Cover Note (Optional)</label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Why are you a great fit for this position?"
              className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 placeholder-slate-400 resize-none mt-1"
            />
          </div>

          <Button variant="gradient" size="md" isLoading={isApplying} type="submit">
            Submit Application
          </Button>
        </form>
      </Modal>

      {/* Recruiter Create Job Modal */}
      <Modal isOpen={isCreateJobOpen} onClose={() => setIsCreateJobOpen(false)} title="Post a New Job Opportunity">
        <form onSubmit={handleCreateJob} className="flex flex-col gap-3">
          <Input
            label="Job Title"
            value={newJobData.title}
            onChange={(e) => setNewJobData({ ...newJobData, title: e.target.value })}
            placeholder="e.g. Senior Frontend Engineer"
            required
          />
          <Input
            label="Company Name"
            value={newJobData.companyName}
            onChange={(e) => setNewJobData({ ...newJobData, companyName: e.target.value })}
            placeholder="e.g. Acme Tech"
            required
          />
          <Input
            label="Salary Range"
            value={newJobData.salaryRange}
            onChange={(e) => setNewJobData({ ...newJobData, salaryRange: e.target.value })}
          />
          <div>
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows={4}
              value={newJobData.description}
              onChange={(e) => setNewJobData({ ...newJobData, description: e.target.value })}
              className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 mt-1 resize-none"
              required
            />
          </div>
          <Button variant="gradient" size="md" type="submit">
            Publish Job Listing
          </Button>
        </form>
      </Modal>
    </div>
  );
};
