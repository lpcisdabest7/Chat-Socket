import {
  applyDecorators,
  createParamDecorator,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  type PipeTransform,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ExecutionContext, type Type } from "@nestjs/common/interfaces";
import {
  ApiBearerAuth,
  ApiHeader,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { AuthGuard } from "../guards/auth.guard";
import { Roles } from "./role.decorator";
import { RoleType } from "libs/modules/token/token.type";
import { RolesGuard } from "../guards/role.guard";
import { AuthUserInterceptor } from "../interceptors/auth-user.interceptor";
import { ObjectIdPipe } from "../pipes/objectId.pipe";

export function Auth(
  roles: RoleType[] = [],
  options?: Partial<{ public: boolean }>
): MethodDecorator {
  const isPublicRoute = options?.public;

  return applyDecorators(
    Roles(roles),
    UseGuards(AuthGuard({ public: isPublicRoute }), RolesGuard),
    ApiBearerAuth(),
    UseInterceptors(AuthUserInterceptor),
    ApiUnauthorizedResponse({ description: "Unauthorized" })
  );
}

export function AuthRefreshToken(): MethodDecorator {
  return applyDecorators(
    UseGuards(AuthGuard({ refreshToken: true })),
    ApiHeader({
      name: "x-refresh-token",
      required: true,
    }),
    ApiUnauthorizedResponse({ description: "Unauthorized" })
  );
}

export function UUIDParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return Param(property, new ParseUUIDPipe({ version: "4" }), ...pipes);
}

export function IntParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return Param(property, new ParseIntPipe(), ...pipes);
}

export function ObjectIdParam(
  property: string,
  ...pipes: Array<Type<PipeTransform> | PipeTransform>
): ParameterDecorator {
  return Param(property, new ObjectIdPipe(), ...pipes);
}

export const LowercaseParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const paramValue = request.params[data as string];
    return paramValue ? paramValue.toLowerCase() : paramValue;
  }
);
