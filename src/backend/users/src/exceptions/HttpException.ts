class HttpException extends Error {
  constructor(protected code: number, message: string) {
    super(message);
  }
}


export default HttpException;