import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CampaignDelivery } from '../../types';
import { Badge } from '../common/Badge';
import { RefreshCw, Inbox, AlertCircle, ShieldCheck } from 'lucide-react';

interface DeliveryOutboxProps {
  campaignId?: string;
}

export const DeliveryOutbox: React.FC<DeliveryOutboxProps> = ({ campaignId }) => {
  const {
    data: deliveries = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<CampaignDelivery[]>({
    queryKey: ['campaignDeliveries', campaignId],
    queryFn: async () => {
      if (campaignId) {
        const res: any = await api.get(`/campaigns/${campaignId}/deliveries`);
        return res.data?.data || res.data || [];
      }
      const res: any = await api.get('/email/outbox');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 5000,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="success">SENT</Badge>;
      case 'suppressed':
        return <Badge variant="warning">SUPPRESSED</Badge>;
      case 'failed':
        return <Badge variant="danger">FAILED</Badge>;
      default:
        return <Badge variant="default">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Email Delivery Outbox ({deliveries.length})
          </h4>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          title="Refresh outbox logs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Deliveries List */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 sticky top-0 z-10 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3">Recipient</th>
              <th className="py-2.5 px-3">Subject</th>
              <th className="py-2.5 px-3">Step</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Sent Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Loading outbox deliveries...
                </td>
              </tr>
            ) : deliveries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <div className="space-y-1">
                    <Inbox className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">No outreach emails dispatched yet</p>
                    <p className="text-[11px] text-slate-400">
                      Approved campaign dispatches will log real-time delivery status here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => (
                <tr key={delivery._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    {delivery.recipientEmail}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                    {delivery.subject}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    Step {delivery.stepNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(delivery.status)}
                      {delivery.status === 'suppressed' && (
                        <div className="group relative">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 group-hover:text-amber-800" />
                          <div className="hidden group-hover:block absolute z-20 bottom-full left-0 mb-1 w-48 p-2 bg-slate-800 text-white rounded text-[10.5px] shadow-lg pointer-events-none">
                            Suppressed automatically because candidate has already replied or unsubscribed.
                          </div>
                        </div>
                      )}
                      {delivery.error && (
                        <div className="group relative">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          <div className="hidden group-hover:block absolute z-20 bottom-full left-0 mb-1 w-48 p-2 bg-slate-800 text-white rounded text-[10.5px] shadow-lg pointer-events-none">
                            {delivery.error}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                    {delivery.sentAt ? new Date(delivery.sentAt).toLocaleTimeString() : 'Pending'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

