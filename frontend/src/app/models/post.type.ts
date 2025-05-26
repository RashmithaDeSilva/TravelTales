import { Comment } from "./comment.type";


export type Post = {
  userId: number;
  title: string;
  content: string;
  country: string;
  dateOfVisit: string; // ISO date string (e.g., "2025-04-13T18:30:00.000Z")
  imageId: string;
  publishDate: string; // ISO date string (e.g., "2025-05-21T18:28:50.000Z")
  id: number;
  comments: Comment[]; 
  commentsCount: number;
  likes: number;
  disLikes: number;
  userName: string;
};
