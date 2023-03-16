import {EGitService} from '@app/app.enum';

/**
 * config.yaml의 item별 구조
 */
export interface IRepositoryConfigItem {
  service: EGitService;
  secret: string;
  repository: string;
  branch: string;
  working_dir: string;
  action: {
    push?: string[];
  };
}

/**
 * config.yaml 전체 구조
 */
export interface IRepositoryConfig {
  repository: IRepositoryConfigItem[];
}
