'use client';

import { StatusType } from '@/lib/types';

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'researching':
        return 'bg-blue-100 text-blue-700 animate-pulse';
      case 'analyzing':
        return 'bg-purple-100 text-purple-700 animate-pulse';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'researching':
        return 'Researching...';
      case 'analyzing':
        return 'Analyzing...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
    >
      {status === 'researching' || status === 'analyzing' ? (
        <>
          <span className="flex h-2 w-2 rounded-full bg-current mr-2 animate-pulse"></span>
          {getStatusLabel()}
        </>
      ) : (
        getStatusLabel()
      )}
    </span>
  );
}
