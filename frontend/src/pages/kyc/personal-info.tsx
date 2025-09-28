import { useEffect, useState } from 'react';
import { ShieldTick } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { NativeSelect } from '@/components/base/select/select-native';

export type PersonalInfoForm = {
  legal_first_name: string;
  legal_last_name: string;
  date_of_birth: string;
  phone_number: string;
  tax_id_number: string;
  occupation: string;
  source_of_funds: string;
};

type PersonalInfoStepProps = {
  value: PersonalInfoForm;
  onChange: (value: PersonalInfoForm) => void;
  onNext: (value: PersonalInfoForm) => void;
  isSubmitting?: boolean;
};

const SOURCE_OF_FUNDS_OPTIONS = [
  { value: 'employment_income', label: 'Employment Income' },
  { value: 'business_income', label: 'Business Income' },
  { value: 'investments', label: 'Investment Returns' },
  { value: 'savings', label: 'Personal Savings' },
  { value: 'inheritance', label: 'Inheritance' },
  { value: 'other', label: 'Other' },
];

const emptyForm: PersonalInfoForm = {
  legal_first_name: '',
  legal_last_name: '',
  date_of_birth: '',
  phone_number: '',
  tax_id_number: '',
  occupation: '',
  source_of_funds: 'employment_income',
};

export const PersonalInfoStep = ({ value, onChange, onNext, isSubmitting = false }: PersonalInfoStepProps) => {
  const [formData, setFormData] = useState<PersonalInfoForm>(value ?? emptyForm);

  useEffect(() => {
    setFormData(value ?? emptyForm);
  }, [value]);

  const updateField = <K extends keyof PersonalInfoForm>(field: K, newValue: PersonalInfoForm[K]) => {
    const updated = { ...formData, [field]: newValue };
    setFormData(updated);
    onChange(updated);
  };

  const handleSubmit = () => {
    onNext(formData);
  };

  const requiredFieldsFilled =
    formData.legal_first_name.trim() !== '' &&
    formData.legal_last_name.trim() !== '' &&
    formData.date_of_birth.trim() !== '' &&
    formData.phone_number.trim() !== '' &&
    formData.tax_id_number.trim() !== '' &&
    formData.occupation.trim() !== '';

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-muted">
          <ShieldTick className="h-8 w-8 text-brand" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-fg-primary">Identity Verification</h1>
          <p className="text-sm text-fg-tertiary">
            Provide your legal information so we can keep your account secure and compliant with global regulations.
          </p>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Legal First Name"
            value={formData.legal_first_name}
            onChange={(value) => updateField('legal_first_name', value)}
            placeholder="Jane"
            isRequired
          />
          <Input
            label="Legal Last Name"
            value={formData.legal_last_name}
            onChange={(value) => updateField('legal_last_name', value)}
            placeholder="Doe"
            isRequired
          />
          <Input
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(value) => updateField('date_of_birth', value)}
            isRequired
          />
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone_number}
            onChange={(value) => updateField('phone_number', value)}
            placeholder="+1 202-555-0142"
            isRequired
          />
          <Input
            label="Tax Identification Number"
            value={formData.tax_id_number}
            onChange={(value) => updateField('tax_id_number', value)}
            placeholder="SSN or equivalent"
            isRequired
          />
          <Input
            label="Occupation"
            value={formData.occupation}
            onChange={(value) => updateField('occupation', value)}
            placeholder="Software Engineer"
            isRequired
          />
          <NativeSelect
            label="Source of Funds"
            value={formData.source_of_funds}
            onChange={(value) => updateField('source_of_funds', value as unknown as string)}
            options={SOURCE_OF_FUNDS_OPTIONS}
          />
        </div>

        <div className="rounded-lg bg-brand-muted px-4 py-3 text-sm text-brand-900">
          <strong className="font-semibold">Security Notice:</strong> Your information is encrypted and stored securely.
          We comply with global KYC/AML regulations to prevent financial crime.
        </div>

        <Button
          className="w-full"
          color="primary"
          onClick={handleSubmit}
          isDisabled={!requiredFieldsFilled || isSubmitting}
          isLoading={isSubmitting}
        >
          Continue to Address Verification
        </Button>
      </div>
    </div>
  );
};
