import HttpException from './HttpException';

class UnAuthorizeException extends HttpException {
    public constructor() {
        super(403, 'You are not authorize to do this');
    }
}

export default UnAuthorizeException;
