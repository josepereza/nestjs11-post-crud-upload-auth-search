import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';
import { Express } from 'express';
import { join } from 'path';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private dataSource: DataSource,
  ) {}
  @Get('prueba')
  async customQuery(): Promise<User[]> {
    const result = await this.dataSource.query<User[]>('SELECT * FROM user');
    return result;
  }

  @Get('search/:search')
  findSearch(@Param('search') search: string) {
    return this.postsService.findSearch(search);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    //const imagePath = file ? file.path : null;
    const imageUrl = `http://localhost:3000/uploads/${file.filename}`;

    return this.postsService.create(createPostDto, imageUrl);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!Number.isNaN(id)) {
      throw new BadRequestException('Invalid account ID');
    }
    return this.postsService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    //const imagePath = file ? file.path : null;
    const imageUrl = `http://localhost:3000/uploads/${file.filename}`;
    return this.postsService.update(+id, updatePostDto, imageUrl);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }

  @Get('image/:imageName')
  getImage(@Param('imageName') imageName: string, @Res() res: Response) {
    res.sendFile(join(process.cwd(), 'uploads', imageName));
  }
}
