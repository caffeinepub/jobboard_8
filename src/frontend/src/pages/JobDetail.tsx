import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
} from "lucide-react";
import { useJob } from "../hooks/useQueries";

function formatSalary(min: bigint, max: bigint): string {
  return `$${Number(min).toLocaleString()} – $${Number(max).toLocaleString()}`;
}

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function JobDetail() {
  const { id } = useParams({ from: "/jobs/$id" });
  const jobId = BigInt(id);
  const { data: job, isLoading, isError } = useJob(jobId);

  if (isLoading) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-10"
        data-ocid="job_detail.loading_state"
      >
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-5 w-1/4 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div
        className="max-w-4xl mx-auto px-4 py-10 text-center"
        data-ocid="job_detail.error_state"
      >
        <p className="text-muted-foreground">Job not found.</p>
        <Link to="/">
          <Button variant="outline" className="mt-4">
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        data-ocid="job_detail.link"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
        {/* Header band */}
        <div className="bg-primary/5 border-b border-border p-6">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{
                background: `hsl(${(job.company.charCodeAt(0) * 15) % 360}, 60%, 50%)`,
              }}
            >
              {job.company
                .split(" ")
                .slice(0, 2)
                .map((w: string) => w[0])
                .join("")
                .toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {job.title}
                  </h1>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {job.company}
                  </p>
                </div>
                {job.isOpen ? (
                  <Link to="/apply/$id" params={{ id: job.id.toString() }}>
                    <Button size="lg" data-ocid="job_detail.primary_button">
                      Apply Now
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" disabled>
                    Applications Closed
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Posted {formatDate(job.createdAt)}
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4" />
                  <span
                    className={
                      job.isOpen
                        ? "text-green-600 font-medium"
                        : "text-red-500 font-medium"
                    }
                  >
                    {job.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Job Description
          </h2>
          <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {/* Footer CTA */}
        {job.isOpen && (
          <div className="border-t border-border p-6 bg-muted/30 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-foreground">
                Interested in this role?
              </p>
              <p className="text-sm text-muted-foreground">
                Submit your application now.
              </p>
            </div>
            <Link to="/apply/$id" params={{ id: job.id.toString() }}>
              <Button size="lg" data-ocid="job_detail.primary_button">
                Apply Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
