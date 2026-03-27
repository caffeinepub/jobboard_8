import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Clock, DollarSign, MapPin } from "lucide-react";
import type { Job } from "../backend.d";

const COMPANY_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function getCompanyColor(company: string): string {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length];
}

function formatSalary(min: bigint, max: bigint): string {
  const fmt = (n: bigint) => `$${Number(n).toLocaleString()}`;
  return `${fmt(min)} – ${fmt(max)}`;
}

function timeAgo(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  const now = Date.now();
  const diff = now - ms;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

interface JobCardProps {
  job: Job;
  index?: number;
}

export function JobCard({ job, index = 0 }: JobCardProps) {
  const initials = job.company
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colorClass = getCompanyColor(job.company);

  return (
    <div
      className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-col gap-4 hover:shadow-md transition-shadow"
      data-ocid={`jobs.item.${index + 1}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center text-white font-bold text-sm shrink-0`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
            {job.title}
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">{job.company}</p>
        </div>
        {!job.isOpen && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
            Closed
          </span>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <DollarSign className="w-3.5 h-3.5" />
          <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(job.createdAt)}
        </span>
        {job.isOpen ? (
          <Link to="/jobs/$id" params={{ id: job.id.toString() }}>
            <Button
              size="sm"
              className="text-xs h-7 px-3"
              data-ocid={`jobs.item.${index + 1}`}
            >
              Apply
            </Button>
          </Link>
        ) : (
          <Button size="sm" className="text-xs h-7 px-3" disabled>
            Closed
          </Button>
        )}
      </div>
    </div>
  );
}
