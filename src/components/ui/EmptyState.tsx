import { Search, AlertCircle, Package, CheckCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'error' | 'package' | 'empty';
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const icons = {
  search: Search,
  error: AlertCircle,
  package: Package,
  empty: CheckCircle,
};

export function EmptyState({ icon = 'search', title, description, action }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action}
    </div>
  );
}
