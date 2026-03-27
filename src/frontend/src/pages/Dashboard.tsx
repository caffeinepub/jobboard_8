import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Briefcase, ClipboardList } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useJobs, useMyApplications } from "../hooks/useQueries";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4"];

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Dashboard() {
  const { loginStatus, identity, login } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: applications, isLoading } = useMyApplications();
  const { data: jobs } = useJobs();

  const jobMap = new Map((jobs ?? []).map((j) => [j.id.toString(), j]));

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Briefcase className="w-14 h-14 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          My Applications
        </h1>
        <p className="text-muted-foreground mb-6">
          Sign in to track your job applications.
        </p>
        <Button onClick={() => login()} data-ocid="dashboard.primary_button">
          Login to View Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your job applications.
        </p>
      </div>

      {isLoading ? (
        <div
          className="flex flex-col gap-3"
          data-ocid="dashboard.loading_state"
        >
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="bg-card border border-border rounded-xl p-5"
            >
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : !applications || applications.length === 0 ? (
        <div
          className="text-center py-16 bg-card border border-border rounded-xl"
          data-ocid="dashboard.empty_state"
        >
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No applications yet
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Browse open positions and submit your first application.
          </p>
          <Link to="/">
            <Button data-ocid="dashboard.primary_button">Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4" data-ocid="dashboard.list">
          {applications.map((app, i) => {
            const job = jobMap.get(app.jobId.toString());
            return (
              <div
                key={app.id.toString()}
                className="bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4"
                data-ocid={`dashboard.item.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{
                        background: job
                          ? `hsl(${(job.company.charCodeAt(0) * 15) % 360}, 60%, 50%)`
                          : "#6B7280",
                      }}
                    >
                      {job
                        ? job.company
                            .split(" ")
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()
                        : "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {job ? job.title : `Job #${app.jobId.toString()}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {job
                          ? `${job.company} · ${job.location}`
                          : "Position details unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Applied {formatDate(app.appliedAt)}</span>
                    {job && (
                      <span>{`$${Number(job.salaryMin).toLocaleString()} – $${Number(job.salaryMax).toLocaleString()}`}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={app.status} />
                  {job && (
                    <Link to="/jobs/$id" params={{ id: job.id.toString() }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        data-ocid={`dashboard.item.${i + 1}`}
                      >
                        View Job
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
