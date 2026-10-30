export const REVIEW_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  HIDDEN: "Hidden",
};

export const REVIEW_TRANSITIONS = {
  Pending: ["Approved", "Rejected"],
  Approved: ["Hidden"],
  Hidden: ["Approved"],
  Rejected: [],
};
