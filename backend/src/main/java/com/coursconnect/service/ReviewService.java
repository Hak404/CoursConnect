package com.coursconnect.service;

import com.coursconnect.dto.ReviewCreateDTO;
import com.coursconnect.dto.ReviewResponseDTO;
import com.coursconnect.exception.ConflictException;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.Booking;
import com.coursconnect.model.Professor;
import com.coursconnect.model.Review;
import com.coursconnect.model.Student;
import com.coursconnect.model.enums.BookingStatus;
import com.coursconnect.repository.BookingRepository;
import com.coursconnect.repository.ProfessorRepository;
import com.coursconnect.repository.ReviewRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class ReviewService {

    @EJB
    private ReviewRepository reviewRepository;

    @EJB
    private BookingRepository bookingRepository;

    @EJB
    private ProfessorRepository professorRepository;

    @EJB
    private StudentService studentService;

    @EJB
    private ProfessorService professorService;

    public ReviewResponseDTO create(Long studentUserId, Long bookingId, ReviewCreateDTO dto) {
        Student student = studentService.findStudentByUserId(studentUserId);
        if (student == null) throw new NotFoundException("Profil étudiant non trouvé");

        Booking booking = bookingRepository.findById(bookingId);
        if (booking == null || !booking.getStudent().getId().equals(student.getId())) {
            throw new NotFoundException("Réservation non trouvée");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ConflictException("Vous ne pouvez laisser un avis qu'après un cours terminé");
        }
        if (reviewRepository.findByBooking(booking) != null) {
            throw new ConflictException("Vous avez déjà laissé un avis pour ce cours");
        }
        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new com.coursconnect.exception.BadRequestException("La note doit être entre 1 et 5");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setStudent(booking.getStudent());
        review.setProfessor(booking.getProfessor());
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review = reviewRepository.save(review);

        professorRepository.updateRating(booking.getProfessor().getId());

        return toDTO(review);
    }

    public List<ReviewResponseDTO> getProfessorReviews(Long professorId) {
        return reviewRepository.findByProfessorId(professorId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<ReviewResponseDTO> getMyReviews(Long professorUserId) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        return reviewRepository.findByProfessor(professor).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<ReviewResponseDTO> getProfessorReviewsForAdmin() {
        return reviewRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public void deleteForAdmin(Long reviewId) {
        Review review = reviewRepository.findById(reviewId);
        if (review == null) throw new NotFoundException("Avis non trouvé");
        reviewRepository.delete(reviewId);
        professorRepository.updateRating(review.getProfessor().getId());
    }

    public boolean existsForBooking(Long studentUserId, Long bookingId) {
        Student student = studentService.findStudentByUserId(studentUserId);
        if (student == null) throw new NotFoundException("Profil étudiant non trouvé");
        Booking booking = bookingRepository.findById(bookingId);
        if (booking == null || !booking.getStudent().getId().equals(student.getId())) {
            throw new NotFoundException("Réservation non trouvée");
        }
        return reviewRepository.findByBooking(booking) != null;
    }

    private ReviewResponseDTO toDTO(Review review) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setId(review.getId());
        dto.setBookingId(review.getBooking().getId());
        dto.setStudentId(review.getStudent().getId());
        String lastName = review.getStudent().getUser().getLastName();
        dto.setStudentName(review.getStudent().getUser().getFirstName()
                + " " + (lastName != null && !lastName.isEmpty() ? lastName.charAt(0) + "." : ""));
        dto.setProfessorId(review.getProfessor().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}