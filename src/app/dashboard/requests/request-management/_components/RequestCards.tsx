"use client";

import React from 'react';
import Link from 'next/link';

type CardDef = {
  id: string;
  title: string;
  count: number;
  delta?: string;
  bg?: string;
};

export const cards: CardDef[] = [
  { id: 'new', title: 'New Requests', count: 20, delta: '+10%', bg: 'bg-yellow-50' },
  { id: 'ongoing', title: 'On-going Requests', count: 40, delta: '+15%', bg: 'bg-white' },
  { id: 'completed', title: 'Completed', count: 30, delta: '+5%', bg: 'bg-white' },
  { id: 'cancelled', title: 'Cancelled', count: 31, delta: '+11%', bg: 'bg-white' },
  { id: 'provider', title: 'Provider Requests', count: 25, delta: '-8%', bg: 'bg-white' },
  { id: 'demand', title: 'Demand to Supply', count: 30, delta: '+2%', bg: 'bg-white' },
];

export default function RequestCards({ selected, onSelect }: { selected?: string; onSelect?: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => {
        const card = (
          <div className={`${c.bg} rounded-lg border border-gray-100 p-4 cursor-pointer ${selected === c.id ? 'ring-2 ring-indigo-300' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{c.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{c.count}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm ${c.delta?.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>{c.delta}</span>
                <p className="text-xs text-gray-400">From last month</p>
              </div>
            </div>
          </div>
        );

        if (onSelect) {
          return (
            <div key={c.id} onClick={() => onSelect(c.id)}>
              {card}
            </div>
          );
        }

        return (
          <Link key={c.id} href={`/dashboard/requests/request-management/${c.id}`}>
            {card}
          </Link>
        );
      })}
    </div>
  );
}
