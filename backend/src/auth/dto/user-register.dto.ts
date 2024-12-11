import {
  EmailField,
  StringField,
} from '@libs/utils/decorators/field.decorator';

export class UserRegisterDto {
  @EmailField()
  readonly email!: string;

  @StringField()
  readonly password!: string;
}
