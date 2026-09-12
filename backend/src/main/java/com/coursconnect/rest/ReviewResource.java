package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.ReviewCreateDTO;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.ReviewService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("/reviews")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class ReviewResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private ReviewService reviewService;

    @POST
    @Path("/bookings/{bookingId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@PathParam("bookingId") Long bookingId,
                           @Valid ReviewCreateDTO dto) {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        return Response.status(Response.Status.CREATED)
                .entity(reviewService.create(user.getId(), bookingId, dto)).build();
    }

    @GET
    @Path("/me")
    public Response getMyReviews() {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(reviewService.getMyReviews(user.getId())).build();
    }

    @GET
    @Path("/bookings/{bookingId}/exists")
    public Response existsForBooking(@PathParam("bookingId") Long bookingId) {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        boolean exists = reviewService.existsForBooking(user.getId(), bookingId);
        return Response.ok(Map.of("exists", exists)).build();
    }
}