import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { AdminService } from '@/api/services/AdminService';
import type { KycApplicationDetail } from '@/api/models/KycApplicationDetail';
import type { KycApplicationPublic } from '@/api/models/KycApplicationPublic';

const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'N/A';

export const KycReview = () => {
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<KycApplicationDetail | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const pendingQuery = useQuery<KycApplicationPublic[]>({
    queryKey: ['admin-pending-kyc'],
    queryFn: () => AdminService.getPendingKyc(),
  });

  const detailQuery = useMutation({
    mutationFn: (userId: string) => AdminService.getKycApplicationDetail(userId),
    onSuccess: (data) => {
      setSelectedApplication(data);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => AdminService.approveKyc(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-kyc'] });
      setSelectedApplication(null);
      setSelectedUserId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      AdminService.rejectKyc(userId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-kyc'] });
      setSelectedApplication(null);
      setSelectedUserId(null);
    },
  });

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedApplication(null);
    detailQuery.mutate(userId);
  };

  const handleApprove = (userId: string) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: string) => {
    const reason = window.prompt('Provide a rejection reason', 'Documents require manual review');
    if (reason) {
      rejectMutation.mutate({ userId, reason });
    }
  };

  return (
    <div className="space-y-6 py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-fg-primary">KYC verification queue</h1>
          <p className="text-sm text-fg-tertiary">Review and action pending identity verification submissions.</p>
        </div>
        <Badge type="color" size="sm" color="warning">
          {pendingQuery.data?.length ?? 0} pending
        </Badge>
      </header>

      {pendingQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-solid" />
        </div>
      ) : pendingQuery.data && pendingQuery.data.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pendingQuery.data.map((application) => (
            <div key={application.user_id} className="space-y-4 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-fg-primary">
                    {application.legal_first_name ?? 'Applicant'} {application.legal_last_name ?? ''}
                  </h3>
                  <p className="text-sm text-fg-tertiary">{application.email}</p>
                </div>
                <Badge type="color" size="sm" color="warning">
                  Submitted {formatDate(application.kyc_submitted_at)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-fg-secondary">
                <div>
                  <span className="text-xs uppercase text-fg-tertiary">Country</span>
                  <p className="font-medium text-fg-primary">{application.country ?? '—'}</p>
                </div>
                <div>
                  <span className="text-xs uppercase text-fg-tertiary">Phone</span>
                  <p className="font-medium text-fg-primary">{application.phone_number ?? '—'}</p>
                </div>
                <div>
                  <span className="text-xs uppercase text-fg-tertiary">Date of birth</span>
                  <p className="font-medium text-fg-primary">{application.date_of_birth ?? '—'}</p>
                </div>
                <div>
                  <span className="text-xs uppercase text-fg-tertiary">Risk score</span>
                  <p className="font-medium text-fg-primary">{application.risk_assessment_score}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="sm"
                  color="success"
                  onClick={() => handleApprove(application.user_id)}
                  isLoading={approveMutation.isPending && approveMutation.variables === application.user_id}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  color="primary-destructive"
                  onClick={() => handleReject(application.user_id)}
                  isLoading={rejectMutation.isPending && rejectMutation.variables?.userId === application.user_id}
                >
                  Reject
                </Button>
                <Button size="sm" color="tertiary" onClick={() => handleViewDetails(application.user_id)}>
                  View details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border-secondary bg-secondary p-6 text-center text-sm text-fg-tertiary">
          No KYC submissions waiting for review.
        </div>
      )}

      {selectedUserId && (
        <aside className="space-y-4 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-fg-primary">Application details</h2>
            <Button
              size="sm"
              color="tertiary"
              onClick={() => {
                setSelectedUserId(null);
                setSelectedApplication(null);
              }}
            >
              Close
            </Button>
          </div>
          {detailQuery.isPending && !selectedApplication ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-solid" />
            </div>
          ) : selectedApplication ? (
            <div className="space-y-4 text-sm text-fg-secondary">
              <div>
                <h3 className="font-medium text-fg-primary">Profile</h3>
                <dl className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-xs uppercase text-fg-tertiary">Full name</span>
                    <p className="text-fg-primary">{selectedApplication.profile?.legal_first_name ?? ''} {selectedApplication.profile?.legal_last_name ?? ''}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-fg-tertiary">Phone</span>
                    <p className="text-fg-primary">{selectedApplication.profile?.phone_number ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-fg-tertiary">Occupation</span>
                    <p className="text-fg-primary">{selectedApplication.profile?.occupation ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase text-fg-tertiary">Source of funds</span>
                    <p className="text-fg-primary">{selectedApplication.profile?.source_of_funds ?? '—'}</p>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-medium text-fg-primary">Documents</h3>
                <ul className="list-disc space-y-1 pl-6 text-xs text-fg-tertiary">
                  {selectedApplication.documents.map((document) => (
                    <li key={document.id}>
                      {document.document_type} • Uploaded {formatDate(document.created_at)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-sm text-fg-tertiary">Select a submission to view more details.</p>
          )}
        </aside>
      )}
    </div>
  );
};
