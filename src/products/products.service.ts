import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('Product service');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;

    const totalPages = await this.product.count({ where: { available: true } });

    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
      }),
      metadata: {
        page,
        totalPages,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });

    if (!product) throw new NotFoundException("Product id's not found");

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    //* Quitamos el ID
    const { id: __, ...data } = updateProductDto;
    //* Si no existe, manda un error
    await this.findOne(id);
    //* Si alguna propiedad no llega, no lo pone nulo
    return this.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const product = await this.product.update({
      where: { id },
      data: { available: false },
    });
    return product;

    // return this.product.delete({ where: { id } });
  }
}
