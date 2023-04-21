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


## 실행
```shell
# 개발 환경
$ npm run start:dev

# 프로덕션 환경
# 빌드/실행 같이 진행하는 방법
$ npm run start

# 빌드/실행 나눠서 진행하는 방법
$ npm run build
$ npm run start:prod
```

## environment
`./config`경로의 `.env.sample`파일명을 `.env`로 수정 후 필요한 정보 입력
```dotenv
#사용할 포트
PORT=#기본값: 3000
```

## configure
`./config`경로의 `app.config.yaml.sample`을 `app.config.yaml`으로 수정 후 git repository, webhook 정보 및 webhook 수신 시 필요한 정보 입력  
  
`action` 항목은 수신받아 처리할 webhook 이벤트에 한해서만 정의하여 사용함.  
(push 이벤트만 수신 받아 처리하고 싶으면 push 항목만 정의해서 사용)

```yaml
repository:
  - service: git 서비스 이름(github | gitlab 등)
    repository: repository 이름
    branch: 대상 branch
    secret: "webhook secret"
    working_dir: . (webhook 처리할 경로)
    action:
      push:
        - "push 이벤트 발생시 실행한 커맨드라인 명령어1"
        - "push 이벤트 발생시 실행한 커맨드라인 명령어2"
      pull:
        - "pull 이벤트 발생시 실행한 커맨드라인 명령어1"
        - "pull 이벤트 발생시 실행한 커맨드라인 명령어2"
```
