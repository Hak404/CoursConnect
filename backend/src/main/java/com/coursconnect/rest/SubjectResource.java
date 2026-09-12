package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.SubjectDTO;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.SubjectService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/subjects")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class SubjectResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private SubjectService subjectService;

    @GET
    public Response getAll(@QueryParam("active") Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return Response.ok(subjectService.getActive()).build();
        }
        return Response.ok(subjectService.getAll()).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@Valid SubjectDTO dto) {
        ProfessorResource.requireRole(currentUser, Role.ADMIN);
        return Response.status(Response.Status.CREATED).entity(subjectService.create(dto)).build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(@PathParam("id") Long id, @Valid SubjectDTO dto) {
        ProfessorResource.requireRole(currentUser, Role.ADMIN);
        return Response.ok(subjectService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        ProfessorResource.requireRole(currentUser, Role.ADMIN);
        subjectService.delete(id);
        return Response.noContent().build();
    }
}