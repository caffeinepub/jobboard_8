import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Application, Job, UserRole } from "../backend.d";
import { useActor } from "./useActor";

export function useJobs() {
  const { actor, isFetching } = useActor();
  return useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJob(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Job>({
    queryKey: ["job", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getJob(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<Application[]>({
    queryKey: ["myApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<Application[]>({
    queryKey: ["allApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplyToJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      jobId: bigint;
      name: string;
      email: string;
      resumeSummary: string;
      coverLetter: string;
      relevantExperience: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.applyToJob(
        params.jobId,
        params.name,
        params.email,
        params.resumeSummary,
        params.coverLetter,
        params.relevantExperience,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      company: string;
      location: string;
      salaryMin: bigint;
      salaryMax: bigint;
      description: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createJob(
        params.title,
        params.company,
        params.location,
        params.salaryMin,
        params.salaryMax,
        params.description,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      title: string;
      company: string;
      location: string;
      salaryMin: bigint;
      salaryMax: bigint;
      description: string;
      isOpen: boolean;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateJob(
        params.id,
        params.title,
        params.company,
        params.location,
        params.salaryMin,
        params.salaryMax,
        params.description,
        params.isOpen,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteJob(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { applicationId: bigint; status: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateApplicationStatus(params.applicationId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}
