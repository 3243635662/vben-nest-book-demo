import { Result } from '../utils';

const fakeUserInfo = {
  userId: '1',
  username: 'fanfan',
  realName: 'Fanfan Admin',
  desc: 'manager',
  password: '123456',
  token: 'fakeToken1',
  roles: [
    {
      roleName: 'Fanfan Admin',
      value: 'fanfan',
    },
  ],
};
export default class UserService {
  async login() {
    return Result.success(fakeUserInfo);
  }

  async getUserInfoById() {
    return Result.success(fakeUserInfo);
  }
}
