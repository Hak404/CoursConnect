package com.coursconnect.service;

import com.coursconnect.dto.BookingAcceptDTO;
import com.coursconnect.dto.BookingCreateDTO;
import com.coursconnect.dto.BookingResponseDTO;
import com.coursconnect.dto.MeetingConfigDTO;
import com.coursconnect.exception.BadRequestException;
import com.coursconnect.exception.ConflictException;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.*;
import com.coursconnect.model.enums.BookingStatus;
import com.coursconnect.model.enums.DayOfWeek;
import com.coursconnect.model.enums.LocationType;
import com.coursconnect.model.enums.PaymentMethod;
import com.coursconnect.model.enums.PaymentStatus;
import com.coursconnect.model.enums.PriceProposalStatus;
import com.coursconnect.repository.AvailabilityRepository;
import com.coursconnect.repository.BookingRepository;
import com.coursconnect.repository.PriceProposalRepository;
import com.coursconnect.repository.ReviewRepository;
import com.coursconnect.util.UrlValidator;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.function.Function;
import java.util.stream.Collectors;

@Stateless
public class BookingService {

    @EJB
    private BookingRepository bookingRepository;

    @EJB
    private AvailabilityRepository availabilityRepository;

    @EJB
    private StudentService studentService;

    @EJB
    private ProfessorService professorService;

    @EJB
    private com.coursconnect.repository.OfferRepository offerRepository;

    @EJB
    private PriceProposalRepository priceProposalRepository;

    @EJB
    private ReviewRepository reviewRepository;

    @EJB
    private NotificationService notificationService;

    public BookingResponseDTO create(Long userId, BookingCreateDTO dto) {
        Student student = studentService.findStudentByUserId(userId);
        if (student == null) throw new NotFoundException("Profil étudiant non trouvé");

        Offer offer = offerRepository.findById(dto.getOfferId());
        if (offer == null) throw new NotFoundException("Offre non trouvée");
        if (!offer.isActive()) throw new ConflictException("Cette offre n'est plus disponible");

        Professor professor = offer.getProfessor();
        if (!professor.isActive()) throw new ConflictException("Ce professeur n'est plus actif");

        if (professor.getUser().getId().equals(userId)) {
            throw new ConflictException("Impossible de réserver votre propre offre");
        }

        BigDecimal negotiatedPrice = null;
        if (dto.getProposalId() != null) {
            PriceProposal proposal = priceProposalRepository.findById(dto.getProposalId());
            if (proposal == null || !proposal.getStudent().getId().equals(student.getId())) {
                throw new NotFoundException("Proposition non trouvée");
            }
            if (proposal.getStatus() != PriceProposalStatus.ACCEPTED) {
                throw new ConflictException("Cette proposition ne peut plus être utilisée");
            }
            if (!proposal.getOffer().getId().equals(offer.getId())) {
                throw new ConflictException("La proposition ne correspond pas à cette offre");
            }
            if (proposal.getBooking() != null) {
                throw new ConflictException("Cette proposition a déjà été utilisée");
            }
            negotiatedPrice = proposal.getProposedPrice();
        }

        if (dto.getScheduledAt() == null) {
            throw new ConflictException("La date du cours est requise");
        }

        if (dto.getScheduledAt().isBefore(LocalDateTime.now())) {
            throw new ConflictException("La date du cours doit être dans le futur");
        }

        if (dto.getPaymentMethod() == null) {
            throw new ConflictException("Le mode de paiement est requis");
        }
        if (dto.getPaymentMethod() == PaymentMethod.ONLINE) {
            throw new ConflictException("Le paiement en ligne n'est pas encore disponible. Veuillez choisir le paiement en espèces.");
        }

        DayOfWeek day = DayOfWeek.valueOf(dto.getScheduledAt().getDayOfWeek().name());
        LocalTime slotStart = dto.getScheduledAt().toLocalTime();
        LocalTime slotEnd = slotStart.plusMinutes(offer.getDurationMinutes());
        if (!availabilityRepository.isSlotCovered(professor, day, slotStart, slotEnd)) {
            throw new ConflictException("Ce créneau n'est pas dans les disponibilités du professeur");
        }

        int duration = offer.getDurationMinutes();
        if (bookingRepository.existsConflict(professor, dto.getScheduledAt(), duration)) {
            throw new ConflictException("Ce créneau est déjà réservé");
        }
        if (bookingRepository.existsConflictForStudent(student, dto.getScheduledAt(), duration)) {
            throw new ConflictException("Vous avez déjà une réservation sur ce créneau");
        }

        BigDecimal hourlyRate = negotiatedPrice != null ? negotiatedPrice : offer.getPrice();
        BigDecimal amount = hourlyRate
                .multiply(BigDecimal.valueOf(offer.getDurationMinutes()))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

        String meetingLocation = null;
        LocationType locationType = offer.getLocationType();
        if (locationType == LocationType.STUDENT_HOME) {
            if (isBlank(dto.getMeetingLocation())) {
                throw new ConflictException("Veuillez indiquer l'adresse du rendez-vous");
            }
            meetingLocation = dto.getMeetingLocation().trim();
        } else if (locationType == LocationType.OTHER) {
            if (isBlank(dto.getMeetingLocation())) {
                throw new ConflictException("Veuillez indiquer le lieu du cours");
            }
            meetingLocation = dto.getMeetingLocation().trim();
        } else if (locationType == LocationType.PROFESSOR_HOME) {
            meetingLocation = professor.getTeachingAddress();
        }

        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setProfessor(professor);
        booking.setOffer(offer);
        booking.setScheduledAt(dto.getScheduledAt());
        booking.setStudentMessage(dto.getStudentMessage());
        booking.setNegotiatedPrice(negotiatedPrice);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentMethod(PaymentMethod.CASH);
        booking.setPaymentStatus(PaymentStatus.UNPAID);
        booking.setAmount(amount);
        booking.setCurrency("DH");
        booking.setMeetingLocation(meetingLocation);
        booking = bookingRepository.save(booking);

        if (dto.getProposalId() != null) {
            PriceProposal proposal = priceProposalRepository.findById(dto.getProposalId());
            if (proposal != null && proposal.getBooking() == null) {
                proposal.setBooking(booking);
                priceProposalRepository.save(proposal);
            }
        }

        notificationService.notify(professor.getUser().getId(),
                "Nouvelle demande de réservation",
                student.getUser().getFirstName() + " " + student.getUser().getLastName()
                        + " a réservé votre offre : " + offer.getTitle(),
                "BOOKING", booking.getId());

        return toDTO(booking);
    }

    public List<BookingResponseDTO> getStudentBookings(Long userId) {
        Student student = studentService.findStudentByUserId(userId);
        if (student == null) throw new NotFoundException("Profil étudiant non trouvé");
        return bookingRepository.findByStudent(student).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getProfessorBookings(Long userId) {
        Professor professor = professorService.findProfessorByUserId(userId);
        return bookingRepository.findByProfessor(professor).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public BookingResponseDTO accept(Long professorUserId, Long bookingId, BookingAcceptDTO dto) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        Booking booking = getOwnedBooking(professor, bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Seules les réservations en attente peuvent être acceptées");
        }
        LocationType locationType = booking.getOffer().getLocationType();
        if (locationType == LocationType.PROFESSOR_HOME) {
            if (dto != null && !isBlank(dto.getMeetingLocation())) {
                booking.setMeetingLocation(dto.getMeetingLocation().trim());
            } else if (isBlank(booking.getMeetingLocation())) {
                booking.setMeetingLocation(professor.getTeachingAddress());
            }
        }
        // Online bookings are accepted without a meeting link: the professor
        // attaches it afterwards through PUT /bookings/{id}/meeting.
        booking.setStatus(BookingStatus.ACCEPTED);
        booking = bookingRepository.save(booking);

        notificationService.notify(booking.getStudent().getUser().getId(),
                "Réservation acceptée",
                "Votre réservation pour '" + booking.getOffer().getTitle() + "' a été acceptée.",
                "BOOKING", booking.getId());

        return toDTO(booking);
    }

    /**
     * Attaches or updates the meeting link of an online booking. Only the owning
     * professor may do it, and only once the booking is accepted (or completed).
     * The link must be a valid https URL; platform/instructions are optional.
     */
    public BookingResponseDTO saveMeetingConfig(Long professorUserId, Long bookingId, MeetingConfigDTO dto) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        Booking booking = getOwnedBooking(professor, bookingId);
        if (booking.getOffer().getLocationType() != LocationType.ONLINE) {
            throw new ConflictException("Cette réservation n'est pas un cours en ligne");
        }
        if (booking.getStatus() != BookingStatus.ACCEPTED
                && booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ConflictException("Le lien peut être ajouté une fois la réservation acceptée");
        }

        String link = dto != null ? UrlValidator.normalizedOrNull(dto.getMeetingLink()) : null;
        if (link != null && !UrlValidator.isHttpsUrl(link)) {
            throw new BadRequestException(
                    "Le lien de la réunion doit être une URL https valide (ex : https://zoom.us/j/...)");
        }
        booking.setMeetingLink(link);
        if (dto != null && dto.getMeetingPlatform() != null) {
            booking.setMeetingPlatform(UrlValidator.normalizedOrNull(dto.getMeetingPlatform()));
        }
        if (dto != null && dto.getMeetingInstructions() != null) {
            booking.setMeetingInstructions(UrlValidator.normalizedOrNull(dto.getMeetingInstructions()));
        }
        booking = bookingRepository.save(booking);

        notificationService.notify(booking.getStudent().getUser().getId(),
                isBlank(link) ? "Cours en ligne mis à jour"
                        : "Lien de votre cours en ligne",
                isBlank(link)
                        ? "Le professeur a mis à jour les informations de votre cours en ligne '" + booking.getOffer().getTitle() + "'."
                        : "Le professeur a ajouté le lien de votre cours en ligne '" + booking.getOffer().getTitle() + "'. Rendez-vous à la date prévue pour rejoindre la séance.",
                "BOOKING", booking.getId());

        return toDTO(booking);
    }

    /**
     * Removes the meeting link (and its instructions) from an online booking.
     */
    public BookingResponseDTO deleteMeetingConfig(Long professorUserId, Long bookingId) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        Booking booking = getOwnedBooking(professor, bookingId);
        if (booking.getOffer().getLocationType() != LocationType.ONLINE) {
            throw new ConflictException("Cette réservation n'est pas un cours en ligne");
        }
        if (booking.getStatus() != BookingStatus.ACCEPTED
                && booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ConflictException("Le lien ne peut être supprimé qu'après acceptation");
        }
        booking.setMeetingLink(null);
        booking.setMeetingInstructions(null);
        booking = bookingRepository.save(booking);
        return toDTO(booking);
    }

    /**
     * Returns a booking to one of its participants (student or owning professor).
     */
    public BookingResponseDTO getParticipantBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId);
        if (booking == null) {
            throw new NotFoundException("Réservation non trouvée");
        }
        boolean isStudent = booking.getStudent().getUser().getId().equals(userId);
        boolean isProfessor = booking.getProfessor().getUser().getId().equals(userId);
        if (!isStudent && !isProfessor) {
            throw new NotFoundException("Réservation non trouvée");
        }
        return toDTO(booking);
    }

    public BookingResponseDTO reject(Long professorUserId, Long bookingId, String reason) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        Booking booking = getOwnedBooking(professor, bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ConflictException("Seules les réservations en attente peuvent être refusées");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setProfessorResponse(reason);
        booking = bookingRepository.save(booking);

        notificationService.notify(booking.getStudent().getUser().getId(),
                "Réservation refusée",
                "Votre réservation pour '" + booking.getOffer().getTitle() + "' a été refusée.",
                "BOOKING", booking.getId());

        return toDTO(booking);
    }

    public BookingResponseDTO cancel(Long studentUserId, Long bookingId) {
        Student student = studentService.findStudentByUserId(studentUserId);
        Booking booking = bookingRepository.findById(bookingId);
        if (booking == null || !booking.getStudent().getId().equals(student.getId())) {
            throw new NotFoundException("Réservation non trouvée");
        }
        checkCancellable(booking);
        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        notificationService.notify(booking.getProfessor().getUser().getId(),
                "Réservation annulée",
                student.getUser().getFirstName() + " " + student.getUser().getLastName()
                        + " a annulé sa réservation de " + booking.getOffer().getTitle()
                        + " prévue le " + formatDateTimeFR(booking.getScheduledAt()) + ".",
                "BOOKING_CANCELLED", booking.getId());

        return toDTO(booking);
    }

    /**
     * A professor may cancel his own pending or accepted reservation. The student
     * is notified once; cancelling an already-cancelled booking is rejected so no
     * duplicate notification can ever be created.
     */
    public BookingResponseDTO cancelByProfessor(Long professorUserId, Long bookingId) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        Booking booking = getOwnedBooking(professor, bookingId);
        checkCancellable(booking);
        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        notificationService.notify(booking.getStudent().getUser().getId(),
                "Réservation annulée par le professeur",
                "Le professeur " + booking.getProfessor().getUser().getFirstName()
                        + " " + booking.getProfessor().getUser().getLastName()
                        + " a annulé votre cours de " + booking.getOffer().getTitle()
                        + " prévu le " + formatDateTimeFR(booking.getScheduledAt()) + ".",
                "BOOKING_CANCELLED", booking.getId());

        return toDTO(booking);
    }

    private void checkCancellable(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new ConflictException("Cette réservation ne peut plus être annulée");
        }
    }

    private String formatDateTimeFR(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return DateTimeFormatter.ofPattern("d MMMM yyyy 'à' HH:mm", Locale.FRENCH).format(dateTime);
    }

    public BookingResponseDTO complete(Long professorUserId, Long bookingId) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        Booking booking = getOwnedBooking(professor, bookingId);
        if (booking.getStatus() != BookingStatus.ACCEPTED) {
            throw new ConflictException("Seules les réservations acceptées peuvent être marquées terminées");
        }
        booking.setStatus(BookingStatus.COMPLETED);
        booking = bookingRepository.save(booking);

        notificationService.notify(booking.getStudent().getUser().getId(),
                "Cours terminé",
                "Le cours '" + booking.getOffer().getTitle() + "' est terminé. Vous pouvez laisser un avis.",
                "REVIEW", booking.getId());

        return toDTO(booking);
    }

    /**
     * Marks a completed cash reservation as paid (money collected for the lesson).
     * Online payments are never marked here: they would be handled by a payment provider.
     */
    public BookingResponseDTO markPaid(Long professorUserId, Long bookingId) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        Booking booking = getOwnedBooking(professor, bookingId);
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ConflictException("Le paiement ne peut être encaissé qu'une fois le cours terminé");
        }
        if (booking.getPaymentMethod() != PaymentMethod.CASH) {
            throw new ConflictException("Ce règlement n'est pas un paiement en espèces");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new ConflictException("Le paiement a déjà été encaissé");
        }
        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setPaidAt(LocalDateTime.now());
        booking = bookingRepository.save(booking);
        return toDTO(booking);
    }

    private Booking getOwnedBooking(Professor professor, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId);
        if (booking == null || !booking.getProfessor().getId().equals(professor.getId())) {
            throw new NotFoundException("Réservation non trouvée");
        }
        return booking;
    }

    private BookingResponseDTO toDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setStudentId(booking.getStudent().getId());
        dto.setStudentName(booking.getStudent().getUser().getFirstName()
                + " " + booking.getStudent().getUser().getLastName());
        dto.setStudentProfilePhoto(booking.getStudent().getProfilePhoto());
        dto.setProfessorId(booking.getProfessor().getId());
        dto.setProfessorName(booking.getProfessor().getUser().getFirstName()
                + " " + booking.getProfessor().getUser().getLastName());
        dto.setOfferId(booking.getOffer().getId());
        dto.setOfferTitle(booking.getOffer().getTitle());
        dto.setDurationMinutes(booking.getOffer().getDurationMinutes());
        dto.setLocationType(booking.getOffer().getLocationType().name());
        dto.setScheduledAt(booking.getScheduledAt());
        dto.setStatus(booking.getStatus());
        dto.setProfessorRating(booking.getProfessor().getAverageRating());
        dto.setProfessorReviewCount(booking.getProfessor().getTotalReviews());
        dto.setProfessorProfilePhoto(booking.getProfessor().getProfilePhoto());
        dto.setSubjectLabel(firstName(booking.getProfessor().getSubjects(),
                Subject::getName));
        dto.setLevelLabel(firstName(booking.getProfessor().getLevels(),
                Level::getName));
        dto.setNegotiatedPrice(booking.getNegotiatedPrice());
        dto.setPaymentMethod(booking.getPaymentMethod() != null ? booking.getPaymentMethod() : PaymentMethod.CASH);
        dto.setPaymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus() : PaymentStatus.UNPAID);
        dto.setAmount(amountOf(booking));
        dto.setCurrency(booking.getCurrency() != null ? booking.getCurrency() : "DH");
        if (booking.getStatus() == BookingStatus.ACCEPTED || booking.getStatus() == BookingStatus.COMPLETED) {
            dto.setMeetingLocation(booking.getMeetingLocation());
            dto.setMeetingLink(booking.getMeetingLink());
            dto.setMeetingPlatform(booking.getMeetingPlatform());
            dto.setMeetingInstructions(booking.getMeetingInstructions());
        }
        dto.setPaymentReference(booking.getPaymentReference());
        dto.setPaidAt(booking.getPaidAt());
        dto.setHasReview(reviewRepository.findByBooking(booking) != null);
        dto.setStudentMessage(booking.getStudentMessage());
        dto.setProfessorResponse(booking.getProfessorResponse());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }

    /**
     * The backend is authoritative for the amount: it is computed from the hourly
     * rate (offer price or negotiated price) times the offer duration in minutes.
     * Legacy rows without a stored amount are recomputed on the fly.
     */
    private BigDecimal amountOf(Booking booking) {
        if (booking.getAmount() != null) {
            return booking.getAmount();
        }
        BigDecimal hourlyRate = booking.getNegotiatedPrice() != null
                ? booking.getNegotiatedPrice()
                : booking.getOffer().getPrice();
        return hourlyRate
                .multiply(BigDecimal.valueOf(booking.getOffer().getDurationMinutes()))
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private <T> String firstName(List<T> items, Function<T, String> name) {
        if (items == null || items.isEmpty()) return null;
        String label = items.get(0) != null ? name.apply(items.get(0)) : null;
        return isBlank(label) ? null : label;
    }
}