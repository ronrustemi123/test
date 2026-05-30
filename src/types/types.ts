export type Status = "Submitted" | "Under Review" | "In Progress" | "Solved" | "Rejected";

export type Urgency = "Low" | "Medium" | "High";

export type PriorityLabel = "Low" | "Medium" | "High" | "Critical";

export type Category =
  | "Safety"
  | "Poor Lighting"
  | "Waste / Trash"
  | "Broken Infrastructure"
  | "Water Problem"
  | "Accessibility"
  | "Harassment-Risk Area"
  | "Parking / Traffic"
  | "Campus Issue"
  | "IT / Digital Service"
  | "Other";

export type Department =
  | "Maintenance"
  | "Security"
  | "Cleaning"
  | "IT Department"
  | "Student Services"
  | "Public Lighting"
  | "Roads"
  | "Environment"
  | "Municipality Services";

export type Report = {
  id: string;
  user_id: string | null;
  institution_id: string | null;
  title: string;
  description: string;
  category: Category | null;
  urgency: Urgency | null;
  status: Status;
  anonymous: boolean;
  safety_related: boolean;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  after_image_url: string | null;
  priority_score: number | null;
  priority_label: PriorityLabel | null;
  ai_reason: string | null;
  assigned_department: Department | null;
  admin_response: string | null;
  rejection_reason: string | null;
  contact_email: string | null;
  anonymous_tracking_id: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  solved_at: string | null;
  institutions: {id: string, name: string}
};

export type ReportComment = {
  id: string;
  report_id: string;
  user_id: string | null;
  anonymous_name: string | null;
  message: string;
  created_at: string;
};

export type ReportVote = {
  id: string;
  report_id: string;
  user_id: string;
  vote_type: "upvote" | "downvote";
  created_at: string;
};

export type ReportUpdate = {
  id: string;
  report_id: string;
  status: Status;
  message: string | null;
  created_by: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  institution_id: string | null;
  created_at: string;
};
