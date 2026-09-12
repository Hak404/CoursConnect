package com.coursconnect.config;

import com.coursconnect.model.User;
import com.coursconnect.model.UserSession;
import com.coursconnect.repository.UserRepository;

import jakarta.ejb.EJB;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.PreMatching;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import java.security.Principal;
import java.util.List;

@Provider
@PreMatching
public class AuthFilter implements ContainerRequestFilter {

    private static final String ALLOWED_ORIGINS =
            System.getenv().getOrDefault("CORS_ALLOWED_ORIGINS", "http://localhost:5173");

    private static final List<String> PUBLIC_PATHS = List.of(
        "/cities",
        "/subjects",
        "/niveaux",
        "/matieres",
        "/levels",
        "/home"
    );

    @EJB
    private UserRepository userRepository;

    @Inject
    private CurrentUserHolder currentUser;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();
        String method = requestContext.getMethod();

        // Handle CORS preflight OPTIONS directly (no matching JAX-RS @OPTIONS method exists)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            requestContext.abortWith(
                jakarta.ws.rs.core.Response.status(204)
                    .header("Access-Control-Allow-Origin", ALLOWED_ORIGINS)
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Max-Age", "3600")
                    .build());
            return;
        }

        // Check if path is public for this method
        if (isPublicPath(path, method)) {
            return;
        }

        // Extract token from Authorization header
        String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            requestContext.abortWith(
                jakarta.ws.rs.core.Response.status(401)
                    .entity("{\"error\": \"Token d'authentification requis\"}")
                    .build());
            return;
        }

        String token = authHeader.substring(7);
        UserSession session = userRepository.findValidSession(token);

        if (session == null) {
            requestContext.abortWith(
                jakarta.ws.rs.core.Response.status(401)
                    .entity("{\"error\": \"Token invalide ou expiré\"}")
                    .build());
            return;
        }

        // Set the authenticated user as request attribute
        User user = session.getUser();

        // Reject disabled accounts even when the session token is still valid
        if (!user.isEnabled()) {
            requestContext.abortWith(
                jakarta.ws.rs.core.Response.status(401)
                    .entity("{\"error\": \"Compte désactivé\"}")
                    .build());
            return;
        }
        requestContext.setProperty("currentUser", user);
        requestContext.setProperty("currentUserId", user.getId());
        requestContext.setProperty("currentUserRole", user.getRole().name());
        currentUser.setUser(user);

        // Set SecurityContext
        requestContext.setSecurityContext(new SecurityContext() {
            @Override
            public Principal getUserPrincipal() {
                return () -> user.getId().toString();
            }

            @Override
            public boolean isUserInRole(String role) {
                return user.getRole().name().equals(role);
            }

            @Override
            public boolean isSecure() {
                return true;
            }

            @Override
            public String getAuthenticationScheme() {
                return "Bearer";
            }
        });
    }

    private boolean isPublicPath(String path, String method) {
        // POST endpoints that must stay anonymous: login + registration
        if ("POST".equalsIgnoreCase(method)) {
            return path.equals("/auth/login")
                    || path.equals("/auth/register/student")
                    || path.equals("/auth/register/professor");
        }

        if (!"GET".equalsIgnoreCase(method)) {
            return false;
        }

        for (String publicPath : PUBLIC_PATHS) {
            if (path.equals(publicPath) || path.startsWith(publicPath + "/")) {
                return true;
            }
        }

        // /professeurs search paths (Phase 1 legacy, public GET), except /professeurs/me*
        if (path.equals("/professeurs") || path.startsWith("/professeurs/")) {
            if (path.equals("/professeurs")) {
                return true;
            }
            String segment = path.substring("/professeurs/".length());
            String first = segment.contains("/") ? segment.substring(0, segment.indexOf('/')) : segment;
            if (first.equals("me")) {
                return false;
            }
            return true;
        }

        // /professors/{id}, /professors/{id}/reviews|offers|availability are public
        // but NOT /professors/me* (protected) and NOT /professors (empty with /me)
        if (path.equals("/professors") || path.startsWith("/professors/")) {
            // "/professors" alone is the search endpoint (public)
            if (path.equals("/professors")) {
                return true;
            }
            String segment = path.substring("/professors/".length());
            String first = segment.contains("/") ? segment.substring(0, segment.indexOf('/')) : segment;
            // "me" and "me/..." are private
            if (first.equals("me")) {
                return false;
            }
            // numeric professor id => public
            try {
                Long.parseLong(first);
                return true;
            } catch (NumberFormatException e) {
                return false;
            }
        }

        return false;
    }
}