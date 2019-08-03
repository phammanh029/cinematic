import UserDto from '../model/user.dto';
import UserModel from '../model/user.model';
import UserExistsException from '../exceptions/UserExistsException';
import bcrypt from 'bcrypt';
import { get, post } from 'request-promise';
import User from '../model/user.interface';
import HttpException from '../exceptions/HttpException';
import LoginDto from '../authentication/login.dto';
import InvalidCredentialException from '../exceptions/InvalidCredentialException';
import jwt from 'jsonwebtoken';

class AuthenticationService {
  // register to kong api gateway
  private registerKongConsumer = async (user: User) => {
    try {
      await post({
        url: 'http://kong:8001/consumers',
        formData: {
          username: user.email
        },
        json: true
      });
    } catch (error) {
      throw new HttpException(500, error);
    }
  };

  // get jwt token from kong api gateway
  private getJWTToken = async (email: string) => {
    return await get({
      url: `http://kong:8001/consumers/${email}/jwt`,
      json: true
    });
  };

  // create jwt token from kong api
  private createJWT = async (email: string) => {
    return await post({
      url: `http://kong:8001/consumers/${email}/jwt`,
      formData: {},
      json: true
    });
  };

  // register user to database and add consumer to kong api gateway
  public register = async (user: UserDto) => {
    // check if user exists
    if (await UserModel.findOne({ email: user.email })) {
      // throw error that user already exist
      throw new UserExistsException(user.email);
    }

    // insert user to database
    try {
      const model = new UserModel(user);
      model.password = await bcrypt.hash(user.password, 10);
      // do register to kong api
      await this.registerKongConsumer(user);
    } catch (error) {
      throw error;
    }
  };

  // login
  public login = async (loginData: LoginDto) => {
    // check if user exists
    const user = await UserModel.findOne({ email: loginData.email });
    if (!user || !(await bcrypt.compare(loginData.password, user.password))) {
      throw new InvalidCredentialException();
    }

    try {
      // generate jwt token
      let tokens = await this.getJWTToken(user.email);
      let jwtToken;
      if (!tokens || tokens.length < 1) {
        jwtToken = await this.createJWT(user.email);
      } else {
        jwtToken = tokens[0];
      }
      let token = jwt.sign({ iss: jwtToken.key }, jwtToken.secret, {
        expiresIn: 60 * 60
      });
      return token;
    } catch (error) {
      throw new HttpException(500, error);
    }
  };
}

export default AuthenticationService;
