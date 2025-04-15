export interface Vendor {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface Domain {
  id: string;
  domain: string;
}

export interface Language {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface Ad {
  id: string;
  title: string;
  body: string;
  vendor: Vendor;
  company: Company;
  domain: Domain;
  language: Language;
  countries: Country[];
  display_format: string;
  startDate: string;
  endDate: string;
} 