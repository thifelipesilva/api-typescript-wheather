import { Controller, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import AuthService from '@src/service/auth';
import { Request, Response } from 'express';
import { BaseController } from '.';
import logger from '@src/logger';

@Controller('users')
export class UsersController extends BaseController {
  @Post('register')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (error) {
      logger.error(error);
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }

  @Post('authenticate')
  public async authenticate(
    req: Request,
    res: Response
  ): Promise<Response | undefined> {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return this.sendErrorResponse(res, {
        code: 401, 
        message: 'User not found'
      });
      
    }
    if (!(await AuthService.comparePassword(password, user.password))) {
      return this.sendErrorResponse(res, {
        code: 401, 
        message: 'Password does not match' 
      }); 
        
    }
    const token = AuthService.generateToken(user.toJSON());
    return res.status(200).send({ token: token });
  }
}
