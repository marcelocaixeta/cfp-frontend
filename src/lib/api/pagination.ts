export type PaginatedData<T> = {
  data: T[];
  current_page?: number;
  total?: number;
  per_page?: number;
};

export type PaginatedEnvelope<T> = {
  data: PaginatedData<T>;
};
