package com.coursconnect.rest;

import com.coursconnect.exception.ConflictException;
import com.coursconnect.exception.ForbiddenException;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.exception.UnauthorizedException;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.logging.Level;
import java.util.logging.Logger;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class.getName());

    @Override
    public Response toResponse(Throwable exception) {
        if (exception instanceof NotFoundException) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"error\": \"" + escapeJson(exception.getMessage()) + "\"}")
                    .build();
        }
        if (exception instanceof ConflictException) {
            return Response.status(Response.Status.CONFLICT)
                    .entity("{\"error\": \"" + escapeJson(exception.getMessage()) + "\"}")
                    .build();
        }
        if (exception instanceof ForbiddenException) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\": \"" + escapeJson(exception.getMessage()) + "\"}")
                    .build();
        }
        if (exception instanceof UnauthorizedException) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\": \"" + escapeJson(exception.getMessage()) + "\"}")
                    .build();
        }
        if (exception instanceof ConstraintViolationException cve) {
            String errors = cve.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Données invalides");
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Données invalides\", \"details\": \"" + escapeJson(errors) + "\"}")
                    .build();
        }
        if (exception instanceof ValidationException) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Données invalides\"}")
                    .build();
        }
        if (exception instanceof WebApplicationException wae) {
            int status = wae.getResponse() != null
                    ? wae.getResponse().getStatus()
                    : Response.Status.INTERNAL_SERVER_ERROR.getStatusCode();
            String message = switch (status) {
                case 404 -> "Ressource introuvable";
                case 405 -> "Méthode non autorisée";
                case 406 -> "Format de réponse non supporté";
                case 415 -> "Format de requête non supporté";
                case 401 -> "Authentification nécessaire";
                case 403 -> "Accès refusé";
                default -> "Requête invalide";
            };
            return Response.status(status)
                    .entity("{\"error\": \"" + message + "\"}")
                    .build();
        }
        if (exception instanceof IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Données invalides\"}")
                    .build();
        }

        LOG.log(Level.SEVERE, "Unhandled exception", exception);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Erreur interne du serveur\"}")
                .build();
    }

    private String escapeJson(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}