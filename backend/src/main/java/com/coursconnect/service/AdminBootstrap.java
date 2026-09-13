package com.coursconnect.service;

import com.coursconnect.config.PasswordUtil;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.repository.UserRepository;

import jakarta.annotation.PostConstruct;
import jakarta.ejb.EJB;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import java.util.Locale;

/**
 * Idempotent admin bootstrap driven by environment variables:
 *   ADMIN_EMAIL     - normalized (trim + lowercase) admin email
 *   ADMIN_PASSWORD  - initial / rotating password (PBKDF2 hashed, never stored in code)
 * No password is ever hardcoded: without ADMIN_PASSWORD the admin is never created,
 * and an existing account is only updated when the variables are provided.
 */
@Singleton
@Startup
public class AdminBootstrap {

    private static final java.util.logging.Logger LOG =
            java.util.logging.Logger.getLogger(AdminBootstrap.class.getName());

    @EJB
    private UserRepository userRepository;

    @PostConstruct
    public void ensureAdmin() {
        try {
            run();
        } catch (Exception e) {
            LOG.warning("AdminBootstrap: couldn't apply admin configuration: " + e.getMessage());
        }
    }

    private void run() {
        String email = env("ADMIN_EMAIL");
        String password = env("ADMIN_PASSWORD");
        if (email == null || email.isBlank()) {
            return;
        }
        String normalized = normalizeEmail(email);

        User user = userRepository.findByEmail(normalized);
        if (user == null) {
            if (password == null || password.isBlank()) {
                LOG.info("AdminBootstrap: ADMIN_EMAIL set but ADMIN_PASSWORD is missing, skipping creation");
                return;
            }
            user = new User();
            user.setFirstName("Admin");
            user.setLastName("CoursConnect");
            user.setEmail(normalized);
            user.setRole(Role.ADMIN);
            user.setEnabled(true);
            user.setPasswordHash(PasswordUtil.hashPassword(password));
            userRepository.save(user);
            LOG.info("AdminBootstrap: admin account " + normalized + " created");
            return;
        }

        boolean changed = false;
        if (user.getRole() != Role.ADMIN) {
            user.setRole(Role.ADMIN);
            changed = true;
        }
        if (!user.isEnabled()) {
            user.setEnabled(true);
            changed = true;
        }
        if (password != null && !password.isBlank()) {
            user.setPasswordHash(PasswordUtil.hashPassword(password));
            changed = true;
        }
        if (changed) {
            userRepository.save(user);
            LOG.info("AdminBootstrap: admin account " + normalized + " updated");
        }
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private static String env(String name) {
        String value = System.getenv(name);
        return value == null ? null : value.trim();
    }
}