import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import Product from '@modules/products/infra/typeorm/entities/Product';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customerExists = await this.customersRepository.findById(customer_id);

    if(!customerExists) {
      throw new AppError('Could not find any customer');
    };

    const existemProducts = await this.productsRepository.findAllById(
      products
    );

    if(!existemProducts.length) {
      throw new AppError('Could not any products')
    };

    const productsQuantity = products.filter(
      product => existemProducts.filter(p => p.id == product.id)[0].quantity < product.quantity
    );

      if(productsQuantity.length) {
        throw new AppError('Is not quantity')
      };

      const sProducts = products.map( product => ({
        product_id: product.id,
        quantity: product.quantity,
        price: existemProducts.filter(p => p.id == product.id)[0].price
      }));

      const order = await this.ordersRepository.create({
        customer: customerExists,
        products: sProducts
      });

      const orderQuantityProducts = products.map(product => ({
        id: product.id,
        quantity: existemProducts.filter(p => p.id == product.id)[0].quantity - product.quantity
      }));

      await this.productsRepository.updateQuantity(orderQuantityProducts);

      return order;
  }
}

export default CreateOrderService;
