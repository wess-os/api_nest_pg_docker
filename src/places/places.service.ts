import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './places.entity';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class PlacesService {

    constructor(

        @InjectRepository(Place) private placesRepository: Repository<Place>,

    ) {}

    // get all places
    async findAll(): Promise<any> {

        try {

            const places = await this.placesRepository.find();

            if (!places) {
                
                return [];

            }

            return places;

        } catch (error) {

            console.error(error);

            return [{ message: 'An error occurred while fetching places.' }];

        }

    }

    // get one place
    async findOne(id: number): Promise<Place> {

        const place = await this.placesRepository.findOne({ where: { id } });

        if (!place) {

            throw new HttpException('Place not found', HttpStatus.NOT_FOUND);

        }

        return place;
    }

    // create a new place
    async create(place: Place): Promise<Place> {

        const existingPlace = await this.placesRepository.findOne({ where: { name: place.name } });

        if (existingPlace) {

            throw new HttpException('A place with this name already exists.', HttpStatus.NOT_FOUND);

        }

        const newPlace = this.placesRepository.create(place);

        return await this.placesRepository.save(newPlace);

    }

    // update an existing place
    async update(id: number, place: Place): Promise<Place> {
       
        const existingPlace = await this.placesRepository.findOne({ where: { id } });

        if (!existingPlace) {
            
            throw new HttpException('Place not found', HttpStatus.NOT_FOUND);

        }

        if (existingPlace.name !== place.name) {
            
            const placeWithSameName = await this.placesRepository.findOne({ where: { name: place.name } });

            if (placeWithSameName) {
                
                throw new HttpException('A place with this name already exists.', HttpStatus.CONFLICT);

            }

        }

        if (existingPlace.name === place.name &&
            existingPlace.city === place.city &&
            existingPlace.state === place.state) {
                
            throw new HttpException('No changes needed', HttpStatus.BAD_REQUEST);

        }

        await this.placesRepository.update(id, place);

        return await this.placesRepository.findOne({ where: { id } });

    }

    // delete an existing place
    async delete(id: number): Promise<void> {

        const placeToDelete = await this.placesRepository.findOne({ where: { id } });

        if (!placeToDelete) {
            
            throw new HttpException('Place not found', HttpStatus.NOT_FOUND);

        }

        await this.placesRepository.delete(id);

    }

}
