import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response, Request } from 'express';
import { User } from '../users/users.entity';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class AuthService {

    constructor (

        @InjectRepository (User) private userRepository: Repository<User>,

    ) {}

    async registerUser (user: User, resp: Response) {

        const { name, password } = user;

        if (!name?.trim() || !password.trim()) {

            return resp
                .status(500)
                .send({ message: 'Not all required fields have been filled in.' });
            
        }

        try {

            // Verifica se um usuário com o mesmo nome já existe
            const existingUser = await this.userRepository.findOne({ where: { name } });

            if (existingUser) {

                return resp
                    .status(409)
                    .send({ message: 'There is already a user with this name.' });

            }

            const newUser = await this.userRepository.save({

                name,
                password: await bcryptjs.hash(password, 12),
                
            });

            return resp
                .status(201)
                .send(newUser);

        } catch (error) {

            console.error(error);

            if (error instanceof QueryFailedError) {
                // @ts-ignore
                if (error.code === '23505') {
                    // @ts-ignore
                    console.error(`Unique constraint ${error.constraint} failed.`);

                    return resp
                        .status(500)
                        .send({ message: 'There is already a user with this name.' });

                }

            }

            return resp
                .status(500)
                .send({ message: error.message || 'Internal server error.' });
            
        }

    }

    async loginUser (user: User, resp: Response) {

        const { name, password } = user;

        if (!name?.trim() || !password?.trim()) {

            return resp
                .status(500)
                .send({ message: 'Not all required fields have been filled in.' });

        }

        const userDb = await this.userRepository.findOne({ where: { name } });

        if (!userDb) {

            return resp
                .status(404)
                .send({ message: 'Invalid credentials.' });

        }

        if (!(await bcryptjs.compare(password, userDb.password))) {

            return resp
                .status(403)
                .send({ message: 'Invalid credentials.' });

        }

        const accessToken = sign({ id: userDb.id }, process.env.ACCESS_SECRET, {

            expiresIn: 60 * 60,

        });

        const refreshToken = sign({ id: userDb.id }, process.env.REFRESH_SECRET, {

            expiresIn: 24 * 60 * 60,

        });

        resp.cookie('accessToken', accessToken, {

            httpOnly: true,

            maxAge: 24 * 60 * 60 * 1000, // 1 day

        });

        resp.cookie('refreshToken', refreshToken, {

            httpOnly: true,

            maxAge:7 *  24 * 60 * 60 * 1000, // 7 day

        });

        resp
            .status(200)
            .send({ message: 'Successfully logged in.' });
        
    }

    async authUser(req: Request, resp: Response) {

        try {

            const accessToken = req.cookies['accessToken'];

            if (!accessToken) {

                return resp
                    .status(401)
                    .send({ message: 'No access token provided.' });
            
            }
            
            const payload: any = verify(accessToken, process.env.ACCESS_SECRET);
        
            if (!payload) {

                return resp
                    .status(401)
                    .send({ message: 'Unauthenticated.' });

            }
        
            const user = await this.userRepository.findOne({

                where: { id: payload.id },

            });
        
            if (!user) {

                return resp
                    .status(401)
                    .send({ message: 'Unauthenticated.' });

            }
        
            return resp
                .status(200)
                .send(user);

        } catch (error) {

            console.error(error);

            return resp
                .status(500)
                .send({ message: error });

        }

    }

    async refreshUser(req: Request, resp: Response) {

        try {

            const refreshToken = req.cookies['refreshToken'];

            if (!refreshToken) {

                return resp
                    .status(401)
                    .send({ message: 'Refresh token must be provided.' });
            
            }

            const payload: any = verify(refreshToken, process.env.REFRESH_SECRET);
        
            if (!payload) {

                return resp
                    .status(401)
                    .send({ message: 'Unauthenticated.' });

            }
        
            const accessToken = sign({ id: payload.id }, process.env.ACCESS_SECRET, {

                expiresIn: 60 * 60,

            });
        
            resp.cookie('accessToken', accessToken, {

                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,

            });
        
            resp
                .status(200)
                .send({ message: 'refresh success.' });

        } catch (error) {

            console.error(error);

            return resp
                .status(500)
                .send({ message: error });

        }

    }

    async logoutUser(resp: Response) {

        resp.cookie('accessToken', '', { maxAge: 0 });
        resp.cookie('refreshToken', '', { maxAge: 0 });
    
        return resp
            .status(200)
            .send({ message: 'logged out.' });

    }

    getSecret(): string {
        return process.env.ACCESS_SECRET;
    }

}
