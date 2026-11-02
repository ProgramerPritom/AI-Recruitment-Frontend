import React, { useState, useMemo } from 'react';
import { Candidate, CandidateStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Search,
  ExternalLink,
  Check,
  X,
  ChevronDown,
  Info,
  CheckSquare,
  Square,
  Users,
} from 'lucide-react';

interface CandidateTableProps {
  candidates: Candidate[];
  isLoading: boolean;
  onSelectCandidate: (candidate: Candidate) => void;
  onStatusChange: (id: string, status: CandidateStatus) => Promise<any>;
  onBulkReview: (ids: string[], decision: 'accept' | 'reject') => Promise<any>;
}

const STATUS_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'sourced', label: 'Sourced' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'replied', label: 'Replied' },
  { id: 'interested', label: 'Interested' },
  { id: 'meeting_booked', label: 'Meeting Booked' },
  { id: 'interviewed', label: 'Interviewed' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
];

export const CandidateTable: React.FC<CandidateTableProps> = ({
  candidates,
  isLoading,
  onSelectCandidate,
  onStatusChange,
  onBulkReview,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesStatus =
        selectedStatus === 'all' ? true : c.status.toLowerCase() === selectedStatus.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.skills.some((s) => s.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [candidates, selectedStatus, searchQuery]);

  const allFilteredSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((c) => selectedIds.includes(c._id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c._id));
    }
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (decision: 'accept' | 'reject') => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await onBulkReview(selectedIds, decision);
      setSelectedIds([]);
    } catch (err: any) {
      alert(`Bulk action failed: ${err.message}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined || score === null) {
      return <span className="text-xs text-slate-400">Unscored</span>;
    }
    const variant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
    return <Badge variant={variant}>{score}</Badge>;
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top Filter Bar */}
      <div className="p-3.5 border-b border-slate-200 space-y-3 bg-white">
        {/* Search & Selection Summary */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, email, or skill..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredCandidates.length} of {candidates.length} candidate{candidates.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
          {STATUS_FILTERS.map((tab) => {
            const count =
              tab.id === 'all'
                ? candidates.length
                : candidates.filter((c) => c.status.toLowerCase() === tab.id).length;
            const isSelected = selectedStatus === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-4 py-2 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{selectedIds.length} candidate{selectedIds.length === 1 ? '' : 's'} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              isLoading={isBulkProcessing}
              onClick={() => handleBulkAction('accept')}
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Accept Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              isLoading={isBulkProcessing}
              onClick={() => handleBulkAction('reject')}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Reject Selected
            </Button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-800 ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 sticky top-0 z-10 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3 w-10">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-slate-400 hover:text-slate-700 mt-0.5"
                >
                  {allFilteredSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-2.5 px-3">Candidate</th>
              <th className="py-2.5 px-3">Skills</th>
              <th className="py-2.5 px-3">Score</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Loading candidate records...
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="space-y-1">
                    <Users className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-medium text-slate-600 text-xs">No candidates found in this view</p>
                    <p className="text-[11px] text-slate-400">
                      Use the Copilot chat to source candidates or upload a CSV file.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => {
                const isSelected = selectedIds.includes(candidate._id);

                return (
                  <tr
                    key={candidate._id}
                    className={`hover:bg-slate-50/80 transition cursor-pointer ${
                      isSelected ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <td
                      className="py-2.5 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectCandidate(candidate._id);
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                      )}
                    </td>

                    {/* Candidate Name & Contact */}
                    <td className="py-2.5 px-3" onClick={() => onSelectCandidate(candidate)}>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {candidate.name}
                        {candidate.profileUrl && (
                          <a
                            href={candidate.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-indigo-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{candidate.email || 'No email'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="capitalize">{candidate.source}</span>
                      </div>
                    </td>

                    {/* Skills */}
                    <td className="py-2.5 px-3 max-w-xs" onClick={() => onSelectCandidate(candidate)}>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((s, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium self-center">
                            +{candidate.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-2.5 px-3" onClick={() => onSelectCandidate(candidate)}>
                      <div className="flex items-center gap-1.5">
                        {getScoreBadge(candidate.score)}
                        {candidate.scoreReason && (
                          <div className="group relative">
                            <Info className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                            <div className="hidden group-hover:block absolute z-30 bottom-full left-0 mb-1 w-60 p-2 bg-slate-800 text-white rounded text-[11px] shadow-lg pointer-events-none">
                              {candidate.scoreReason}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3" onClick={() => onSelectCandidate(candidate)}>
                      <Badge status={candidate.status}>{candidate.status.replace('_', ' ')}</Badge>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-2.5 px-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {candidate.status === 'sourced' && (
                          <>
                            <button
                              onClick={() => onStatusChange(candidate._id, 'accepted')}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200"
                              title="Accept"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onStatusChange(candidate._id, 'rejected')}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-slate-200"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => onSelectCandidate(candidate)}
                          className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 flex items-center gap-1"
                        >
                          Details <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

