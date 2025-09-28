import { useEffect, useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { NativeSelect } from '@/components/base/select/select-native';
import { UploadCloud01 } from '@untitledui/icons';

export type DocumentUploadState = {
  id_document_type: 'passport' | 'drivers_license' | 'national_id';
  id_front?: File | null;
  id_back?: File | null;
  proof_of_address?: File | null;
};

type DocumentUploadProps = {
  value: DocumentUploadState;
  onChange: (value: DocumentUploadState) => void;
  onSubmit: (value: DocumentUploadState) => void;
  onBack: () => void;
  isSubmitting?: boolean;
};

const ID_DOCUMENT_OPTIONS = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID' },
];

const DEFAULT_STATE: DocumentUploadState = {
  id_document_type: 'passport',
  id_front: null,
  id_back: null,
  proof_of_address: null,
};

type FileBoxProps = {
  label: string;
  description?: string;
  acceptedTypes?: string;
  file?: File | null;
  onSelect: (file: File | null) => void;
};

const FileUploadBox = ({ label, description, acceptedTypes = 'image/*,application/pdf', file, onSelect }: FileBoxProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.item(0) ?? null;
    onSelect(selected);
  };

  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-secondary bg-bg-primary px-6 py-8 text-center transition hover:border-brand">
      <input type="file" accept={acceptedTypes} className="hidden" onChange={handleFileChange} />
      <UploadCloud01 className="h-8 w-8 text-brand" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-fg-primary">{label}</p>
        {description && <p className="text-xs text-fg-tertiary">{description}</p>}
      </div>
      {file ? (
        <p className="text-xs text-fg-secondary">{file.name}</p>
      ) : (
        <p className="text-xs text-fg-tertiary">Tap to upload</p>
      )}
      {file && (
        <Button
          size="sm"
          color="tertiary"
          onClick={(event: React.MouseEvent) => {
            event.preventDefault();
            onSelect(null);
          }}
        >
          Remove
        </Button>
      )}
    </label>
  );
};

export const DocumentUploadStep = ({ value, onChange, onSubmit, onBack, isSubmitting = false }: DocumentUploadProps) => {
  const [state, setState] = useState<DocumentUploadState>(value ?? DEFAULT_STATE);

  useEffect(() => {
    setState(value ?? DEFAULT_STATE);
  }, [value]);

  const updateState = (partial: Partial<DocumentUploadState>) => {
    const updated = { ...state, ...partial };
    setState(updated);
    onChange(updated);
  };

  const handleSubmit = () => {
    onSubmit(state);
  };

  const canSubmit = Boolean(state.id_front) && Boolean(state.proof_of_address);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-fg-primary">Document Verification</h2>
        <p className="text-sm text-fg-tertiary">Upload high quality scans or photos of your identification documents.</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
        <div className="grid gap-4">
          <NativeSelect
            label="Government ID Type"
            value={state.id_document_type}
            onChange={(value) => updateState({ id_document_type: value as unknown as DocumentUploadState['id_document_type'] })}
            options={ID_DOCUMENT_OPTIONS}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FileUploadBox
              label="Front of ID"
              description="JPEG, PNG or PDF up to 10MB"
              file={state.id_front ?? null}
              onSelect={(file) => updateState({ id_front: file })}
            />
            <FileUploadBox
              label="Back of ID (if applicable)"
              description="Required for two-sided IDs"
              file={state.id_back ?? null}
              onSelect={(file) => updateState({ id_back: file })}
            />
          </div>

          <FileUploadBox
            label="Proof of Address"
            description="Recent utility bill, bank statement or official correspondence"
            file={state.proof_of_address ?? null}
            onSelect={(file) => updateState({ proof_of_address: file })}
          />
        </div>

        <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-900">
          <strong className="font-semibold">Security:</strong> Files are encrypted at rest and purged after verification. Typical review time is 24-48 hours.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button color="tertiary" onClick={onBack} className="sm:w-auto">
            Back
          </Button>
          <Button
            color="primary"
            onClick={handleSubmit}
            className="sm:w-auto"
            isDisabled={!canSubmit || isSubmitting}
            isLoading={isSubmitting}
          >
            Submit for Verification
          </Button>
        </div>
      </div>
    </div>
  );
};
