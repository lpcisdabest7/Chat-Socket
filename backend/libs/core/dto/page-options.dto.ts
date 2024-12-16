import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@libs/utils/decorators/field.decorator';
import { Order } from '../constants/order';

export class PageOptionsDto {
  @EnumFieldOptional(() => Order, {
    default: Order.DESC,
  })
  readonly order: Order = Order.DESC;

  @StringFieldOptional({
    default: 'createdAt',
  })
  readonly orderField?: string;

  @NumberFieldOptional({
    minimum: 1,
    default: 1,
    int: true,
  })
  readonly page: number = 1;

  @NumberFieldOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
    int: true,
  })
  readonly take: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  @StringFieldOptional()
  readonly q?: string;
}
