import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Auth Store
export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('auth-storage');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (userData) => set((state) => ({
                user: { ...state.user, ...userData }
            })),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Search Store
export const useSearchStore = create((set) => ({
    searchParams: {
        city: '',
        checkIn: null,
        checkOut: null,
        guests: 2,
    },

    setSearchParams: (params) => set((state) => ({
        searchParams: { ...state.searchParams, ...params }
    })),

    clearSearch: () => set({
        searchParams: {
            city: '',
            checkIn: null,
            checkOut: null,
            guests: 2,
        }
    }),
}));

// Booking Store
export const useBookingStore = create((set) => ({
    currentBooking: null,
    selectedRooms: [],

    setCurrentBooking: (booking) => set({ currentBooking: booking }),

    addRoom: (room) => set((state) => ({
        selectedRooms: [...state.selectedRooms, room]
    })),

    removeRoom: (roomId) => set((state) => ({
        selectedRooms: state.selectedRooms.filter(r => r.id !== roomId)
    })),

    clearBooking: () => set({
        currentBooking: null,
        selectedRooms: [],
    }),
}));
