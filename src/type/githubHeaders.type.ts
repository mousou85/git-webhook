/**
 * github webhook 헤더 키 목록
 */
export const githubHeaderKeys = [
  'content-type',
  'User-Agent',
  'X-GitHub-Delivery',
  'X-GitHub-Event',
  'X-GitHub-Hook-ID',
  'X-GitHub-Hook-Installation-Target-ID',
  'X-GitHub-Hook-Installation-Target-Type',
  'X-Hub-Signature',
  'X-Hub-Signature-256',
] as const;

/**
 * github webhook 헤더 데이터 type definition
 */
export type TGithubHeaders = {
  [P in (typeof githubHeaderKeys)[number]]: string;
};
