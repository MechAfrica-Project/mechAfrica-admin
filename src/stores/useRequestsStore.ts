import { create } from 'zustand';
import { mockRequests, RequestItem } from '@/app/dashboard/requests/request-management/_components/mockRequests';

export type RequestsState = {
  requests: RequestItem[];
  setRequests: (r: RequestItem[]) => void;
  deleteRequest: (id: string) => void;
  addRequest: (r: Omit<RequestItem, 'id'>) => void;
};

export const useRequestsStore = create<RequestsState>((set) => ({
  requests: mockRequests,
  setRequests(r) {
    set({ requests: r });
  },
  deleteRequest(id) {
    set((s) => ({ requests: s.requests.filter((r) => r.id !== id) }));
  },
  addRequest(r) {
    set((s) => ({ requests: [...s.requests, { ...r, id: String(s.requests.length + 1) }] }));
  },
}));

export default useRequestsStore;
