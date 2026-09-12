package com.coursconnect.config;

import com.coursconnect.rest.*;
import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;
import java.util.Set;

@ApplicationPath("/api")
public class ApplicationConfig extends Application {

    @Override
    public Set<Class<?>> getClasses() {
        return Set.of(
                AuthFilter.class,
                CorsFilter.class,
                GlobalExceptionMapper.class,
                JacksonConfig.class,
                AuthResource.class,
                AdminResource.class,
                BookingResource.class,
                CityResource.class,
                HomeResource.class,
                LevelResource.class,
                MatiereResource.class,
                NotificationResource.class,
                NiveauResource.class,
                ProfessorResource.class,
                ProfesseurResource.class,
                PriceProposalResource.class,
                ReviewResource.class,
                StudentResource.class,
                SubjectResource.class
        );
    }
}
