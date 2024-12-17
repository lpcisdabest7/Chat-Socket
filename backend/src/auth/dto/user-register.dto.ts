import {
  EmailField,
  StringField,
  StringFieldOptional,
} from '@libs/utils/decorators/field.decorator';

export class UserRegisterDto {
  @EmailField()
  readonly email!: string;

  @StringField()
  readonly password!: string;

  @StringFieldOptional()
  firstName: string;

  @StringFieldOptional()
  lastName: string;
}
