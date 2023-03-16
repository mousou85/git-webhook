/**
 * git 서비스 종류
 */
export const EGitService = {
  github: 'github',
  gitlab: 'gitlab',
} as const;
export type EGitService = (typeof EGitService)[keyof typeof EGitService];

/**
 * github webhook 이벤트 종류
 */
export const EGithubEvent = {
  ping: 'ping',
  push: 'push',
};
export type EGithubEvent = (typeof EGithubEvent)[keyof typeof EGithubEvent];
