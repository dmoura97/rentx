import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListRentalsByUserUseCase } from "./ListRentalsByUserUseCase";

class ListRentalByUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;

    const listRentalsByUserUseCase = container.resolve(
      ListRentalsByUserUseCase
    );

    const rentalsByUser = await listRentalsByUserUseCase.execute(id);

    return response.json(rentalsByUser);
  }
}

export { ListRentalByUserController };
