package com.coursconnect.rest;

import com.coursconnect.config.CurrentUserHolder;
import com.coursconnect.model.User;
import com.coursconnect.service.NotificationService;
import jakarta.ejb.EJB;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/notifications")
@RequestScoped
@Produces(MediaType.APPLICATION_JSON)
public class NotificationResource {

    @Inject
    private CurrentUserHolder currentUser;

    @EJB
    private NotificationService notificationService;

    @GET
    public Response getMine() {
        User user = ProfessorResource.requireAuth(currentUser);
        return Response.ok(notificationService.getForUser(user.getId())).build();
    }

    @GET
    @Path("/unread-count")
    public Response getUnreadCount() {
        User user = ProfessorResource.requireAuth(currentUser);
        return Response.ok(
                "{\"count\": " + notificationService.countUnread(user.getId()) + "}").build();
    }

    @PUT
    @Path("/read-all")
    public Response markAllRead() {
        User user = ProfessorResource.requireAuth(currentUser);
        notificationService.markAllRead(user.getId());
        return Response.ok("{\"message\": \"Notifications marquées comme lues\"}").build();
    }
}