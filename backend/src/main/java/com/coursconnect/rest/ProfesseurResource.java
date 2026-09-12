package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.MatiereDTO;
import com.coursconnect.dto.NiveauDTO;
import com.coursconnect.dto.PagedResult;
import com.coursconnect.dto.ProfesseurCreateDTO;
import com.coursconnect.dto.ProfesseurDTO;
import com.coursconnect.dto.ProfessorProfileDTO;
import com.coursconnect.dto.SearchCriteria;
import com.coursconnect.dto.UpdateProfessorDTO;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.ProfesseurService;

import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.validation.Valid;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;
import java.util.List;

@Path("/professeurs")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class ProfesseurResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private ProfesseurService professeurService;

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        ProfesseurDTO dto = professeurService.findById(id);
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }

    @GET
    public Response search(
            @QueryParam("ville") String ville,
            @QueryParam("matiereId") Long matiereId,
            @QueryParam("niveauId") Long niveauId,
            @QueryParam("tarifMin") BigDecimal tarifMin,
            @QueryParam("tarifMax") BigDecimal tarifMax,
            @QueryParam("page") Integer page,
            @QueryParam("taille") Integer taille) {

        SearchCriteria criteria = new SearchCriteria();
        criteria.setVille(ville);
        criteria.setMatiereId(matiereId);
        criteria.setNiveauId(niveauId);
        criteria.setTarifMin(tarifMin);
        criteria.setTarifMax(tarifMax);
        criteria.setPage(page != null ? page : 0);
        criteria.setTaille(taille != null ? taille : 20);

        PagedResult<ProfesseurDTO> result = professeurService.search(criteria);
        return Response.ok(result).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response create(@Valid ProfesseurCreateDTO dto) {
        User user = currentUser != null ? currentUser.getUser() : null;
        if (user == null || user.getRole() != Role.ADMIN) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\": \"Réservé aux administrateurs\"}").build();
        }
        try {
            ProfesseurDTO created = professeurService.create(dto);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Données invalides\"}").build();
        }
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response update(@PathParam("id") Long id, @Valid ProfesseurCreateDTO dto) {
        User user = currentUser != null ? currentUser.getUser() : null;
        if (user == null || user.getRole() != Role.ADMIN) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\": \"Réservé aux administrateurs\"}").build();
        }
        try {
            ProfesseurDTO updated = professeurService.update(id, dto);
            if (updated == null) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            return Response.ok(updated).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Données invalides\"}").build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        User user = currentUser != null ? currentUser.getUser() : null;
        if (user == null || user.getRole() != Role.ADMIN) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\": \"Réservé aux administrateurs\"}").build();
        }
        professeurService.delete(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/me")
    public Response getMyProfile() {
        User user = currentUser != null ? currentUser.getUser() : null;
        if (user == null || user.getRole() != Role.PROFESSOR) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\": \"Accès réservé aux professeurs\"}").build();
        }
        ProfessorProfileDTO dto = professeurService.getProfessorProfile(user.getId());
        if (dto == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(dto).build();
    }

    @PUT
    @Path("/me")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateMyProfile(@Valid UpdateProfessorDTO dto) {
        User user = currentUser != null ? currentUser.getUser() : null;
        if (user == null || user.getRole() != Role.PROFESSOR) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"error\": \"Accès réservé aux professeurs\"}").build();
        }
        ProfessorProfileDTO updated = professeurService.updateProfessorProfile(user.getId(), dto);
        if (updated == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(updated).build();
    }
}