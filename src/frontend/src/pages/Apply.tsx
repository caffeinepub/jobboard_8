import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useApplyToJob, useJob } from "../hooks/useQueries";

export function Apply() {
  const { id } = useParams({ from: "/apply/$id" });
  const jobId = BigInt(id);
  const navigate = useNavigate();
  const { data: job, isLoading: jobLoading } = useJob(jobId);
  const { login, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const applyMutation = useApplyToJob();

  const [form, setForm] = useState({
    name: "",
    email: "",
    resumeSummary: "",
    coverLetter: "",
    relevantExperience: "",
  });

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please log in to apply");
      return;
    }
    try {
      await applyMutation.mutateAsync({
        jobId,
        name: form.name,
        email: form.email,
        resumeSummary: form.resumeSummary,
        coverLetter: form.coverLetter,
        relevantExperience: form.relevantExperience,
      });
      toast.success("Application submitted successfully!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to submit application. Please try again.");
    }
  };

  if (jobLoading) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-10 text-center"
        data-ocid="apply.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link
        to={job ? "/jobs/$id" : "/"}
        params={job ? { id: job.id.toString() } : {}}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        data-ocid="apply.link"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Job
      </Link>

      {job && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground">Applying for</p>
          <p className="font-semibold text-foreground">{job.title}</p>
          <p className="text-sm text-muted-foreground">
            {job.company} · {job.location}
          </p>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Sign in to Apply
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            You need to be logged in to submit an application.
          </p>
          <Button
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
            data-ocid="apply.primary_button"
          >
            {loginStatus === "logging-in"
              ? "Signing in..."
              : "Login to Continue"}
          </Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h1 className="text-xl font-bold text-foreground mb-6">
            Your Application
          </h1>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            data-ocid="apply.panel"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange("name")}
                  required
                  data-ocid="apply.input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange("email")}
                  required
                  data-ocid="apply.input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="resumeSummary">Resume Summary</Label>
              <Textarea
                id="resumeSummary"
                placeholder="Briefly summarize your background and key skills..."
                value={form.resumeSummary}
                onChange={handleChange("resumeSummary")}
                rows={4}
                required
                data-ocid="apply.textarea"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're a great fit for this role..."
                value={form.coverLetter}
                onChange={handleChange("coverLetter")}
                rows={5}
                required
                data-ocid="apply.textarea"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="relevantExperience">Relevant Experience</Label>
              <Textarea
                id="relevantExperience"
                placeholder="Describe your most relevant work experience..."
                value={form.relevantExperience}
                onChange={handleChange("relevantExperience")}
                rows={4}
                required
                data-ocid="apply.textarea"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={applyMutation.isPending}
              className="w-full"
              data-ocid="apply.submit_button"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
