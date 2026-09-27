import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8090/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- Types ----------
export interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  language: string;
  durationMinutes: number;
  rating: number;
  releaseDate: string;
  posterUrl: string;
}

export interface City {
  id: number;
  name: string;
  state: string;
}

export interface Theater {
  id: number;
  name: string;
  address: string;
  city: City;
}

export interface Screen {
  id: number;
  name: string;
  totalSeats: number;
  theater: Theater;
}

export interface Show {
  id: number;
  movie: Movie;
  screen: Screen;
  showDate: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
}

export type SeatType = 'REGULAR' | 'PREMIUM' | 'VIP';

export interface Seat {
  id: number;
  seatNumber: string;
  row: string;
  col: number;
  seatType: SeatType;
  screen?: Screen;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface Booking {
  id: number;
  user: AppUser;
  show: Show;
  seats: Seat[];
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED';
  bookedAt: string;
  checkedIn: boolean;
  checkedInAt: string | null;
}

export interface GateVerifyResponse {
  admit: boolean;
  result: 'VALID' | 'ADMITTED' | 'ALREADY_USED' | 'CANCELLED' | 'NOT_FOUND' | 'INVALID';
  message: string;
  booking: Booking | null;
}

// ---------- Movies ----------
export const MovieAPI = {
  getAll: async (): Promise<Movie[]> => (await api.get('/movies')).data,
  getById: async (id: number): Promise<Movie> => (await api.get(`/movies/${id}`)).data,
  search: async (query: string): Promise<Movie[]> =>
    (await api.get(`/movies/search`, { params: { title: query } })).data,
};

// ---------- Cities ----------
export const CityAPI = {
  getAll: async (): Promise<City[]> => (await api.get('/cities')).data,
};

// ---------- Shows ----------
export const ShowAPI = {
  getById: async (id: number): Promise<Show> => (await api.get(`/shows/${id}`)).data,
  getByMovie: async (movieId: number): Promise<Show[]> =>
    (await api.get(`/shows/movie/${movieId}`)).data,
  getByMovieAndDate: async (movieId: number, date: string): Promise<Show[]> =>
    (await api.get(`/shows/movie/${movieId}/date`, { params: { date } })).data,
};

// ---------- Seats ----------
export const SeatAPI = {
  getByScreen: async (screenId: number): Promise<Seat[]> =>
    (await api.get(`/seats/screen/${screenId}`)).data,
};

// ---------- Bookings ----------
export const BookingAPI = {
  getAvailableSeats: async (showId: number): Promise<Seat[]> =>
    (await api.get(`/bookings/show/${showId}/available-seats`)).data,
  create: async (userId: number, showId: number, seatIds: number[]): Promise<Booking> =>
    (await api.post('/bookings', { userId, showId, seatIds })).data,
  getById: async (id: number): Promise<Booking> => (await api.get(`/bookings/${id}`)).data,
  getByUser: async (userId: number): Promise<Booking[]> =>
    (await api.get(`/bookings/user/${userId}`)).data,
  cancel: async (id: number): Promise<Booking> =>
    (await api.put(`/bookings/${id}/cancel`)).data,
};

// ---------- Gate (theatre scanner) ----------
export const GateAPI = {
  verify: async (bookingId: number): Promise<GateVerifyResponse> =>
    (await api.get(`/bookings/${bookingId}/verify`)).data,
  checkIn: async (bookingId: number): Promise<GateVerifyResponse> =>
    (await api.post(`/bookings/${bookingId}/check-in`)).data,
};

// ---------- Auth ----------
export const AuthAPI = {
  login: async (email: string, password: string): Promise<AppUser> =>
    (await api.post('/users/login', { email, password })).data,
  register: async (
    name: string,
    email: string,
    password: string,
    phone: string
  ): Promise<AppUser> =>
    (await api.post('/users/register', { name, email, password, phone })).data,
};

export default api;
