export type RequestItem = {
  id: string;
  name: string;
  handle?: string;
  status: 'Active' | 'Offline' | 'Wait' | 'Cancelled' | 'Completed' | 'Ongoing';
  email: string;
  date: string;
};

export const mockRequests: RequestItem[] = [
  { id: '1', name: 'Jane Cooper', handle: '@jane', status: 'Active', email: 'jessica.hanson@example.com', date: '5/27/15' },
  { id: '2', name: 'Wade Warren', handle: '@wade456', status: 'Active', email: 'willie.jennings@example.com', date: '5/19/12' },
  { id: '3', name: 'Esther Howard', handle: '@esther', status: 'Offline', email: 'd.chambers@example.com', date: '3/4/16' },
  { id: '4', name: 'Jenny Wilson', handle: '@jenny', status: 'Offline', email: 'willie.jennings@example.com', date: '3/4/16' },
  { id: '5', name: 'Guy Hawkins', handle: '@guy', status: 'Wait', email: 'michael.mitc@example.com', date: '7/27/13' },
  { id: '6', name: 'Jacob Jones', handle: '@jacob', status: 'Offline', email: 'michael.mitc@example.com', date: '5/27/15' },
  { id: '7', name: 'Ronald Richards', handle: '@ronald', status: 'Active', email: 'deanna.curtis@example.com', date: '7/11/19' },
  { id: '8', name: 'Devon Lane', handle: '@devon', status: 'Wait', email: 'alma.lawson@example.com', date: '9/23/16' },
  { id: '9', name: 'Jerome Bell', handle: '@jerome', status: 'Wait', email: 'tanya.hill@example.com', date: '8/2/19' },
];
