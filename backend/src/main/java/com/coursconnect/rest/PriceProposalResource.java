package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.PriceProposalCreateDTO;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.PriceProposalService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/proposals")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class PriceProposalResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private PriceProposalService priceProposalService;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@Valid PriceProposalCreateDTO dto) {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        return Response.status(Response.Status.CREATED)
                .entity(priceProposalService.create(user.getId(), dto)).build();
    }

    @GET
    @Path("/me")
    public Response getMine() {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        return Response.ok(priceProposalService.getMyProposals(user.getId())).build();
    }

    @GET
    @Path("/professor")
    public Response getProfessorProposals() {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(priceProposalService.getProfessorProposals(user.getId())).build();
    }

    @PUT
    @Path("/{id}/accept")
    public Response accept(@PathParam("id") Long id) {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(priceProposalService.accept(user.getId(), id)).build();
    }

    @PUT
    @Path("/{id}/reject")
    public Response reject(@PathParam("id") Long id) {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(priceProposalService.reject(user.getId(), id)).build();
    }

    @PUT
    @Path("/{id}/cancel")
    public Response cancel(@PathParam("id") Long id) {
        User user = ProfessorResource.requireRole(currentUser, Role.STUDENT);
        return Response.ok(priceProposalService.cancel(user.getId(), id)).build();
    }
}