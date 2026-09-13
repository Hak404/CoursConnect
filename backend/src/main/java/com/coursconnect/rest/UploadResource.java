package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.ProfessorProfileDTO;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.PhotoStorageService;
import com.coursconnect.service.ProfessorService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import static com.coursconnect.service.PhotoStorageService.URL_PREFIX;

/**
 * Profile photo upload. Photos are public by design (profiles are public pages),
 * but the uploaded bytes go through strict validation (magic bytes, size).
 * The meeting links / locations are MODELED on offer/booking and never here.
 */
@Path("/uploads")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class UploadResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private PhotoStorageService photoStorage;

    @EJB
    private ProfessorService professorService;

    @PUT
    @Path("/profiles/me")
    @Consumes({"application/octet-stream", "image/jpeg", "image/jpg", "image/png", "image/webp"})
    public Response uploadProfilePhoto(@HeaderParam("Content-Type") String contentType, byte[] body) {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        Long professorId = professorService.findProfessorByUserId(user.getId()).getId();
        String url = photoStorage.saveProfessorPhoto(professorId, body, contentType);
        ProfessorProfileDTO dto = professorService.updateProfilePhoto(user.getId(), url);
        return Response.ok(dto).build();
    }

    @DELETE
    @Path("/profiles/me")
    public Response deleteProfilePhoto() {
        User user = ProfessorResource.requireRole(currentUser, Role.PROFESSOR);
        Long professorId = professorService.findProfessorByUserId(user.getId()).getId();
        photoStorage.deleteProfessorPhotos(professorId);
        ProfessorProfileDTO dto = professorService.clearProfilePhoto(user.getId());
        return Response.ok(dto).build();
    }

    @GET
    @Path("/profiles/{fileName}")
    @Produces({"image/jpeg", "image/png", "image/webp"})
    public Response getProfilePhoto(@PathParam("fileName") String fileName) {
        byte[] data = photoStorage.readPublic(fileName);
        if (data == null) {
            throw new NotFoundException("Image introuvable");
        }
        return Response.ok(data, photoStorage.mediaTypeOf(fileName)).build();
    }

    static boolean isManagedPhotoUrl(String value) {
        return value != null && value.startsWith(URL_PREFIX);
    }
}