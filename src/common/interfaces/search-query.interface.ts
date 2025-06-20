export interface SearchQuery {
  $or?: Array<{ [key: string]: RegExp }>;

  [key: string]: any;
}
