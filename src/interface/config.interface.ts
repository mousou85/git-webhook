import {EGitService} from '@app/app.enum';

export interface IRepositoryConfigItem {
  service: EGitService;
  secret: string;
  repository: string;
  branch: string;
  working_dir: string;
}

export interface IRepositoryConfig {
  repository: IRepositoryConfigItem[];
}
