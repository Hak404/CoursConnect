package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.*;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.AdminService;
import com.coursconnect.service.ReviewService;

import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/admin")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class AdminResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private AdminService adminService;

    @EJB
    private ReviewService reviewService;

    @GET
    @Path("/stats")
    public Response getStats() {
        requireAdmin(currentUser);
        return Response.ok(adminService.getStats()).build();
    }

    @GET
    @Path("/users")
    public Response getAllUsers() {
        requireAdmin(currentUser);
        return Response.ok(adminService.getAllUsers()).build();
    }

    @GET
    @Path("/professors")
    public Response getAllProfessors() {
        requireAdmin(currentUser);
        return Response.ok(adminService.getAllProfessors()).build();
    }

    @GET
    @Path("/bookings")
    public Response getAllBookings() {
        requireAdmin(currentUser);
        return Response.ok(adminService.getProfileBookings()).build();
    }

    @GET
    @Path("/reviews")
    public Response getAllReviews() {
        requireAdmin(currentUser);
        return Response.ok(reviewService.getProfessorReviewsForAdmin()).build();
    }

    @DELETE
    @Path("/reviews/{id}")
    public Response deleteReview(@PathParam("id") Long id) {
        requireAdmin(currentUser);
        reviewService.deleteForAdmin(id);
        return Response.noContent().build();
    }

    @PUT
    @Path("/users/{id}/status")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response toggleUserStatus(@PathParam("id") Long userId, @Valid UpdateUserStatusDTO dto) {
        User admin = requireAdmin(currentUser);
        return Response.ok(adminService.toggleUserStatus(admin.getId(), userId, dto.isEnabled())).build();
    }

    @PUT
    @Path("/professors/{id}/verify")
    public Response verifyProfessor(@PathParam("id") Long professeurId) {
        requireAdmin(currentUser);
        return Response.ok(adminService.verifyProfessor(professeurId)).build();
    }

    private User requireAdmin(CurrentUserHolder currentUser) {
        User user = currentUser != null ? currentUser.getUser() : null;
        if (user == null || user.getRole() != Role.ADMIN) {
            throw new com.coursconnect.exception.ForbiddenException(
                    "Accès réservé aux administrateurs");
        }
        return user;
    }
}