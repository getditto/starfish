export interface DittoQueryParams {
  /**
   * The collection to query
   * @required
   */
  collection: string;
  /**
   * The find query to run.
   * If not provided, all documents in the collection will be returned.
   */
  find?: string;
  /**
   * The limit of documents to return.
   * If not provided, all documents will be returned.
   */
  limit?: number;
  /**
   * The sort direction of the documents to return.
   * If not provided, all documents will be returned in order of when they were iterated.
   */
  sort?: { path: string; isAscending: boolean };
  /**
   * The arguments used for the find query.
   * If not provided, the find query will not have any arguments.
   */
  args?: { [key: string]: any };
}
