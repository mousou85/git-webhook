import {EGithubEvent, EGitService} from '@app/app.enum';

/**
 * queue 파일 구조 인터페이스
 */
export interface IQueue {
  service: EGitService;
  repository: string;
  branch: string;
  workingDir: string;
  event: EGithubEvent;
  actions: string[];
}
