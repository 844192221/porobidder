package com.porobidder.backend;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.porobidder.backend.auth.AuthInterceptor;
import com.porobidder.backend.vendor.VendorAuthInterceptor;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final VendorAuthInterceptor vendorAuthInterceptor;

    public WebConfig(AuthInterceptor authInterceptor, VendorAuthInterceptor vendorAuthInterceptor) {
        this.authInterceptor = authInterceptor;
        this.vendorAuthInterceptor = vendorAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(vendorAuthInterceptor)
            .addPathPatterns("/api/vendor/**");

        registry.addInterceptor(authInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/vendor/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOriginPatterns("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
