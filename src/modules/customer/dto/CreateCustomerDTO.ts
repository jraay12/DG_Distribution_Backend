export interface CustomerAddressInput {
  address?: string;
  street?: string;
  barangay?: string;
  city_municipality?: string;
  province?: string;
  territory?: string | null;
}

export interface CreateCustomerDTO extends CustomerAddressInput {
  owner_name: string;
  store_name: string;
  contact_number: string;
}
