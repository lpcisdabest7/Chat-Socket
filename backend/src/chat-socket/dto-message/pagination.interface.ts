export interface PaginatedResults<T> {
  messages: T[];
  nextCursor: string | null;
  hasNext: boolean;
}
