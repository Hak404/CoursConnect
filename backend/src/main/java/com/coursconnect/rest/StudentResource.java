package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.StudentProfileDTO;
import com.coursconnect.dto.UpdateStudentDTO;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.BookingService;
import com.coursconnect.service.StudentService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/students")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class StudentResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private StudentService studentService;

    @EJB
    private BookingService bookingService;

    @GET
    @Path("/me")
    public Response getMyProfile() {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        return Response.ok(studentService.getProfile(user.getId())).build();
    }

    @PUT
    @Path("/me")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateMyProfile(@Valid UpdateStudentDTO dto) {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        return Response.ok(studentService.updateProfile(user.getId(), dto)).build();
    }

    @GET
    @Path("/me/bookings")
    public Response getMyBookings() {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        return Response.ok(bookingService.getStudentBookings(user.getId())).build();
    }
}