package com.coursconnect.rest;

import com.coursconnect.dto.NiveauDTO;
import com.coursconnect.service.ProfesseurService;

import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/niveaux")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class NiveauResource {

    @EJB
    private ProfesseurService professeurService;

    @GET
    public Response findAll() {
        List<NiveauDTO> niveaux = professeurService.getAllNiveaux();
        return Response.ok(niveaux).build();
    }
}
