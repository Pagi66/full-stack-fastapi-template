import { useEffect, useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { NativeSelect } from '@/components/base/select/select-native';

export type AddressForm = {
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

type AddressVerificationProps = {
  value: AddressForm;
  onChange: (value: AddressForm) => void;
  onNext: (value: AddressForm) => void;
  onBack: () => void;
  isSubmitting?: boolean;
};

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'DE', label: 'Germany' },
];

const defaultForm: AddressForm = {
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US',
};

export const AddressVerificationStep = ({ value, onChange, onNext, onBack, isSubmitting = false }: AddressVerificationProps) => {
  const [formData, setFormData] = useState<AddressForm>(value ?? defaultForm);

  useEffect(() => {
    setFormData(value ?? defaultForm);
  }, [value]);

  const updateField = <K extends keyof AddressForm>(field: K, fieldValue: AddressForm[K]) => {
    const updated = { ...formData, [field]: fieldValue };
    setFormData(updated);
    onChange(updated);
  };

  const isValid =
    formData.address_line_1.trim() !== '' &&
    formData.city.trim() !== '' &&
    formData.state.trim() !== '' &&
    formData.postal_code.trim() !== '' &&
    formData.country.trim() !== '';

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-fg-primary">Address Verification</h2>
        <p className="text-sm text-fg-tertiary">Confirm your residential address so we can align with regulatory requirements.</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Street Address"
            value={formData.address_line_1}
            onChange={(value) => updateField('address_line_1', value)}
            placeholder="123 Market Street"
            isRequired
          />
          <Input
            label="Apartment, Suite, Unit (optional)"
            value={formData.address_line_2 ?? ''}
            onChange={(value) => updateField('address_line_2', value)}
            placeholder="Floor 5"
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(value) => updateField('city', value)}
              isRequired
            />
            <Input
              label="State / Province"
              value={formData.state}
              onChange={(value) => updateField('state', value)}
              isRequired
            />
            <Input
              label="Postal Code"
              value={formData.postal_code}
              onChange={(value) => updateField('postal_code', value)}
              isRequired
            />
            <NativeSelect
              label="Country"
              value={formData.country}
              onChange={(value) => updateField('country', value as unknown as string)}
              options={COUNTRY_OPTIONS}
            />
          </div>
        </div>

        <div className="rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-900">
          <strong className="font-semibold">Proof of Address:</strong> You may be asked to provide a recent utility bill or bank statement that matches this address.
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button color="tertiary" onClick={onBack} className="sm:w-auto">
            Back
          </Button>
          <Button
            color="primary"
            onClick={() => onNext(formData)}
            className="sm:w-auto"
            isDisabled={!isValid || isSubmitting}
            isLoading={isSubmitting}
          >
            Continue to Document Upload
          </Button>
        </div>
      </div>
    </div>
  );
};
