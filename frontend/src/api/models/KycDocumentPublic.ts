export type KycDocumentType =
  | 'passport'
  | 'drivers_license'
  | 'national_id'
  | 'proof_of_address';

export type KycDocumentPublic = {
  id: string;
  user_id: string;
  document_type: KycDocumentType;
  front_image_url?: string | null;
  back_image_url?: string | null;
  verified: boolean;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
};