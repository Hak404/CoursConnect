package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.*;
import com.coursconnect.model.User;
import com.coursconnect.service.AuthService;

import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private AuthService authService;

    @POST
    @Path("/register/student")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerStudent(@Valid RegisterStudentDTO dto) {
        AuthResponseDTO response = authService.registerStudent(dto);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @POST
    @Path("/register/professor")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerProfessor(@Valid RegisterProfessorDTO dto) {
        AuthResponseDTO response = authService.registerProfessor(dto);
        return Response.status(Response.Status.CREATED).entity(response).build();
    }

    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response login(@Valid LoginDTO dto) {
        AuthResponseDTO response = authService.login(dto);
        return Response.ok(response).build();
    }

    @POST
    @Path("/logout")
    public Response logout(@HeaderParam("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        if (token != null) {
            authService.logout(token);
        }
        return Response.ok("{\"message\": \"Déconnexion réussie\"}").build();
    }

    @GET
    @Path("/me")
    public Response me() {
        User user = currentUser != null ? currentUser.getUser() : null;
        if (user == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setEnabled(user.isEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        return Response.ok(dto).build();
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}