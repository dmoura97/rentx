// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";

import { inject, injectable } from "tsyringe";

import { ICarsRepository } from "@modules/cars/repositories/ICarsRepository";
import { Rental } from "@modules/rentals/infra/typeorm/entities/Rental";
import { IRentalsRepository } from "@modules/rentals/repositories/IRentalsRepository";
import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { AppError } from "@shared/errors/AppError";

// dayjs.extend(utc);

interface IRequest {
  user_id: string;
  car_id: string;
  expected_return_date: Date;
}

@injectable()
class CreateRentalUseCase {
  constructor(
    @inject("RentalsRepository")
    private rentalsRepository: IRentalsRepository,
    @inject("DayjsDateProvider")
    private dateProvider: IDateProvider,
    @inject("CarsRepository")
    private carsRepository: ICarsRepository
  ) {}

  async execute({
    user_id,
    car_id,
    expected_return_date,
  }: IRequest): Promise<Rental> {
    const minimumHour = 24;

    // verifica se o carro já está em uso em outro aluguel
    const carUnavailable = await this.rentalsRepository.findOpenRentalByCar(
      car_id
    );

    if (carUnavailable) {
      throw new AppError("Car is unavailable");
    }

    const rentalOpenToUser = await this.rentalsRepository.findOpenRentalByUser(
      user_id
    );

    if (rentalOpenToUser) {
      throw new AppError("There's a rental in progress for user!");
    }

    // const expectedReturnDateFormat = dayjs(expected_return_date) // formatada
    //   .utc()
    //   .local()
    //   .format();

    // const dateNow = dayjs().utc().local().format(); // dia atual formatado

    // const compare = dayjs(expectedReturnDateFormat).diff(dateNow, "hours"); // compara

    // console.log(compare);

    const dateNow = this.dateProvider.dateNow();

    // compara a data atual com a data de retorno
    const compare = this.dateProvider.compareInHours(
      dateNow,
      expected_return_date
    );

    // console.log(compare);

    if (compare < minimumHour) {
      throw new AppError("Invalid return time"); // se for menor que 24 horas da erro!
    }

    const rental = await this.rentalsRepository.create({
      user_id,
      car_id,
      expected_return_date,
    });

    await this.carsRepository.updateAvailable(car_id, false);

    return rental;
  }
}

export { CreateRentalUseCase };
