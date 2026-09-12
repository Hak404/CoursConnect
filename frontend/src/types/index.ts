export type Role = 'STUDENT' | 'PROFESSOR' | 'ADMIN';

export type CourseType = 'INDIVIDUAL' | 'GROUP' | 'ONLINE';
export type LocationType = 'STUDENT_HOME' | 'PROFESSOR_HOME' | 'ONLINE' | 'OTHER';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type PriceProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'ONLINE';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface City {
  id: number;
  name: string;
  region?: string;
  active: boolean;
}

export interface Subject {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface Level {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

export interface Offer {
  id: number;
  professorId: number;
  title: string;
  description?: string;
  price: number;
  durationMinutes: number;
  courseType: CourseType;
  locationType: LocationType;
  active: boolean;
  createdAt?: string;
}

export interface Availability {
  id: number;
  professorId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface Review {
  id: number;
  bookingId: number;
  studentId: number;
  studentName: string;
  professorId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  studentId: number;
  studentName: string;
  professorId: number;
  professorName: string;
  offerId: number;
  offerTitle: string;
  durationMinutes?: number | null;
  locationType?: string | null;
  scheduledAt: string;
  status: BookingStatus;
  negotiatedPrice?: number | null;
  amount?: number | null;
  currency?: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentStatus?: PaymentStatus | null;
  meetingLocation?: string | null;
  meetingLink?: string | null;
  paidAt?: string | null;
  hasReview?: boolean;
  studentMessage?: string;
  professorResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateData {
  offerId: number;
  scheduledAt: string;
  studentMessage?: string;
  proposalId?: number;
  paymentMethod: PaymentMethod;
  meetingLocation?: string;
}

export interface PriceProposal {
  id: number;
  offerId: number;
  offerTitle: string;
  initialPrice: number;
  proposedPrice: number;
  professorId: number;
  professorName: string;
  studentId: number;
  studentName: string;
  message?: string;
  status: PriceProposalStatus;
  createdAt: string;
  respondedAt?: string;
  bookingId?: number | null;
}

export interface PriceProposalCreateData {
  offerId: number;
  proposedPrice: number;
  message?: string;
}

export interface ProfessorCard {
  id: number;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  cityId?: number;
  cityName?: string;
  bio?: string;
  experienceYears?: number;
  verified: boolean;
  averageRating: number | null;
  totalReviews: number;
  minPrice: number | null;
  subjects: Subject[];
  levels: Level[];
  offers: Offer[];
}

export interface ProfessorDetail extends ProfessorCard {
  reviews: Review[];
  reviewCount: number;
  availabilities: Availability[];
}

export interface SearchCriteria {
  cityId?: number;
  city?: string;
  subjectId?: number;
  levelId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  courseType?: CourseType;
  verifiedOnly?: boolean;
  sortBy?: 'rating' | 'priceAsc' | 'priceDesc' | 'reviews' | 'newest';
  page: number;
  size: number;
}

export interface PagedResult<T> {
  contenu: T[];
  page: number;
  taille: number;
  totalElements: number;
  totalPages: number;
}

export interface HomePage {
  popularCities: City[];
  popularSubjects: Subject[];
  levels: Level[];
  topProfessors: ProfessorCard[];
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterStudentData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  cityId?: number;
}

export interface RegisterProfessorData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  cityId?: number;
  bio?: string;
  experienceYears?: number;
  subjectIds?: number[];
  levelIds?: number[];
}

export interface StudentProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityId?: number;
  cityName?: string;
  profilePhoto?: string;
}

export interface ProfessorProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cityId?: number;
  cityName?: string;
  profilePhoto?: string;
  bio?: string;
  teachingAddress?: string;
  experienceYears?: number;
  verified: boolean;
  averageRating: number | null;
  totalReviews: number;
  subjects: Subject[];
  levels: Level[];
}

export interface UpdateProfessorData {
  phone?: string;
  cityId?: number;
  profilePhoto?: string;
  bio?: string;
  teachingAddress?: string;
  experienceYears?: number;
  subjectIds?: number[];
  levelIds?: number[];
}

export interface UpdateStudentData {
  phone?: string;
  cityId?: number;
  profilePhoto?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalProfessors: number;
  totalVerified: number;
  totalOffers: number;
  totalBookings: number;
  totalPendingBookings: number;
  totalReviews: number;
}

export interface ProfileBooking {
  id: number;
  studentId: number;
  studentName: string;
  professorId: number;
  professorName: string;
  offerId: number;
  offerTitle: string;
  scheduledAt: string;
  status: BookingStatus;
}