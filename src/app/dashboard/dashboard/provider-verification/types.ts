// Provider (used in VerificationPanel)
export interface Provider {
    id: string;
    name: string;
    email: string;
    phone: string;
    providerType: string;
    status: string;
    verified: boolean;
  }
  
  // ProviderListItem (used in the table)
  export interface ProviderListItem {
    id: string;
    name: string;
    handle: string;
    initials: string;
    type: string;
    phone: string;
    registrationDate: string;
    color: string;
    avatarUrl?: string;
  }
  