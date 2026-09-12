package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.CityDTO;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.CityService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/cities")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class CityResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private CityService cityService;

    @GET
    public Response getAll(@QueryParam("active") Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return Response.ok(cityService.getActive()).build();
        }
        return Response.ok(cityService.getAll()).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@Valid CityDTO dto) {
        ProfessorResource.requireRole(currentUser, Role.ADMIN);
        return Response.status(Response.Status.CREATED).entity(cityService.create(dto)).build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(@PathParam("id") Long id, @Valid CityDTO dto) {
        ProfessorResource.requireRole(currentUser, Role.ADMIN);
        return Response.ok(cityService.update(id, dto)).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        ProfessorResource.requireRole(currentUser, Role.ADMIN);
        cityService.delete(id);
        return Response.noContent().build();
    }
}