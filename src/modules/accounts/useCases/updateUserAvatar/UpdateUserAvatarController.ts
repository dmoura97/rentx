import { Request, Response } from "express";
import { container } from "tsyringe";

import { UpdateAvatarUseCase } from "./UpdateUserAvatarUseCase";

class UpdateUserAvatarController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const avatar_file = request.file.filename;

    const updateAvatarUseCase = container.resolve(UpdateAvatarUseCase);

    await updateAvatarUseCase.execute({ user_id: id, avatar_file });

    return response.status(204).send();
  }
}

export { UpdateUserAvatarController };
