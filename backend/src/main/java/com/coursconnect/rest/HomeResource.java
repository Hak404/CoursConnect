package com.coursconnect.rest;

import com.coursconnect.service.ProfessorService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/home")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class HomeResource {

    @EJB
    private ProfessorService professorService;

    @GET
    public Response getHomePage() {
        return Response.ok(professorService.getHomePageData()).build();
    }
}