import React, { useState } from 'react';
import { Poll } from '../../types';
import { api } from '../../services/api';

interface PollComponentProps {
  postId: string;
  poll: Poll;
  onVoteSuccess?: () => void;
}

export const PollComponent: React.FC<PollComponentProps> = ({ postId, poll, onVoteSuccess }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.userVotedOptionId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votesCount, 0);

  const handleVote = async (optionId: string) => {
    if (selectedOption || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.post('/posts/poll/vote', { postId, optionId });
      setSelectedOption(optionId);
      if (onVoteSuccess) onVoteSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-3 p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-slate-200">{poll.question}</h4>
      <div className="flex flex-col gap-2">
        {poll.options.map(option => {
          const percent = totalVotes > 0 ? Math.round((option.votesCount / totalVotes) * 100) : 0;
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!!selectedOption}
              className={`relative overflow-hidden p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-white/10 hover:border-indigo-500/40 text-slate-300'
              }`}
            >
              {selectedOption && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-indigo-600/20 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              )}
              <div className="relative z-10 flex items-center justify-between">
                <span>{option.text}</span>
                {selectedOption && <span className="font-bold">{percent}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      <span className="text-[11px] text-slate-400 font-medium">{totalVotes} total votes</span>
    </div>
  );
};
