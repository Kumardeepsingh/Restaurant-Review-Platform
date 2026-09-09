package com.kumar.restaurant.services;

import com.kumar.restaurant.domain.GeoLocation;
import com.kumar.restaurant.domain.entities.Address;

public interface GeoLocationService {
    GeoLocation geoLocate(Address address);
}
