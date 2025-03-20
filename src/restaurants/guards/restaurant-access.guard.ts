import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RestaurantsService } from '../restaurants.service';
import { RoleEnum } from '../../roles/roles.enum';

@Injectable()
export class RestaurantAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private restaurantsService: RestaurantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admin has access to everything
    if (String(user.role.id) === String(RoleEnum.admin)) {
      return true;
    }

    // Get restaurantId from params or body
    const restaurantId =
      request.params.restaurantId ||
      request.body.restaurantId ||
      (request.method === 'GET' && request.query.restaurantId);

    if (!restaurantId) {
      throw new ForbiddenException('Restaurant ID is required');
    }

    // Check if user has access to this restaurant
    const hasAccess = await this.restaurantsService.checkUserRestaurantAccess(
      user.id,
      restaurantId,
      String(user.role.id),
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have permission to access this restaurant',
      );
    }

    return true;
  }
}
