import { Request, response, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';
import Customer from '../../typeorm/entities/Customer';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email } = request.body;

    const createCustomer = container.resolve(CreateCustomerService);

    const customer = await createCustomer.execute({
      name,
      email
    });

    return response.json(customer);

  }
}
