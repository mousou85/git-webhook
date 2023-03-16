import {EGitService} from '@app/app.enum';

/**
 * request 데이터중 처리에 필요한 값의 추출 데이터 구조
 */
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
