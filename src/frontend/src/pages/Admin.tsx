import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Edit2, Loader2, Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Application, Job } from "../backend.d";
import { UserRole } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllApplications,
  useCreateJob,
  useDeleteJob,
  useIsAdmin,
  useJobs,
  useUpdateApplicationStatus,
  useUpdateJob,
} from "../hooks/useQueries";

const APPLICATION_STATUSES = [
  "Applied",
  "Under Review",
  "Interview",
  "Rejected",
  "Offer",
];

type JobForm = {
  title: string;
  company: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  isOpen: boolean;
};

const emptyForm = (): JobForm => ({
  title: "",
  company: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  description: "",
  isOpen: true,
});

export function Admin() {
  const { loginStatus, identity, login } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: applications, isLoading: appsLoading } = useAllApplications();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  const updateStatus = useUpdateApplicationStatus();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [showJobDialog, setShowJobDialog] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobForm, setJobForm] = useState<JobForm>(emptyForm());
  const [makingAdmin, setMakingAdmin] = useState(false);

  const jobMap = new Map((jobs ?? []).map((j) => [j.id.toString(), j]));

  const openCreate = () => {
    setEditingJob(null);
    setJobForm(emptyForm());
    setShowJobDialog(true);
  };

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      salaryMin: Number(job.salaryMin).toString(),
      salaryMax: Number(job.salaryMax).toString(),
      description: job.description,
      isOpen: job.isOpen,
    });
    setShowJobDialog(true);
  };

  const handleSaveJob = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    const salaryMin = BigInt(
      Math.round(Number.parseFloat(jobForm.salaryMin) || 0),
    );
    const salaryMax = BigInt(
      Math.round(Number.parseFloat(jobForm.salaryMax) || 0),
    );
    try {
      if (editingJob) {
        await updateJob.mutateAsync({
          id: editingJob.id,
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          salaryMin,
          salaryMax,
          description: jobForm.description,
          isOpen: jobForm.isOpen,
        });
        toast.success("Job updated successfully");
      } else {
        await createJob.mutateAsync({
          title: jobForm.title,
          company: jobForm.company,
          location: jobForm.location,
          salaryMin,
          salaryMax,
          description: jobForm.description,
        });
        toast.success("Job created successfully");
      }
      setShowJobDialog(false);
    } catch {
      toast.error("Failed to save job");
    }
  };

  const handleDelete = async (job: Job) => {
    if (!confirm(`Delete "${job.title}"?`)) return;
    try {
      await deleteJob.mutateAsync(job.id);
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const handleStatusChange = async (app: Application, status: string) => {
    try {
      await updateStatus.mutateAsync({ applicationId: app.id, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleMakeMeAdmin = async () => {
    if (!actor || !identity) return;
    setMakingAdmin(true);
    try {
      const principal = identity.getPrincipal();
      await actor.assignCallerUserRole(principal, UserRole.admin);
      await queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      await queryClient.refetchQueries({ queryKey: ["isAdmin"] });
      toast.success("You are now an admin!");
    } catch {
      toast.error("Failed to assign admin role");
    } finally {
      setMakingAdmin(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Shield className="w-14 h-14 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground mb-6">
          Sign in to access the admin panel.
        </p>
        <Button onClick={() => login()} data-ocid="admin.primary_button">
          Login
        </Button>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div
        className="max-w-5xl mx-auto px-4 py-16 text-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-2">Checking permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-16 text-center"
        data-ocid="admin.panel"
      >
        <Shield className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Admin Access Required
        </h1>
        <p className="text-muted-foreground mb-6">
          You don't have admin permissions yet. If you're setting up this app
          for the first time, assign yourself admin access.
        </p>
        <Button
          onClick={handleMakeMeAdmin}
          disabled={makingAdmin}
          data-ocid="admin.primary_button"
        >
          {makingAdmin ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Assigning...
            </>
          ) : (
            "Make Me Admin"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 py-10"
      data-ocid="admin.panel"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Manage job listings and review applications.
        </p>
      </div>

      <Tabs defaultValue="jobs" data-ocid="admin.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="jobs" data-ocid="admin.tab">
            Job Listings
          </TabsTrigger>
          <TabsTrigger value="applications" data-ocid="admin.tab">
            Applications
          </TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">
                All Jobs ({jobs?.length ?? 0})
              </h2>
              <Button
                size="sm"
                onClick={openCreate}
                data-ocid="admin.open_modal_button"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Job
              </Button>
            </div>

            {jobsLoading ? (
              <div className="p-8 text-center" data-ocid="admin.loading_state">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              </div>
            ) : !jobs || jobs.length === 0 ? (
              <div className="p-8 text-center" data-ocid="admin.empty_state">
                <p className="text-muted-foreground">
                  No jobs yet. Create your first listing!
                </p>
              </div>
            ) : (
              <Table data-ocid="admin.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job, i) => (
                    <TableRow
                      key={job.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.company}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        ${Number(job.salaryMin).toLocaleString()} – $
                        {Number(job.salaryMax).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            job.isOpen
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {job.isOpen ? "Open" : "Closed"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => openEdit(job)}
                            data-ocid={`admin.edit_button.${i + 1}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(job)}
                            data-ocid={`admin.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">
                All Applications ({applications?.length ?? 0})
              </h2>
            </div>

            {appsLoading ? (
              <div className="p-8 text-center" data-ocid="admin.loading_state">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
              </div>
            ) : !applications || applications.length === 0 ? (
              <div className="p-8 text-center" data-ocid="admin.empty_state">
                <p className="text-muted-foreground">No applications yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app, i) => {
                      const job = jobMap.get(app.jobId.toString());
                      return (
                        <TableRow
                          key={app.id.toString()}
                          data-ocid={`admin.row.${i + 1}`}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{app.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {app.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {job ? job.title : `Job #${app.jobId.toString()}`}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(
                              Number(app.appliedAt) / 1_000_000,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={app.status}
                              onValueChange={(val) =>
                                handleStatusChange(app, val)
                              }
                            >
                              <SelectTrigger
                                className="w-36 h-8 text-xs"
                                data-ocid={`admin.select.${i + 1}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {APPLICATION_STATUSES.map((s) => (
                                  <SelectItem
                                    key={s}
                                    value={s}
                                    className="text-xs"
                                  >
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-lg" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Edit Job" : "Create New Job"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Job Title *</Label>
                <Input
                  placeholder="Software Engineer"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm((p) => ({ ...p, title: e.target.value }))
                  }
                  data-ocid="admin.input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Company *</Label>
                <Input
                  placeholder="Acme Corp"
                  value={jobForm.company}
                  onChange={(e) =>
                    setJobForm((p) => ({ ...p, company: e.target.value }))
                  }
                  data-ocid="admin.input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Location *</Label>
              <Input
                placeholder="San Francisco, CA / Remote"
                value={jobForm.location}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, location: e.target.value }))
                }
                data-ocid="admin.input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Min Salary ($)</Label>
                <Input
                  type="number"
                  placeholder="80000"
                  value={jobForm.salaryMin}
                  onChange={(e) =>
                    setJobForm((p) => ({ ...p, salaryMin: e.target.value }))
                  }
                  data-ocid="admin.input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Max Salary ($)</Label>
                <Input
                  type="number"
                  placeholder="120000"
                  value={jobForm.salaryMax}
                  onChange={(e) =>
                    setJobForm((p) => ({ ...p, salaryMax: e.target.value }))
                  }
                  data-ocid="admin.input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the role, responsibilities, and requirements..."
                value={jobForm.description}
                onChange={(e) =>
                  setJobForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={5}
                data-ocid="admin.textarea"
              />
            </div>

            {editingJob && (
              <div className="flex items-center gap-3">
                <Switch
                  id="isOpen"
                  checked={jobForm.isOpen}
                  onCheckedChange={(v) =>
                    setJobForm((p) => ({ ...p, isOpen: v }))
                  }
                  data-ocid="admin.switch"
                />
                <Label htmlFor="isOpen">Accepting Applications</Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJobDialog(false)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveJob}
              disabled={createJob.isPending || updateJob.isPending}
              data-ocid="admin.save_button"
            >
              {createJob.isPending || updateJob.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingJob ? (
                "Save Changes"
              ) : (
                "Create Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
