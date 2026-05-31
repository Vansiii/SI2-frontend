/**
 * Badge para mostrar el estado del contrato
 */

import React from 'react';
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS, type ContractStatus } from '../types';

interface Props {
  status: ContractStatus;
  className?: string;
}

const statusStyles: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-800 border-gray-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  red: 'bg-red-100 text-red-800 border-red-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
};

export const ContractStatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const color = CONTRACT_STATUS_COLORS[status];
  const label = CONTRACT_STATUS_LABELS[status];
  const style = statusStyles[color] || statusStyles.gray;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {label}
    </span>
  );
};
