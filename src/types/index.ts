export type Institution = {
  id: string;
  name: string;
  fullName: string;
  city: string;
  description: string;
};

export type BottomTab = "home" | "map" | "chats";

export type Report = {
  title: string;
  location: string;
  status: "Pending" | "In Progress" | "Solved";
};

export type Chat = {
  name: string;
  message: string;
  time: string;
};