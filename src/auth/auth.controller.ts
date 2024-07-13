import { Controller, Body, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from '../users/users.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor (private readonly authService: AuthService) {}

    @Post('/register')
    registerUser(@Body() user: User, @Res() resp: Response) {

        return this.authService.registerUser(user, resp);

    }

    @Get('/login')
    loginUser(@Body() user: User, @Res() res: Response) {

        return this.authService.loginUser(user, res);

    }

    @Post('/user')
    authUser(@Req() req: Request, @Res() resp: Response) {

        return this.authService.authUser(req, resp);

    }

    @Post('/refresh')
    refreshUser(@Req() req: Request, @Res() resp: Response) {

        return this.authService.refreshUser(req, resp);

    }

    @Get('logout')
    logoutUser(@Res() resp: Response) {

        return this.authService.logoutUser(resp);
        
    }

}
