// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Model {
  id: string;
  // Personal
  fullName: string;
  gender: 'Male' | 'Female' | 'Non-Binary';
  dateOfBirth: string;
  age: number;
  mobile: string;
  email: string;
  city: string;
  nationality: string;
  // Physical
  height: number; // cm
  weight: number; // kg
  chest: number;
  waist: number;
  hips: number;
  shoeSize: number;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  // Professional
  experience: number; // years
  categories: string[];
  reference: string;
  // Portfolio
  coverImage: string;
  portfolioImages: string[];
  portfolioVideos: string[];
  // Social
  instagramLink: string;
  // Commercial (internal)
  modelCharges: number; // per day
  internalNotes: string;
  status: 'Active' | 'Inactive';
  // Meta
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  gstNumber: string;
  billingAddress: string;
  paymentTerms: string;
  creditDays: number;
  remarks: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Requirement {
  id: string;
  clientId: string;
  clientName: string;
  projectName: string;
  shootDate: string;
  shootLocation: string;
  gender: 'Male' | 'Female' | 'Any';
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  category: string;
  modelsRequired: number;
  budget: number;
  additionalRequirements: string;
  status: 'New' | 'Shortlisting' | 'Quotation Sent' | 'Confirmed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface QuotationModel {
  modelId: string;
  modelName: string;
  coverImage: string;
  height: number;
  age: number;
  categories: string[];
  experience: number;
  instagramLink: string;
  sellingPrice: number;
  // Internal only (not shown to client)
  modelCharges: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  clientName: string;
  requirementId: string;
  projectName: string;
  models: QuotationModel[];
  termsAndConditions: string;
  totalSellingPrice: number;
  totalModelCharges: number;
  grossProfit: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Not Approved' | 'Closed';
  modelAgreementSigned: boolean;
  notes: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  clientId: string;
  clientName: string;
  quotationId: string;
  projectName: string;
  selectedModels: QuotationModel[];
  shootDate: string;
  shootTime: string;
  venue: string;
  coordinator: string;
  sellingPrice: number;
  notes: string;
  status: 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  bookingId: string;
  bookingNumber: string;
  projectName: string;
  amount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  dueDate: string;
  status: 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue';
  paidAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentMethod: string; // Dynamic e.g. Bank Transfer, UPI, Razorpay, Stripe
  transactionId: string;
  paymentDate: string;
  status: 'Pending' | 'Received' | 'Failed';
  paymentLink: string;
  notes: string;
  createdAt: string;
}

export interface ModelAvailability {
  modelId: string;
  date: string;
  status: 'Available' | 'Booked' | 'Tentative' | 'Blocked';
  bookingId?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Talent Manager' | 'Finance' | 'Viewer';
  mobile: string;
  status: 'Active' | 'Inactive';
  avatar: string;
  lastLogin: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface DashboardStats {
  totalModels: number;
  activeModels: number;
  availableModels: number;
  bookedModels: number;
  upcomingShoots: number;
  pendingQuotations: number;
  approvedQuotations: number;
  pendingInvoices: number;
  pendingPayments: number;
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  recentActivities: ActivityLog[];
}

export type ModelCategory =
  | 'Fashion'
  | 'Commercial'
  | 'Print'
  | 'TV Commercial'
  | 'Ramp Walk'
  | 'Influencer'
  | 'Actor'
  | 'Fitness'
  | 'Bridal'
  | 'Kids';

export const MODEL_CATEGORIES: ModelCategory[] = [
  'Fashion', 'Commercial', 'Print', 'TV Commercial',
  'Ramp Walk', 'Influencer', 'Actor', 'Fitness', 'Bridal', 'Kids'
];

export const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Grey', 'White', 'Other'];
export const EYE_COLORS  = ['Black', 'Brown', 'Blue', 'Green', 'Hazel', 'Grey', 'Amber'];
export const SKIN_TONES  = ['Fair', 'Light', 'Medium', 'Olive', 'Tan', 'Brown', 'Dark'];
export const NATIONALITIES = ['Indian', 'American', 'British', 'French', 'Italian', 'Russian', 'Brazilian', 'Japanese', 'Korean', 'Other'];
