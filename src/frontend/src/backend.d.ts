import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Job {
    id: bigint;
    title: string;
    createdAt: bigint;
    description: string;
    isOpen: boolean;
    company: string;
    salaryMax: bigint;
    salaryMin: bigint;
    location: string;
}
export interface Application {
    id: bigint;
    status: string;
    appliedAt: bigint;
    applicantId: Principal;
    name: string;
    jobId: bigint;
    coverLetter: string;
    email: string;
    resumeSummary: string;
    relevantExperience: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    applyToJob(jobId: bigint, name: string, email: string, resumeSummary: string, coverLetter: string, relevantExperience: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createJob(title: string, company: string, location: string, salaryMin: bigint, salaryMax: bigint, description: string): Promise<void>;
    deleteJob(id: bigint): Promise<void>;
    getAllApplications(): Promise<Array<Application>>;
    getCallerUserRole(): Promise<UserRole>;
    getJob(id: bigint): Promise<Job>;
    getJobs(): Promise<Array<Job>>;
    getMyApplications(): Promise<Array<Application>>;
    isCallerAdmin(): Promise<boolean>;
    updateApplicationStatus(applicationId: bigint, status: string): Promise<void>;
    updateJob(id: bigint, title: string, company: string, location: string, salaryMin: bigint, salaryMax: bigint, description: string, isOpen: boolean): Promise<void>;
}
