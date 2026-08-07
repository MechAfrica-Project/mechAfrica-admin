<RULE>
# UI/UX: No Global Loading Spinners for Lists/Data Fetching
Never use global, full-page loaders (e.g. `min-h-screen bg-background` with a centered spinner) for data fetching, especially during search, filtering, or pagination in tables and lists.

- **Always use Skeleton Loaders**: When fetching a list or table, map over an array of `Skeleton` components that mimic the exact shape of the table rows or list cards. 
- **Subtle Progress Indicators**: For background revalidation or pagination loading where some data is already present, use a subtle, non-intrusive indicator (like an indeterminate progress bar at the top of the table) rather than a full overlay that dims the content.
- **Maintain Context**: The page layout, headers, and filters should NEVER disappear or jump while data is loading.
</RULE>
