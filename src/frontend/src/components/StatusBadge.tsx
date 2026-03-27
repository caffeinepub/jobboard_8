interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-700 border-blue-200",
  "Under Review": "bg-yellow-100 text-yellow-700 border-yellow-200",
  Interview: "bg-purple-100 text-purple-700 border-purple-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  Offer: "bg-green-100 text-green-700 border-green-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles =
    STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}
    >
      {status}
    </span>
  );
}
