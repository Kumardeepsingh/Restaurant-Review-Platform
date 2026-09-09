package com.kumar.restaurant.services;

import com.kumar.restaurant.domain.RestaurantCreateUpdateRequest;
import com.kumar.restaurant.domain.entities.Restaurant;

public interface RestaurantService {
    Restaurant createRestaurant(RestaurantCreateUpdateRequest request);
}
