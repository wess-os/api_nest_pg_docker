import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor(

        @InjectRepository(User)
        private usersRepository: Repository<User>,

    ) {}

    // get all users
    async findAll(): Promise<User[]> {

        return await this.usersRepository.find();

    }

    // get one user
    async findOne(id: number): Promise<User> {

        return await this.usersRepository.findOne({ where: { id } });

    }

    // create a new user
    async create(user: User): Promise<User> {

        const newUser = this.usersRepository.create(user);

        return await this.usersRepository.save(newUser);

    }

    // update an existing user
    async update(id: number, user: User): Promise<User> {

       
        await this.usersRepository.update(id, user);

        return await this.usersRepository.findOne({ where: { id } });

    }

    // delete an existing user
    async delete(id: number): Promise<void> {

        await this.usersRepository.delete(id);

    }

}
