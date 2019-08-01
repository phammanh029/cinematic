import HttpException from './HttpException';

class InvalidCredentialException extends HttpException {
  constructor() {
    super(401, 'email or password invalid');
  }
}

export default InvalidCredentialException;