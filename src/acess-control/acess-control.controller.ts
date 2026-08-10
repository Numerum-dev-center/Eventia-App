import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AcessControlService } from './acess-control.service';
import { CreateAcessControlDto } from './dto/create-acess-control.dto';
import { UpdateAcessControlDto } from './dto/update-acess-control.dto';

@Controller('acess-control')
export class AcessControlController {
  constructor(private readonly acessControlService: AcessControlService) {}

  @Post()
  create(@Body() createAcessControlDto: CreateAcessControlDto) {
    return this.acessControlService.create(createAcessControlDto);
  }

  @Get()
  findAll() {
    return this.acessControlService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.acessControlService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAcessControlDto: UpdateAcessControlDto,
  ) {
    return this.acessControlService.update(+id, updateAcessControlDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.acessControlService.remove(+id);
  }
}
