import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { Place } from './places.entity';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {

    constructor (private readonly PlacesService: PlacesService) {}

    // get all places
    @Get()
    async findAll(): Promise<Place[]> {

        return await this.PlacesService.findAll();

    }

    // get one place
    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Place> {

        const place = await this.PlacesService.findOne(id);

        if (!place) {
            throw new Error('Place not found');
        }

        return place;

    }

    // create a new place
    @Post()
    async create(@Body() place: Place): Promise<Place> {

        return await this.PlacesService.create(place);

    }

    // update an existing place
    @Put(':id')
    async update(@Param('id') id: number, @Body() place: Place): Promise<Place> {

        if (!place) {
            throw new Error('Place not found');
        }

        return this.PlacesService.update(id, place);

    }

    // delete an existing place
    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {

        // handle the error if user not found
        const place = await this.PlacesService.findOne(id);

        if (!place) {
            throw new Error('Place not found');
        }

        return this.PlacesService.delete(id);

    }

}
