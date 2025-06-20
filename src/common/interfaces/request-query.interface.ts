export interface RequestQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly sort?: string;
  readonly fields?: string;
  readonly search?: string;

  [key: string]: any;
}
