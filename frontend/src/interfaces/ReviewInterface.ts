export interface ReviewInterface {
  id: number;
  bookId: number;
  rating: number;
  comment: string;
  // The API stores an unsigned review as `null` rather than inventing a name,
  // and the component is the one that decides to render it as "Anonymous".
  author: string | null;
  createdAt: string;
}
