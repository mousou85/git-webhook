import {createParamDecorator} from '@nestjs/common';
import {CLS_REQ, ClsServiceManager} from 'nestjs-cls';

/**
 * 웹훅 요청을 보낸 git 서비스 이름 반환
 */
export const GitServiceName = createParamDecorator((): string => {
  const clsService = ClsServiceManager.getClsService();
  const {headers} = clsService.get(CLS_REQ);

  for (const key of Object.keys(headers)) {
    if (/^x-github-.*/i.test(key)) {
      return 'github';
    } else if (/^x-gitlab-.*/i.test(key)) {
      return 'gitlab';
    }
  }

  return undefined;
});
