"use client";

import {
  CreateRestaurantRequest,
  CreateReviewRequest,
  PaginatedResponse,
  Photo,
  Restaurant,
  RestaurantSearchParams,
  RestaurantSummary,
  Review,
  UpdateRestaurantRequest,
  UpdateReviewRequest,
} from "@/domain/domain";
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiService } from "./apiService";

export class AxiosApiService implements ApiService {
  private api: AxiosInstance;
  private getAccessToken: () => string | undefined;

  constructor(baseUrl: string, getAccessToken: () => string | undefined) {
    this.getAccessToken = getAccessToken;
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.api.defaults.xsrfHeaderName = undefined;
    this.setupAuthInterceptor();
  }

  private setupAuthInterceptor() {
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const headers = new AxiosHeaders(config.headers);
        const token = this.getAccessToken();
        if (token) {
          headers.setAuthorization(`Bearer ${token}`);
        }
        config.headers = headers;
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      },
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
        }

        return Promise.reject(error);
      },
    );
  }

  // Restaurant endpoints implementation
  public async searchRestaurants(
    params: RestaurantSearchParams,
  ): Promise<PaginatedResponse<RestaurantSummary>> {
    const response: AxiosResponse<PaginatedResponse<RestaurantSummary>> =
      await this.api.get("/restaurants", { params });
    return response.data;
  }

  public async getRestaurant(restaurantId: string): Promise<Restaurant> {
    const response: AxiosResponse<Restaurant> = await this.api.get(
      `/restaurants/${restaurantId}`,
    );
    return response.data;
  }

  public async createRestaurant(
    request: CreateRestaurantRequest,
  ): Promise<Restaurant> {
    const response: AxiosResponse<Restaurant> = await this.api.post(
      "/restaurants",
      request,
    );
    return response.data;
  }

  public async updateRestaurant(
    restaurantId: string,
    request: UpdateRestaurantRequest,
  ): Promise<void> {
    await this.api.put(`/restaurants/${restaurantId}`, request);
  }

  public async deleteRestaurant(restaurantId: string): Promise<void> {
    await this.api.delete(`/restaurants/${restaurantId}`);
  }

  // Review endpoints implementation
  public async getRestaurantReviews(
    restaurantId: string,
    sort?: "datePosted,desc" | "datePosted,asc" | "rating,desc" | "rating,asc",
    page?: number,
    size?: number,
  ): Promise<PaginatedResponse<Review>> {
    const response: AxiosResponse<PaginatedResponse<Review>> =
      await this.api.get(`/restaurants/${restaurantId}/reviews`, {
        params: { sort, page, size },
      });
    return response.data;
  }

  public async getRestaurantReview(
    restaurantId: string,
    reviewId: string,
  ): Promise<Review> {
    const response: AxiosResponse<Review> = await this.api.get(
      `/restaurants/${restaurantId}/reviews/${reviewId}`,
    );
    return response.data;
  }

  public async createReview(
    restaurantId: string,
    request: CreateReviewRequest,
  ): Promise<Review> {
    const response: AxiosResponse<Review> = await this.api.post(
      `/restaurants/${restaurantId}/reviews`,
      request,
    );
    return response.data;
  }

  public async updateReview(
    restaurantId: string,
    reviewId: string,
    request: UpdateReviewRequest,
  ): Promise<void> {
    await this.api.put(
      `/restaurants/${restaurantId}/reviews/${reviewId}`,
      request,
    );
  }

  public async deleteReview(
    restaurantId: string,
    reviewId: string,
  ): Promise<void> {
    await this.api.delete(`/restaurants/${restaurantId}/reviews/${reviewId}`);
  }

  // Photo endpoint implementation
  public async uploadPhoto(file: File, caption?: string): Promise<Photo> {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) {
      formData.append("caption", caption);
    }

    const response: AxiosResponse<Photo> = await this.api.post(
      "/photos",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  }
}