import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type Job = {
    id : Nat;
    title : Text;
    company : Text;
    location : Text;
    salaryMin : Nat;
    salaryMax : Nat;
    description : Text;
    isOpen : Bool;
    createdAt : Int;
  };

  type Application = {
    id : Nat;
    jobId : Nat;
    applicantId : Principal;
    name : Text;
    email : Text;
    resumeSummary : Text;
    coverLetter : Text;
    relevantExperience : Text;
    status : Text; // "Applied", "UnderReview", "Interview", "Rejected", "Offer"
    appliedAt : Int;
  };

  module Job {
    public func compare(job1 : Job, job2 : Job) : Order.Order {
      Nat.compare(job1.id, job2.id);
    };
  };

  module Application {
    public func compare(app1 : Application, app2 : Application) : Order.Order {
      Int.compare(app2.appliedAt, app1.appliedAt);
    };
  };

  // Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // State
  let jobs = Map.empty<Nat, Job>();
  let applications = Map.empty<Nat, Application>();
  var nextJobId = 1;
  var nextApplicationId = 1;

  // Helper Functions
  func requireJobExists(id : Nat) : Job {
    switch (jobs.get(id)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) { job };
    };
  };

  // Job Functions
  public shared ({ caller }) func createJob(title : Text, company : Text, location : Text, salaryMin : Nat, salaryMax : Nat, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let job : Job = {
      id = nextJobId;
      title;
      company;
      location;
      salaryMin;
      salaryMax;
      description;
      isOpen = true;
      createdAt = 0; // Default value as timestamps are not supported
    };
    jobs.add(nextJobId, job);
    nextJobId += 1;
  };

  public shared ({ caller }) func updateJob(id : Nat, title : Text, company : Text, location : Text, salaryMin : Nat, salaryMax : Nat, description : Text, isOpen : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let existingJob = requireJobExists(id);
    let updatedJob : Job = {
      id;
      title;
      company;
      location;
      salaryMin;
      salaryMax;
      description;
      isOpen;
      createdAt = existingJob.createdAt;
    };
    jobs.add(id, updatedJob);
  };

  public shared ({ caller }) func deleteJob(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    ignore requireJobExists(id);
    jobs.remove(id);
  };

  public query ({ caller }) func getJobs() : async [Job] {
    jobs.values().toArray().filter(func(job) { job.isOpen });
  };

  public query ({ caller }) func getJob(id : Nat) : async Job {
    requireJobExists(id);
  };

  // Application Functions
  public shared ({ caller }) func applyToJob(jobId : Nat, name : Text, email : Text, resumeSummary : Text, coverLetter : Text, relevantExperience : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    ignore requireJobExists(jobId);
    let application : Application = {
      id = nextApplicationId;
      jobId;
      applicantId = caller;
      name;
      email;
      resumeSummary;
      coverLetter;
      relevantExperience;
      status = "Applied";
      appliedAt = 0; // Default value as timestamps are not supported
    };
    applications.add(nextApplicationId, application);
    nextApplicationId += 1;
  };

  public query ({ caller }) func getMyApplications() : async [Application] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    applications.values().toArray().filter(func(app) { app.applicantId == caller });
  };

  public query ({ caller }) func getAllApplications() : async [Application] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    applications.values().toArray().sort();
  };

  public shared ({ caller }) func updateApplicationStatus(applicationId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application not found") };
      case (?app) {
        let updatedApp : Application = {
          id = app.id;
          jobId = app.jobId;
          applicantId = app.applicantId;
          name = app.name;
          email = app.email;
          resumeSummary = app.resumeSummary;
          coverLetter = app.coverLetter;
          relevantExperience = app.relevantExperience;
          status;
          appliedAt = app.appliedAt;
        };
        applications.add(applicationId, updatedApp);
      };
    };
  };
};
