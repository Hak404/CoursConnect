package com.coursconnect.service;

import com.coursconnect.dto.*;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.Professor;
import com.coursconnect.model.User;
import com.coursconnect.model.enums.Role;
import com.coursconnect.model.enums.BookingStatus;
import com.coursconnect.repository.*;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class AdminService {

    @EJB
    private UserRepository userRepository;

    @EJB
    private ProfessorRepository professorRepository;

    @EJB
    private OfferRepository offerRepository;

    @EJB
    private BookingRepository bookingRepository;

    @EJB
    private ReviewRepository reviewRepository;

    @EJB
    private StudentRepository studentRepository;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserDTO).collect(Collectors.toList());
    }

    public List<ProfessorProfileDTO> getAllProfessors() {
        return professorRepository.findAll().stream()
                .map(this::toProfileDTO).collect(Collectors.toList());
    }

    public UserDTO toggleUserStatus(Long adminUserId, Long userId, boolean enabled) {
        User user = userRepository.findById(userId);
        if (user == null) throw new NotFoundException("Utilisateur non trouvé");
        if (user.getId().equals(adminUserId)) {
            throw new com.coursconnect.exception.ConflictException("Impossible de modifier votre propre compte");
        }
        user.setEnabled(enabled);
        user = userRepository.save(user);
        return toUserDTO(user);
    }

    public ProfessorProfileDTO verifyProfessor(Long professorId) {
        Professor professor = professorRepository.findById(professorId);
        if (professor == null) throw new NotFoundException("Professeur non trouvé");
        professor.setVerified(true);
        professor = professorRepository.save(professor);
        return toProfileDTO(professor);
    }

    public AdminStatsDTO getStats() {
        AdminStatsDTO dto = new AdminStatsDTO();
        dto.setTotalUsers(userRepository.countAll());
        dto.setTotalStudents(userRepository.countByRole(Role.STUDENT));
        dto.setTotalProfessors(userRepository.countByRole(Role.PROFESSOR));
        UserRepository.BooleanCountResult verified = userRepository.countProfessorsVerified();
        dto.setTotalVerified(verified != null ? verified.trueCount : 0);
        dto.setTotalOffers(offerRepository.countAll());
        dto.setTotalBookings(bookingRepository.findAll().size());
        dto.setTotalPendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING));
        dto.setTotalReviews(reviewRepository.findAll().size());
        return dto;
    }

    public List<ProfileBookingDTO> getProfileBookings() {
        return bookingRepository.findAll().stream()
                .map(b -> ProfileBookingDTO.fromEntity(b))
                .collect(Collectors.toList());
    }

    private UserDTO toUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setEnabled(user.isEnabled());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    private ProfessorProfileDTO toProfileDTO(Professor entity) {
        ProfessorProfileDTO dto = new ProfessorProfileDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setFirstName(entity.getUser() != null ? entity.getUser().getFirstName() : "");
        dto.setLastName(entity.getUser() != null ? entity.getUser().getLastName() : "");
        dto.setEmail(entity.getUser() != null ? entity.getUser().getEmail() : "");
        dto.setPhone(entity.getUser() != null ? entity.getUser().getPhone() : "");
        if (entity.getCity() != null) {
            dto.setCityId(entity.getCity().getId());
            dto.setCityName(entity.getCity().getName());
        }
        dto.setProfilePhoto(entity.getProfilePhoto());
        dto.setBio(entity.getBio());
        dto.setExperienceYears(entity.getExperienceYears());
        dto.setVerified(entity.isVerified());
        dto.setAverageRating(entity.getAverageRating());
        dto.setTotalReviews(entity.getTotalReviews());
        dto.setSubjects(entity.getSubjects() != null ? entity.getSubjects().stream()
                .map(s -> new SubjectDTO(s.getId(), s.getName(), s.getDescription(), s.isActive()))
                .collect(Collectors.toList()) : List.of());
        dto.setLevels(entity.getLevels() != null ? entity.getLevels().stream()
                .map(l -> new LevelDTO(l.getId(), l.getName(), l.getDescription(), l.getDisplayOrder(), l.isActive()))
                .collect(Collectors.toList()) : List.of());
        return dto;
    }
}