export interface IGithubPayload {
  repositoryName: string;
  repositoryFullName: string;
  ref: string;
  action: string;
  rawPayload: Record<string, any>;
}
