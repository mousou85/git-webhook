import {EGitService} from '@app/app.enum';

export interface IRepositoryConfigWebhook {
  branch: string;
  secret: string;
  working_dir: string;
  action: {
    push?: string[];
  };
}

/**
 * config.yaml의 item별 구조
 */
export interface IRepositoryConfigItem {
  service: EGitService;
  repository: string;
  webhooks: IRepositoryConfigWebhook[];
}

/**
 * config.yaml 전체 구조
 */
export interface IRepositoryConfig {
  repository: IRepositoryConfigItem[];
}
