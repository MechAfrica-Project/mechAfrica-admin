import { create } from 'zustand';

export type TableStore = {
  pages: Record<string, number>;
  selections: Record<string, string[]>;
  setPage: (tableId: string, page: number) => void;
  toggleSelect: (tableId: string, id: string) => void;
  selectMany: (tableId: string, ids: string[]) => void;
  deselectMany: (tableId: string, ids: string[]) => void;
  clearSelection: (tableId: string) => void;
};

// Predefine known table ids so selectors don't need to create new arrays,
// which avoids React 19's "getSnapshot should be cached" warning.
const initialSelections: TableStore['selections'] = {
  farmers: [],
  admins: [],
  requests: [],
  providers: [],
};

const initialPages: TableStore['pages'] = {
  farmers: 1,
  admins: 1,
  requests: 1,
  providers: 1,
};

export const useTableStore = create<TableStore>((set, get) => ({
  pages: initialPages,
  selections: initialSelections,
  setPage(tableId, page) {
    set((s) => ({ pages: { ...s.pages, [tableId]: page } }));
  },
  toggleSelect(tableId, id) {
    const selections = { ...get().selections };
    const list = new Set(selections[tableId] || []);
    if (list.has(id)) list.delete(id);
    else list.add(id);
    selections[tableId] = Array.from(list);
    set(() => ({ selections }));
  },
  selectMany(tableId, ids) {
    const selections = { ...get().selections };
    const list = new Set(selections[tableId] || []);
    ids.forEach((id) => list.add(id));
    selections[tableId] = Array.from(list);
    set(() => ({ selections }));
  },
  deselectMany(tableId, ids) {
    const selections = { ...get().selections };
    const list = new Set(selections[tableId] || []);
    ids.forEach((id) => list.delete(id));
    selections[tableId] = Array.from(list);
    selections[tableId] = Array.from(list);
    set(() => ({ selections }));
  },
  clearSelection(tableId) {
    set((s) => ({ selections: { ...s.selections, [tableId]: [] } }));
  },
}));

export default useTableStore;
