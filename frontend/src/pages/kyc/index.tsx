import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle } from '@untitledui/icons';
import { useAuth } from '@/providers/auth-provider';
import { KycService } from '@/api/services/KycService';
import type { KycStatus } from '@/api/models/KycSubmissionResponse';
import type { PersonalInfoForm } from './personal-info';
import type { AddressForm } from './address-verification';
import type { DocumentUploadState } from './document-upload';
import { PersonalInfoStep } from './personal-info';
import { AddressVerificationStep } from './address-verification';
import { DocumentUploadStep } from './document-upload';

const PERSONAL_DEFAULT: PersonalInfoForm = {
  legal_first_name: '',
  legal_last_name: '',
  date_of_birth: '',
  phone_number: '',
  tax_id_number: '',
  occupation: '',
  source_of_funds: 'employment_income',
};

const ADDRESS_DEFAULT: AddressForm = {
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US',
};

const DOCUMENT_DEFAULT: DocumentUploadState = {
  id_document_type: 'passport',
  id_front: null,
  id_back: null,
  proof_of_address: null,
};

const STEPS = ['Personal Information', 'Address Verification', 'Document Upload'];

export const KycPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [stepIndex, setStepIndex] = useState(0);
  const [personalInfo, setPersonalInfo] = useState(PERSONAL_DEFAULT);
  const [addressInfo, setAddressInfo] = useState(ADDRESS_DEFAULT);
  const [documents, setDocuments] = useState(DOCUMENT_DEFAULT);
  const [initialisedFromProfile, setInitialisedFromProfile] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => KycService.getStatus(),
  });

  const profileQuery = useQuery({
    queryKey: ['kyc-profile'],
    queryFn: () => KycService.getProfile(),
  });

  const currentStatus = statusQuery.data?.status as KycStatus | undefined;
  const statusInfo = statusQuery.data;
  const isAwaitingReview = currentStatus === 'UNDER_REVIEW';
  const isApproved = currentStatus === 'APPROVED';

  useEffect(() => {
    if (profileQuery.data && !initialisedFromProfile) {
      const profile = profileQuery.data;
      if (profile) {
        setPersonalInfo((prev) => ({
          ...prev,
          legal_first_name: profile.legal_first_name ?? prev.legal_first_name,
          legal_last_name: profile.legal_last_name ?? prev.legal_last_name,
          date_of_birth: profile.date_of_birth ?? prev.date_of_birth,
          phone_number: profile.phone_number ?? prev.phone_number,
          tax_id_number: profile.tax_id_number ?? prev.tax_id_number,
          occupation: profile.occupation ?? prev.occupation,
          source_of_funds: profile.source_of_funds ?? prev.source_of_funds,
        }));
        setAddressInfo((prev) => ({
          ...prev,
          address_line_1: profile.address_line_1 ?? prev.address_line_1,
          address_line_2: profile.address_line_2 ?? prev.address_line_2,
          city: profile.city ?? prev.city,
          state: profile.state ?? prev.state,
          postal_code: profile.postal_code ?? prev.postal_code,
          country: profile.country ?? prev.country,
        }));
      }
      setInitialisedFromProfile(true);
    }
  }, [profileQuery.data, initialisedFromProfile]);

  const submitMutation = useMutation({
    mutationFn: async (payload: DocumentUploadState) => {
      setSubmissionError(null);

      const submitPayload = {
        legal_first_name: personalInfo.legal_first_name,
        legal_last_name: personalInfo.legal_last_name,
        date_of_birth: personalInfo.date_of_birth,
        phone_number: personalInfo.phone_number,
        tax_id_number: personalInfo.tax_id_number,
        occupation: personalInfo.occupation,
        source_of_funds: personalInfo.source_of_funds,
        address_line_1: addressInfo.address_line_1,
        address_line_2: addressInfo.address_line_2 ?? null,
        city: addressInfo.city,
        state: addressInfo.state,
        postal_code: addressInfo.postal_code,
        country: addressInfo.country,
      };

      await KycService.submit(submitPayload);

      const uploads: Array<Promise<unknown>> = [];
      if (payload.id_front) {
        uploads.push(KycService.uploadDocument(payload.id_document_type, payload.id_front, 'front'));
      }
      if (payload.id_back) {
        uploads.push(KycService.uploadDocument(payload.id_document_type, payload.id_back, 'back'));
      }
      if (payload.proof_of_address) {
        uploads.push(KycService.uploadDocument('proof_of_address', payload.proof_of_address, 'front'));
      }
      if (uploads.length) {
        await Promise.all(uploads);
      }
    },
    onSuccess: () => {
      setSubmissionMessage('Your documents were submitted successfully. Our compliance team will review them shortly.');
      setStepIndex(0);
      setDocuments(DOCUMENT_DEFAULT);
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      queryClient.invalidateQueries({ queryKey: ['kyc-profile'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Something went wrong while submitting your documents.';
      setSubmissionError(message);
    },
  });

  const handleSubmitDocuments = (payload: DocumentUploadState) => {
    submitMutation.mutate(payload);
  };

  const resetAfterSubmission = () => {
    setSubmissionMessage(null);
    setSubmissionError(null);
    setStepIndex(0);
  };

  if (!user) {
    return null;
  }

  const steps = useMemo(() => STEPS, []);
  const locked = isAwaitingReview || isApproved;

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-10">
      <div className="flex flex-col gap-3 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-fg-primary">Verify your identity</h1>
            <p className="text-sm text-fg-tertiary">
              Complete the three-step process to unlock deposits, withdrawals, and higher trading limits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase text-fg-tertiary">Current status</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                currentStatus === 'APPROVED'
                  ? 'bg-success-100 text-success-800'
                  : currentStatus === 'UNDER_REVIEW'
                  ? 'bg-warning-100 text-warning-900'
                  : currentStatus === 'REJECTED'
                  ? 'bg-error-100 text-error-800'
                  : 'bg-brand-muted text-brand'
              }`}
            >
              {(currentStatus ?? 'PENDING').replace('_', ' ')}
            </span>
          </div>
        </div>

        {statusInfo?.rejected_reason && currentStatus === 'REJECTED' && (
          <div className="flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-900">
            <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden="true" />
            <div>
              <p className="font-medium">Your previous submission was rejected</p>
              <p className="text-xs">{statusInfo.rejected_reason}</p>
            </div>
          </div>
        )}

        {locked && (
          <div className="flex items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-900">
            <AlertTriangle className="mt-0.5 h-4 w-4" aria-hidden="true" />
            <div>
              <p className="font-medium">
                {isApproved ? 'Your identity is verified' : 'Submission received'}
              </p>
              <p className="text-xs text-warning-800">
                {isApproved
                  ? 'Thank you! You now have full access to Apex Trading Platform.'
                  : 'Our compliance team is reviewing your documents. We will notify you once the review is complete.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {!locked && (
        <div className="space-y-6">
          <ol className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {steps.map((label, index) => {
              const complete = index < stepIndex;
              const current = index === stepIndex;
              return (
                <li key={label} className="flex flex-1 flex-col items-center gap-2 text-center">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                      complete
                        ? 'bg-success-100 text-success-700'
                        : current
                        ? 'bg-brand-solid text-white'
                        : 'bg-bg-secondary text-fg-tertiary'
                    }`}
                  >
                    {complete ? <CheckCircle className="h-5 w-5" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className={`text-xs font-medium ${current ? 'text-fg-primary' : 'text-fg-tertiary'}`}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          {submissionMessage && (
            <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-900">
              <p>{submissionMessage}</p>
              <button type="button" className="text-xs font-medium text-success-700 underline" onClick={resetAfterSubmission}>
                Submit again
              </button>
            </div>
          )}

          {submissionError && (
            <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-900">
              {submissionError}
            </div>
          )}

          {stepIndex === 0 && (
            <PersonalInfoStep
              value={personalInfo}
              onChange={setPersonalInfo}
              onNext={(data) => {
                setPersonalInfo(data);
                setStepIndex(1);
              }}
              isSubmitting={submitMutation.isPending}
            />
          )}

          {stepIndex === 1 && (
            <AddressVerificationStep
              value={addressInfo}
              onChange={setAddressInfo}
              onNext={(data) => {
                setAddressInfo(data);
                setStepIndex(2);
              }}
              onBack={() => setStepIndex(0)}
              isSubmitting={submitMutation.isPending}
            />
          )}

          {stepIndex === 2 && (
            <DocumentUploadStep
              value={documents}
              onChange={setDocuments}
              onSubmit={handleSubmitDocuments}
              onBack={() => setStepIndex(1)}
              isSubmitting={submitMutation.isPending}
            />
          )}
        </div>
      )}
    </div>
  );
};
