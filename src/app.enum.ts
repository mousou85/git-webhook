/**
 * git 서비스 종류
 */
export const EGitService = {
  github: 'github',
  gitlab: 'gitlab',
} as const;
export type EGitService = (typeof EGitService)[keyof typeof EGitService];
