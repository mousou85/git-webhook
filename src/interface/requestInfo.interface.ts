import {EGitService} from '@app/app.enum';

export interface IRequestInfo {
  contentType: string;
  userAgent: string;
  gitServiceName: EGitService;
  signature: string;
  repositoryName: string;
  branch: string;
  event: string;
  rawHeaders: Record<string, string>;
  rawPayload: Record<string, any>;
}
