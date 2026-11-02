import React from 'react';
import { Button } from '../common/Button';
import { Sparkles, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';

interface AiSummaryCardProps {
  summary?: any;
  onGenerate: () => Promise<any>;
  isLoading: boolean;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  summary,
  onGenerate,
  isLoading,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Co-Worker Pipeline Analysis</h3>
            <p className="text-xs text-slate-500">LLM-generated intelligence on hiring conversion & bottlenecks</p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          isLoading={isLoading}
          onClick={onGenerate}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" /> {summary ? 'Refresh Summary' : 'Generate Summary'}
        </Button>
      </div>

      {!summary ? (
        <div className="py-6 text-center space-y-2">
          <Lightbulb className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">
            Click "Generate Summary" to produce an executive briefing on this job's response rates and candidate flow.
          </p>
        </div>
      ) : (
        <div className="space-y-3 text-xs leading-relaxed">
          {summary.analysis && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap font-mono text-[11.5px]">
              {summary.analysis}
            </div>
          )}

          {summary.recommendations && Array.isArray(summary.recommendations) && (
            <div className="space-y-1.5 pt-1">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Key Recommendations:
              </span>
              <div className="space-y-1 pl-1">
                {summary.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

