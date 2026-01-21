package com.hotelbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private PaginationMetadata pagination;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data, null);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static <T> ApiResponse<T> success(T data, PaginationMetadata pagination) {
        return new ApiResponse<>(true, "Success", data, pagination);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, null);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PaginationMetadata {
        private int page;
        private int limit;
        private long total;
        private int pages;
    }
}
