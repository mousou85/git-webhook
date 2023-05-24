![build test](https://github.com/mousou85/git-webhook/actions/workflows/build-test.yml/badge.svg)

# git webhook용 코드
git 서비스의 webhook 이벤트 수신 및 처리용 코드

## 설치
```shell
# 개발 환경
$ npm i

# 프로덕션 환경
$ npm i --production
```

## environment
`./samples/.env.sample`파일을 `.env`로 수정 후 필요한 정보 입력
dev/production에 따라 `.env`파일을 각각 아래 경로에 배치
- dev: `./config`
- production: `./dist/config`

```dotenv
#사용할 포트
PORT=#기본값: 3000
#처리할 webhook 이벤트 queue 파일명
QUEUE_FILE_NAME=#기본값: queue.ndjson
```

## configure
`./samples/app.config.yaml`파일을 git repository, webhook 정보 및 webhook 수신 시 필요한 정보 입력  
dev/production에 따라 `app.config.yaml`파일을 각각 아래 경로에 배치
- dev: `./config`
- production: `./dist/config`

`action` 항목은 수신받아 처리할 webhook 이벤트에 한해서만 정의하여 사용함.  
(push 이벤트만 수신 받아 처리하고 싶으면 push 항목만 정의해서 사용)

```yaml
repository:
  - service: git 서비스 이름(github | gitlab 등)
    repository: repository1 이름
    webhooks:
      - branch: 대상 branch1
        secret: "webhook secret"
        working_dir: "webhook 처리할 경로"
        action:
          push:
            - "push 이벤트 발생시 실행한 커맨드라인 명령어1"
            - "push 이벤트 발생시 실행한 커맨드라인 명령어2"
          pull:
            ...
      - branch: 대상 branch2
        ...
  - service: git 서비스 이름(github | gitlab 등)
    repository: repository2 이름
    ...
```

## 실행(web)
```shell
# 개발 환경
$ npm run start:dev

# 프로덕션 환경
# 빌드/실행 같이 진행하는 방법
$ npm run start

# 빌드/실행 나눠서 진행하는 방법
$ npm run build:app #빌드

$ npm run start:prod #실행
# 또는 dist/ 디렉토리에서 아래 실행
$ node main.js
```

### pm2
`./samples/pm2.ecosystem.js` 참고하여 `ecosystem.config.js` 파일 작성 후 `pm2 start ecosystem.config.js` 실행
```js
module.exports = {
  apps: [
    {
      name: 'git-webhook',
      cwd: '/git-webhook/dist', //실행 경로
      script: 'main.js', //실행할 파일(수정하지 않았다면 main.js 임)
      instances: 0,
      exec_mode: 'cluster',
      autorestart: true,
      merge_logs: true,
      watch: true,
      watch_delay: 1000,
      ignore_watch: ['cli.js', 'config/*', '*.ndjson'],
      user: "user_web", //실행할 유저명
      output: '/var/log/pm2/git-webhook/out.log',
      error: '/var/log/pm2/git-webhook/error.log',
    }
  ]
}
```

## 실행(cli)
```shell
# 개발 환경
$ npm run cli

# 프로덕션 환경
$ npm run build:cli # 빌드 
$ node cli.js #실행(dist/ 디렉토리에서 실행)
```

### systemctl 등록
`./samples/webhook.service`파일 참고하여 `/etc/systemd/system/webhook.service`파일 작성 후 `systemctl start webhook.service`로 실행  
자동실행 등록하고 싶은 경우 `systemctl enable webhook.service`로 등록
