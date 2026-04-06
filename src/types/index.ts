// src/types/index.ts — mirrors types.ts from React Native project exactly
export type UserRole = 'adopter' | 'seller' | 'admin';

export interface UserType {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  petPostIds: string[];
  favorites: string[];
  adoptedPets: string[];
  image?: string | null;
  createdAt: any;
  emailVerified: boolean;
  lastResetAttempts?: number[];
  // Admin-added fields (new)
  adminStatus?: 'active' | 'terminated' | 'suspended';
  adminDecision?: string;
  adminDecisionAt?: any;
  adminDecisionBy?: string;
  adminRole?: 'admin' | 'editor' | 'viewer';
}

export type PetStatus = 'available' | 'sold';

export interface PetType {
  id: string;
  name: string;
  category: string;
  coatcolor: string;
  breed: string;
  description: string;
  address: string;
  image: string;
  ownerId: string;
  age?: number | string;
  location?: { latitude: number; longitude: number };
  favoredBy: string[];
  status: PetStatus;
  adoptedBy?: string;
  isDeleted: boolean;
  createdAt: any;
  deletedAt?: any;
  updatedAt?: any;
  // Admin fields
  adminRemoved?: boolean;
  adminRemovedReason?: string;
  adminRemovedBy?: string;
  adminRemovedAt?: any;
}

export type AdoptionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface AdoptionType {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  adopterId: string;
  adopterName: string;
  ownerId: string;
  status: AdoptionStatus;
  isRead: boolean;
  createdAt: any;
  updatedAt?: any;
  petBreed?: string;
  petCategory?: string;
  petColor?: string;
  petAge?: string | number;
  rejectionReason?: string;
  adminDecision?: string;
  adminDecisionBy?: string;
  adminDecisionAt?: any;
}

export interface CertificateType {
  id: string;
  certificateId: string;
  adoptionId: string;
  petId: string;
  adopterId: string;
  adopterName: string;
  adopterEmail?: string;
  petName: string;
  petImage: string;
  breed: string;
  category: string;
  color?: string;
  age?: string | number;
  certType: 'adoption' | 'foster' | 'milestone';
  message?: string;
  issuedAt: any;
  issuedBy: string;
  issuedByName: string;
  expiresAt?: string | null;
  status: 'issued' | 'revoked';
}

export interface NotificationType {
  id: string;
  receiverId: string; // 'ALL' = broadcast
  title: string;
  message: string;
  isRead: boolean;
  createdAt: any;
  type?: 'adoption_update' | 'new_request' | 'chat' | 'certificate' | 'broadcast' | 'promo' | 'admin_action';
  certId?: string;
  target?: string;
  sentBy?: string;
}

export interface ContactMessageType {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
  read: boolean;
}

export interface AdminInviteType {
  id: string;
  code: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: any;
  expiresAt: any;
  acceptedBy?: string;
  acceptedAt?: any;
}

export interface PromoEmailType {
  id: string;
  subject: string;
  body: string;
  targetRole: 'all' | 'adopter' | 'seller';
  sentAt: any;
  sentBy: string;
  recipientCount: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
