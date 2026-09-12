import type {
  City, Subject, Level, Offer, Availability, Booking, BookingCreateData, Review, PriceProposal, PriceProposalCreateData,
  ProfessorCard, ProfessorDetail, SearchCriteria, PagedResult, HomePage,
  AuthResponse, LoginData, RegisterStudentData, RegisterProfessorData, User,
  StudentProfile, ProfessorProfile, UpdateProfessorData, UpdateStudentData,
  NotificationItem, AdminStats, ProfileBooking,
} from '../types';

const API_BASE = '/api';

async function parseError(text: string): Promise<string> {
  try {
    const json = JSON.parse(text);
    if (json.details) return `${json.error} — ${json.details}`;
    return json.error || `Erreur ${text}`;
  } catch {
    if (text.trim().startsWith('<')) return 'Le service est temporairement indisponible. Veuillez réessayer.';
    return text || 'Erreur inconnue';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(await parseError(text));
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

function getToken(): string | null {
  return localStorage.getItem('cc_token');
}

function headers(extra?: Record<string, string>): Record<string, string> {
  return { 'Content-Type': 'application/json', ...(extra || {}) };
}

async function publicFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, { ...options, headers: headers(options.headers as Record<string, string>) });
  return handleResponse<T>(response);
}

async function authFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...headers(options.headers as Record<string, string>), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (response.status === 401) {
    const savedToken = token || localStorage.getItem('cc_token');
    if (savedToken) {
      fetch(`${API_BASE}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${savedToken}` } }).catch(() => {});
    }
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    window.location.href = '/login';
    throw new Error('Session expirée');
  }
  return handleResponse<T>(response);
}

/* ------------------------------- PUBLIC ------------------------------- */

export function fetchHomePage(): Promise<HomePage> {
  return publicFetch<HomePage>('/home');
}

export function fetchCities(): Promise<City[]> {
  return publicFetch<City[]>('/cities?active=true');
}

export function fetchSubjects(): Promise<Subject[]> {
  return publicFetch<Subject[]>('/subjects?active=true');
}

export function fetchLevels(): Promise<Level[]> {
  return publicFetch<Level[]>('/levels?active=true');
}

export function searchProfessors(criteria: SearchCriteria): Promise<PagedResult<ProfessorCard>> {
  const params = new URLSearchParams({
    page: String(criteria.page),
    size: String(criteria.size),
  });
  if (criteria.cityId !== undefined && criteria.cityId !== null) params.set('cityId', String(criteria.cityId));
  if (criteria.city) params.set('city', criteria.city);
  if (criteria.subjectId !== undefined && criteria.subjectId !== null) params.set('subjectId', String(criteria.subjectId));
  if (criteria.levelId !== undefined && criteria.levelId !== null) params.set('levelId', String(criteria.levelId));
  if (criteria.minPrice !== undefined && criteria.minPrice !== null) params.set('minPrice', String(criteria.minPrice));
  if (criteria.maxPrice !== undefined && criteria.maxPrice !== null) params.set('maxPrice', String(criteria.maxPrice));
  if (criteria.minRating !== undefined && criteria.minRating !== null) params.set('minRating', String(criteria.minRating));
  if (criteria.courseType) params.set('courseType', criteria.courseType);
  if (criteria.verifiedOnly) params.set('verifiedOnly', 'true');
  if (criteria.sortBy && criteria.sortBy !== 'rating') params.set('sortBy', criteria.sortBy);
  return publicFetch<PagedResult<ProfessorCard>>(`/professors?${params.toString()}`);
}

export function fetchProfessor(id: number): Promise<ProfessorDetail> {
  return publicFetch<ProfessorDetail>(`/professors/${id}`);
}

export function fetchProfessorReviews(id: number): Promise<Review[]> {
  return publicFetch<Review[]>(`/professors/${id}/reviews`);
}

/* ------------------------------- AUTH ------------------------------- */

export function login(data: LoginData): Promise<AuthResponse> {
  return publicFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
}

export function registerStudent(data: RegisterStudentData): Promise<AuthResponse> {
  return publicFetch<AuthResponse>('/auth/register/student', { method: 'POST', body: JSON.stringify(data) });
}

export function registerProfessor(data: RegisterProfessorData): Promise<AuthResponse> {
  return publicFetch<AuthResponse>('/auth/register/professor', { method: 'POST', body: JSON.stringify(data) });
}

export function getMe(): Promise<User> {
  return authFetch<User>('/auth/me');
}

export function logoutApi(): Promise<void> {
  return authFetch<void>('/auth/logout', { method: 'POST' });
}

/* ------------------------------- STUDENT ------------------------------- */

export function getStudentProfile(): Promise<StudentProfile> {
  return authFetch<StudentProfile>('/students/me');
}

export function updateStudentProfile(data: UpdateStudentData): Promise<StudentProfile> {
  return authFetch<StudentProfile>('/students/me', { method: 'PUT', body: JSON.stringify(data) });
}

export function getMyStudentBookings(): Promise<Booking[]> {
  return authFetch<Booking[]>('/students/me/bookings');
}

export function createBooking(data: BookingCreateData): Promise<Booking> {
  return authFetch<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) });
}

export function cancelBooking(id: number): Promise<Booking> {
  return authFetch<Booking>(`/bookings/${id}/cancel`, { method: 'PUT' });
}

export function createReview(bookingId: number, data: { rating: number; comment?: string }): Promise<Review> {
  return authFetch<Review>(`/reviews/bookings/${bookingId}`, { method: 'POST', body: JSON.stringify(data) });
}

export function reviewExistsForBooking(bookingId: number): Promise<{ exists: boolean }> {
  return authFetch<{ exists: boolean }>(`/reviews/bookings/${bookingId}/exists`);
}

/* ------------------------------- PRICE PROPOSALS ------------------------------- */

export function createPriceProposal(data: PriceProposalCreateData): Promise<PriceProposal> {
  return authFetch<PriceProposal>('/proposals', { method: 'POST', body: JSON.stringify(data) });
}

export function getMyProposals(): Promise<PriceProposal[]> {
  return authFetch<PriceProposal[]>('/proposals/me');
}

export function getProfessorProposals(): Promise<PriceProposal[]> {
  return authFetch<PriceProposal[]>('/proposals/professor');
}

export function acceptProposal(id: number): Promise<PriceProposal> {
  return authFetch<PriceProposal>(`/proposals/${id}/accept`, { method: 'PUT' });
}

export function rejectProposal(id: number): Promise<PriceProposal> {
  return authFetch<PriceProposal>(`/proposals/${id}/reject`, { method: 'PUT' });
}

export function cancelProposal(id: number): Promise<PriceProposal> {
  return authFetch<PriceProposal>(`/proposals/${id}/cancel`, { method: 'PUT' });
}

/* ------------------------------- PROFESSOR ------------------------------- */

export function getMyProfessorProfile(): Promise<ProfessorProfile> {
  return authFetch<ProfessorProfile>('/professors/me');
}

export function updateMyProfessorProfile(data: UpdateProfessorData): Promise<ProfessorProfile> {
  return authFetch<ProfessorProfile>('/professors/me', { method: 'PUT', body: JSON.stringify(data) });
}

export function getMyOffers(): Promise<Offer[]> {
  return authFetch<Offer[]>('/professors/me/offers');
}

export function createOffer(data: Omit<Offer, 'id' | 'professorId' | 'active' | 'createdAt'>): Promise<Offer> {
  return authFetch<Offer>('/professors/me/offers', { method: 'POST', body: JSON.stringify(data) });
}

export function updateOffer(id: number, data: Omit<Offer, 'id' | 'professorId' | 'active' | 'createdAt'>): Promise<Offer> {
  return authFetch<Offer>(`/professors/me/offers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteOffer(id: number): Promise<void> {
  return authFetch<void>(`/professors/me/offers/${id}`, { method: 'DELETE' });
}

export function getMyAvailability(): Promise<Availability[]> {
  return authFetch<Availability[]>('/professors/me/availability');
}

export function createAvailability(data: { dayOfWeek: string; startTime: string; endTime: string }): Promise<Availability> {
  return authFetch<Availability>('/professors/me/availability', { method: 'POST', body: JSON.stringify(data) });
}

export function deleteAvailability(id: number): Promise<void> {
  return authFetch<void>(`/professors/me/availability/${id}`, { method: 'DELETE' });
}

export function getMyProfessorBookings(): Promise<Booking[]> {
  return authFetch<Booking[]>('/professors/me/bookings');
}

export function acceptBooking(id: number, dto: { meetingLink?: string; meetingLocation?: string } = {}): Promise<Booking> {
  return authFetch<Booking>(`/bookings/${id}/accept`, { method: 'PUT', body: JSON.stringify(dto) });
}

export function markBookingPaid(id: number): Promise<Booking> {
  return authFetch<Booking>(`/bookings/${id}/payment/mark-paid`, { method: 'PUT', body: '{}' });
}

export function rejectBooking(id: number, reason?: string): Promise<Booking> {
  return authFetch<Booking>(`/bookings/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason: reason || 'Disponibilité non compatible' }),
  });
}

export function completeBooking(id: number): Promise<Booking> {
  return authFetch<Booking>(`/bookings/${id}/complete`, { method: 'PUT' });
}

export function getMyReviews(): Promise<Review[]> {
  return authFetch<Review[]>('/reviews/me');
}

/* ------------------------------- NOTIFICATIONS ------------------------------- */

export function getNotifications(): Promise<NotificationItem[]> {
  return authFetch<NotificationItem[]>('/notifications');
}

export function markAllRead(): Promise<void> {
  return authFetch<void>('/notifications/read-all', { method: 'PUT' });
}

/* ------------------------------- ADMIN ------------------------------- */

export function getAdminStats(): Promise<AdminStats> {
  return authFetch<AdminStats>('/admin/stats');
}

export function getUsers(): Promise<User[]> {
  return authFetch<User[]>('/admin/users');
}

export function getAdminProfessors(): Promise<ProfessorProfile[]> {
  return authFetch<ProfessorProfile[]>('/admin/professors');
}

export function getAdminBookings(): Promise<ProfileBooking[]> {
  return authFetch<ProfileBooking[]>('/admin/bookings');
}

export function getAdminReviews(): Promise<Review[]> {
  return authFetch<Review[]>('/admin/reviews');
}

export function deleteReview(id: number): Promise<void> {
  return authFetch<void>(`/admin/reviews/${id}`, { method: 'DELETE' });
}

export function toggleUserStatus(userId: number, enabled: boolean): Promise<User> {
  return authFetch<User>(`/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ enabled }) });
}

export function verifyProfessor(professorId: number): Promise<ProfessorProfile> {
  return authFetch<ProfessorProfile>(`/admin/professors/${professorId}/verify`, { method: 'PUT' });
}

export function createCity(data: { name: string; region?: string }): Promise<City> {
  return authFetch<City>('/cities', { method: 'POST', body: JSON.stringify(data) });
}

export function createSubject(data: { name: string; description?: string }): Promise<Subject> {
  return authFetch<Subject>('/subjects', { method: 'POST', body: JSON.stringify(data) });
}

export function createLevel(data: { name: string; description?: string; displayOrder: number }): Promise<Level> {
  return authFetch<Level>('/levels', { method: 'POST', body: JSON.stringify(data) });
}