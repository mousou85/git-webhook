export interface IRepositoryConfigItem {
  repository: string;
  path: string;
  branch: string;
  secret: string;
}

export interface IRepositoryConfig {
  repository: IRepositoryConfigItem[];
}
