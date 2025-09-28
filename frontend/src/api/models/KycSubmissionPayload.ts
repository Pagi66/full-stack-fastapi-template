export type KycSubmissionPayload = {
  legal_first_name: string;
  legal_last_name: string;
  date_of_birth: string;
  phone_number: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  tax_id_number: string;
  occupation: string;
  source_of_funds: string;
};