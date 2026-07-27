import React, { useState } from 'react';
import { Poll } from '../../types';
import { api } from '../../services/api';
import { CheckCircle2 } from 'lucide-react';

interface PollComponentProps {
  postId: string;
  poll: Poll;
  onVoteSuccess?: () => void;
}

export const PollComponent: React.FC<PollComponentProps> = ({ postId, poll, onVoteSuccess }) => {
  const [currentPoll, setCurrentPoll] = useState<Poll>(poll);
  const [selectedOption, setSelectedOption] = useState<string | null>(poll.userVotedOptionId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalVotes = currentPoll.options.reduce((sum, opt) => sum + opt.votesCount, 0);

  const handleVote = async (optionId: string) => {
    if (selectedOption || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.post('/posts/poll/vote', { postId, optionId });
      setCurrentPoll(res.data);
      setSelectedOption(optionId);
      if (onVoteSuccess) onVoteSuccess();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-3 p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-slate-200">{currentPoll.question}</h4>
      <div className="flex flex-col gap-2">
        {currentPoll.options.map(option => {
          const percent = totalVotes > 0 ? Math.round((option.votesCount / totalVotes) * 100) : 0;
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={!!selectedOption}
              className={`relative overflow-hidden p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                  : selectedOption
                  ? 'border-white/5 bg-slate-900/40 text-slate-400'
                  : 'border-white/10 hover:border-indigo-500/40 text-slate-300 hover:bg-white/5'
              }`}
            >
              {selectedOption && (
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                    isSelected ? 'bg-indigo-600/30' : 'bg-slate-700/20'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              )}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 truncate">
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  {option.text}
                </span>
                {selectedOption && <span className="font-bold shrink-0">{percent}%</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
        <span>{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}</span>
        {selectedOption && <span className="text-indigo-400 font-semibold">Vote Recorded</span>}
      </div>
    </div>
  );
};
