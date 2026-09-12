package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.BookingAcceptDTO;
import com.coursconnect.dto.BookingCreateDTO;
import com.coursconnect.dto.BookingRejectDTO;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.BookingService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/bookings")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class BookingResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private BookingService bookingService;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@Valid BookingCreateDTO dto) {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        return Response.status(Response.Status.CREATED)
                .entity(bookingService.create(user.getId(), dto)).build();
    }

    @PUT
    @Path("/{id}/accept")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response accept(@PathParam("id") Long id, BookingAcceptDTO dto) {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(bookingService.accept(user.getId(), id, dto)).build();
    }

    @PUT
    @Path("/{id}/reject")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response reject(@PathParam("id") Long id, @Valid BookingRejectDTO dto) {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        String reason = dto != null ? dto.getReason() : null;
        return Response.ok(bookingService.reject(user.getId(), id, reason)).build();
    }

    @PUT
    @Path("/{id}/cancel")
    public Response cancel(@PathParam("id") Long id) {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        return Response.ok(bookingService.cancel(user.getId(), id)).build();
    }

    @PUT
    @Path("/{id}/complete")
    public Response complete(@PathParam("id") Long id) {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(bookingService.complete(user.getId(), id)).build();
    }

    @PUT
    @Path("/{id}/payment/mark-paid")
    public Response markPaid(@PathParam("id") Long id) {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(bookingService.markPaid(user.getId(), id)).build();
    }
}