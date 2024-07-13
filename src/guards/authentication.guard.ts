import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {

    constructor(private authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();

        try {

            const accessToken = request.cookies.accessToken;
            
            if (!accessToken) throw new Error('No access token provided.');

            const decodedPayload = jwt.verify(accessToken, this.authService.getSecret());
            
            const userId = decodedPayload.id;

            return true;

        } catch (error) {

            console.error(error.message);

            throw new UnauthorizedException('Unauthorized');

        }

    }

}