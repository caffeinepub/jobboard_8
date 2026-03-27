import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Briefcase, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { JobCard } from "../components/JobCard";
import { useJobs } from "../hooks/useQueries";

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];

export function JobListings() {
  const { data: jobs, isLoading } = useJobs();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const filtered = (jobs ?? []).filter((job) => {
    const kw = keyword.toLowerCase();
    const loc = location.toLowerCase();
    const matchKw =
      !kw ||
      job.title.toLowerCase().includes(kw) ||
      job.company.toLowerCase().includes(kw) ||
      job.description.toLowerCase().includes(kw);
    const matchLoc = !loc || job.location.toLowerCase().includes(loc);
    return matchKw && matchLoc;
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-16 px-4" data-ocid="hero.section">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Find Your Dream Job
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Discover thousands of opportunities at the world's best companies.
          </p>
          {/* Search bar */}
          <div className="bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-lg">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Job title, keywords, or company"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 px-0"
                data-ocid="search.input"
              />
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l border-border">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 px-0"
                data-ocid="search.input"
              />
            </div>
            <Button className="px-6" data-ocid="search.primary_button">
              <Search className="w-4 h-4 mr-2" />
              Search Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Job Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Job Listings
            </h2>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {filtered.length} {filtered.length === 1 ? "job" : "jobs"} found
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            data-ocid="jobs.loading_state"
          >
            {SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-7 w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" data-ocid="jobs.empty_state">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No jobs found
            </h3>
            <p className="text-muted-foreground text-sm">
              {keyword || location
                ? "Try adjusting your search terms"
                : "No jobs have been posted yet"}
            </p>
            {(keyword || location) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setKeyword("");
                  setLocation("");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            data-ocid="jobs.list"
          >
            {filtered.map((job, i) => (
              <JobCard key={job.id.toString()} job={job} index={i} />
            ))}
          </div>
        )}

        {/* Featured Roles */}
        {!isLoading && filtered.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Featured Roles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.slice(0, 4).map((job, i) => (
                <Link
                  key={job.id.toString()}
                  to="/jobs/$id"
                  params={{ id: job.id.toString() }}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-card transition-all flex items-center gap-4"
                  data-ocid={`featured.item.${i + 1}`}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                    style={{
                      background: `hsl(${(job.company.charCodeAt(0) * 15) % 360}, 60%, 50%)`,
                    }}
                  >
                    {job.company
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company} · {job.location}
                    </p>
                    <p className="text-sm text-primary font-medium mt-1">
                      ${Number(job.salaryMin).toLocaleString()} – $
                      {Number(job.salaryMax).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
