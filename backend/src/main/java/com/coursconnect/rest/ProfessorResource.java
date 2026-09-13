package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.dto.*;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.service.BookingService;
import com.coursconnect.service.OfferService;
import com.coursconnect.service.AvailabilityService;
import com.coursconnect.service.ProfessorService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.math.BigDecimal;

@Path("/professors")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class ProfessorResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private ProfessorService professorService;

    @EJB
    private OfferService offerService;

    @EJB
    private AvailabilityService availabilityService;

    @EJB
    private BookingService bookingService;

    @GET
    public Response search(
            @QueryParam("cityId") Long cityId,
            @QueryParam("city") String city,
            @QueryParam("search") String search,
            @QueryParam("subjectId") Long subjectId,
            @QueryParam("levelId") Long levelId,
            @QueryParam("minPrice") BigDecimal minPrice,
            @QueryParam("maxPrice") BigDecimal maxPrice,
            @QueryParam("minRating") BigDecimal minRating,
            @QueryParam("courseType") String courseType,
            @QueryParam("verifiedOnly") Boolean verifiedOnly,
            @QueryParam("sortBy") String sortBy,
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size) {

        SearchCriteriaDTO criteria = new SearchCriteriaDTO();
        criteria.setCityId(cityId);
        criteria.setCityName(city);
        criteria.setSearch(search);
        criteria.setSubjectId(subjectId);
        criteria.setLevelId(levelId);
        criteria.setMinPrice(minPrice);
        criteria.setMaxPrice(maxPrice);
        criteria.setMinRating(minRating);
        criteria.setCourseType(courseType);
        criteria.setVerifiedOnly(verifiedOnly);
        criteria.setSortBy(sortBy != null ? sortBy : "rating");
        criteria.setPage(page != null ? page : 0);
        criteria.setSize(size != null ? size : 12);

        return Response.ok(professorService.search(criteria)).build();
    }

    @GET
    @Path("/{id}")
    public Response findById(@PathParam("id") Long id) {
        return Response.ok(professorService.getPublicDetail(id)).build();
    }

    @GET
    @Path("/{id}/reviews")
    public Response getReviews(@PathParam("id") Long id) {
        return Response.ok(professorService.getPublicDetail(id).getReviews()).build();
    }

    @GET
    @Path("/{id}/offers")
    public Response getOffers(@PathParam("id") Long id) {
        return Response.ok(professorService.getPublicDetail(id).getOffers()).build();
    }

    @GET
    @Path("/{id}/availability")
    public Response getAvailability(@PathParam("id") Long id) {
        return Response.ok(professorService.getPublicDetail(id).getAvailabilities()).build();
    }

    @GET
    @Path("/me")
    public Response getMyProfile() {
        User user = requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(professorService.getMyProfile(user.getId())).build();
    }

    @PUT
    @Path("/me")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateMyProfile(@jakarta.validation.Valid UpdateProfessorDTO dto) {
        User user = requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(professorService.updateMyProfile(user.getId(), dto)).build();
    }

    @GET
    @Path("/me/bookings")
    public Response getMyBookings() {
        User user = requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(bookingService.getProfessorBookings(user.getId())).build();
    }

    @GET
    @Path("/me/offers")
    public Response getMyOffers() {
        User user = requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(offerService.getMyOffers(user.getId())).build();
    }

    @POST
    @Path("/me/offers")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createOffer(@jakarta.validation.Valid OfferDTO dto) {
        User user = requireRole(currentUser, Role.PROFESSOR);
        return Response.status(Response.Status.CREATED)
                .entity(offerService.create(user.getId(), dto)).build();
    }

    @PUT
    @Path("/me/offers/{offerId}")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateOffer(@PathParam("offerId") Long offerId,
                                @jakarta.validation.Valid OfferDTO dto) {
        User user = requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(offerService.update(user.getId(), offerId, dto)).build();
    }

    @DELETE
    @Path("/me/offers/{offerId}")
    public Response deleteOffer(@PathParam("offerId") Long offerId) {
        User user = requireRole(currentUser, Role.PROFESSOR);
        offerService.delete(user.getId(), offerId);
        return Response.noContent().build();
    }

    @GET
    @Path("/me/availability")
    public Response getMyAvailability() {
        User user = requireRole(currentUser, Role.PROFESSOR);
        return Response.ok(availabilityService.getMyAvailability(user.getId())).build();
    }

    @POST
    @Path("/me/availability")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response addAvailability(@jakarta.validation.Valid AvailabilityDTO dto) {
        User user = requireRole(currentUser, Role.PROFESSOR);
        return Response.status(Response.Status.CREATED)
                .entity(availabilityService.create(user.getId(), dto)).build();
    }

    @DELETE
    @Path("/me/availability/{availabilityId}")
    public Response deleteAvailability(@PathParam("availabilityId") Long availabilityId) {
        User user = requireRole(currentUser, Role.PROFESSOR);
        availabilityService.delete(user.getId(), availabilityId);
        return Response.noContent().build();
    }

    static User requireRole(CurrentUserHolder currentUser, Role role) {
        User user = currentUser != null ? currentUser.getUser() : null;
        if (user == null || user.getRole() != role) {
            throw new com.coursconnect.exception.ForbiddenException(
                    "Accès réservé aux " + (role == Role.ADMIN ? "administrateurs"
                            : role == Role.PROFESSOR ? "professeurs" : "étudiants"));
        }
        return user;
    }

    static User requireAuth(CurrentUserHolder currentUser) {
        User user = currentUser != null ? currentUser.getUser() : null;
        if (user == null) {
            throw new com.coursconnect.exception.UnauthorizedException("Authentification requise");
        }
        return user;
    }
}