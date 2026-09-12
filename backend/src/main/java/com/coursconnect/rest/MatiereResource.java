package com.coursconnect.rest;

import com.coursconnect.dto.MatiereDTO;
import com.coursconnect.service.ProfesseurService;

import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/matieres")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class MatiereResource {

    @EJB
    private ProfesseurService professeurService;

    @GET
    public Response findAll() {
        List<MatiereDTO> matieres = professeurService.getAllMatieres();
        return Response.ok(matieres).build();
    }
}
