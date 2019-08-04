class HttpException extends Error {
    protected code: number;
    public constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}

export default HttpException;
