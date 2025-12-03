import { create } from 'zustand';

export type Admin = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: string;
  phoneNumber: string;
  dateOfRegistration: string;
};

export type AdminsState = {
  admins: Admin[];
  setAdmins: (a: Admin[]) => void;
  addAdmin: (admin: Omit<Admin, 'id'>) => void;
  deleteAdmin: (id: string) => void;
  updateAdmin: (id: string, patch: Partial<Admin>) => void;
};

const initialAdmins: Admin[] = [
  { id: '1', name: 'Jane Cooper', email: 'jad324h463', avatar: 'JC', type: 'Admin', phoneNumber: '05552731324', dateOfRegistration: '5/27/15' },
  { id: '2', name: 'Wade Warren', email: 'ad324h463', avatar: 'WW', type: 'Admin', phoneNumber: '05552731324', dateOfRegistration: '5/19/12' },
  { id: '3', name: 'Esther Howard', email: 'ad324h463', avatar: 'EH', type: 'Agent', phoneNumber: '05552731324', dateOfRegistration: '3/4/16' },
  { id: '4', name: 'Jenny Wilson', email: 'ad324h463', avatar: 'JW', type: 'Agent', phoneNumber: '05552731324', dateOfRegistration: '3/4/16' },
  { id: '5', name: 'Guy Hawkins', email: 'ad324h463', avatar: 'GH', type: 'Accounting', phoneNumber: '05552731324', dateOfRegistration: '7/27/13' },
  { id: '6', name: 'Jacob Jones', email: 'ad324h463', avatar: 'JJ', type: 'Agent', phoneNumber: '05552731324', dateOfRegistration: '5/27/15' },
  { id: '7', name: 'Ronald Richards', email: 'ad324h463', avatar: 'RR', type: 'Admin', phoneNumber: '05552731324', dateOfRegistration: '7/11/19' },
  { id: '8', name: 'Devon Lane', email: 'ad324h463', avatar: 'DL', type: 'Accounting', phoneNumber: '05552731324', dateOfRegistration: '9/23/16' },
  { id: '9', name: 'Jerome Bell', email: 'ad324h463', avatar: 'JB', type: 'Accounting', phoneNumber: '05552731324', dateOfRegistration: '8/2/19' },
];

export const useAdminsStore = create<AdminsState>((set) => ({
  admins: initialAdmins,
  setAdmins(a) {
    set({ admins: a });
  },
  addAdmin(admin) {
    set((s) => ({ admins: [...s.admins, { ...admin, id: String(s.admins.length + 1) }] }));
  },
  deleteAdmin(id) {
    set((s) => ({ admins: s.admins.filter((a) => a.id !== id) }));
  },
  updateAdmin(id, patch) {
    set((s) => ({ admins: s.admins.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
  },
}));

export default useAdminsStore;
