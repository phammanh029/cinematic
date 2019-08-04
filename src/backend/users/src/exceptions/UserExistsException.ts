import HttpException from './HttpException';

class UserExistsException extends HttpException {
    public constructor(email: string) {
        super(409, `User with email: ${email} already exists`);
    }
}

export default UserExistsException;
