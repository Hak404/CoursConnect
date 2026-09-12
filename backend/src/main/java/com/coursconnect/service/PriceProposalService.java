package com.coursconnect.service;

import com.coursconnect.dto.PriceProposalCreateDTO;
import com.coursconnect.dto.PriceProposalDTO;
import com.coursconnect.exception.ConflictException;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.Offer;
import com.coursconnect.model.PriceProposal;
import com.coursconnect.model.Professor;
import com.coursconnect.model.Student;
import com.coursconnect.model.enums.PriceProposalStatus;
import com.coursconnect.repository.PriceProposalRepository;
import com.coursconnect.repository.OfferRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class PriceProposalService {

    @EJB
    private PriceProposalRepository priceProposalRepository;

    @EJB
    private OfferRepository offerRepository;

    @EJB
    private StudentService studentService;

    @EJB
    private ProfessorService professorService;

    @EJB
    private NotificationService notificationService;

    public PriceProposalDTO create(Long studentUserId, PriceProposalCreateDTO dto) {
        Student student = studentService.findStudentByUserId(studentUserId);
        if (student == null) throw new NotFoundException("Profil étudiant non trouvé");

        Offer offer = offerRepository.findById(dto.getOfferId());
        if (offer == null) throw new NotFoundException("Offre non trouvée");
        if (!offer.isActive()) throw new ConflictException("Cette offre n'est plus disponible");

        Professor professor = offer.getProfessor();
        if (!professor.isActive()) throw new ConflictException("Ce professeur n'est plus actif");
        if (professor.getUser().getId().equals(studentUserId)) {
            throw new ConflictException("Impossible de proposer un tarif sur votre propre offre");
        }

        if (priceProposalRepository.existsPendingByStudentAndOffer(student, offer)) {
            throw new ConflictException("Vous avez déjà une proposition en attente pour cette offre");
        }

        PriceProposal proposal = new PriceProposal();
        proposal.setOffer(offer);
        proposal.setStudent(student);
        proposal.setProfessor(professor);
        proposal.setInitialPrice(offer.getPrice());
        proposal.setProposedPrice(dto.getProposedPrice());
        proposal.setMessage(dto.getMessage());
        proposal.setStatus(PriceProposalStatus.PENDING);
        proposal = priceProposalRepository.save(proposal);

        notificationService.notify(professor.getUser().getId(),
                "Nouvelle proposition de tarif",
                student.getUser().getFirstName() + " " + student.getUser().getLastName()
                        + " propose " + formatPrice(dto.getProposedPrice())
                        + " DH/h pour : " + offer.getTitle(),
                "PRICE_PROPOSAL");

        return toDTO(proposal);
    }

    public List<PriceProposalDTO> getMyProposals(Long studentUserId) {
        Student student = studentService.findStudentByUserId(studentUserId);
        if (student == null) throw new NotFoundException("Profil étudiant non trouvé");
        return priceProposalRepository.findByStudentOrderByCreatedAtDesc(student).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<PriceProposalDTO> getProfessorProposals(Long professorUserId) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        return priceProposalRepository.findByProfessorOrderByCreatedAtDesc(professor).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public PriceProposalDTO accept(Long professorUserId, Long proposalId) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        PriceProposal proposal = getOwnedProposal(professor, proposalId);
        if (proposal.getStatus() != PriceProposalStatus.PENDING) {
            throw new ConflictException("Seules les propositions en attente peuvent être acceptées");
        }
        proposal.setStatus(PriceProposalStatus.ACCEPTED);
        proposal.setRespondedAt(LocalDateTime.now());
        proposal = priceProposalRepository.save(proposal);

        notificationService.notify(proposal.getStudent().getUser().getId(),
                "Tarif accepté",
                "Votre proposition de " + formatPrice(proposal.getProposedPrice())
                        + " DH/h pour '" + proposal.getOffer().getTitle() + "' a été acceptée.",
                "PRICE_PROPOSAL");

        return toDTO(proposal);
    }

    public PriceProposalDTO reject(Long professorUserId, Long proposalId) {
        Professor professor = professorService.findProfessorByUserId(professorUserId);
        PriceProposal proposal = getOwnedProposal(professor, proposalId);
        if (proposal.getStatus() != PriceProposalStatus.PENDING) {
            throw new ConflictException("Seules les propositions en attente peuvent être refusées");
        }
        proposal.setStatus(PriceProposalStatus.REJECTED);
        proposal.setRespondedAt(LocalDateTime.now());
        proposal = priceProposalRepository.save(proposal);

        notificationService.notify(proposal.getStudent().getUser().getId(),
                "Tarif refusé",
                "Votre proposition de " + formatPrice(proposal.getProposedPrice())
                        + " DH/h pour '" + proposal.getOffer().getTitle() + "' a été refusée.",
                "PRICE_PROPOSAL");

        return toDTO(proposal);
    }

    public PriceProposalDTO cancel(Long studentUserId, Long proposalId) {
        Student student = studentService.findStudentByUserId(studentUserId);
        if (student == null) throw new NotFoundException("Profil étudiant non trouvé");
        PriceProposal proposal = priceProposalRepository.findById(proposalId);
        if (proposal == null || !proposal.getStudent().getId().equals(student.getId())) {
            throw new NotFoundException("Proposition non trouvée");
        }
        if (proposal.getStatus() != PriceProposalStatus.PENDING) {
            throw new ConflictException("Seules les propositions en attente peuvent être annulées");
        }
        proposal.setStatus(PriceProposalStatus.CANCELLED);
        proposal = priceProposalRepository.save(proposal);
        return toDTO(proposal);
    }

    private PriceProposal getOwnedProposal(Professor professor, Long proposalId) {
        PriceProposal proposal = priceProposalRepository.findById(proposalId);
        if (proposal == null || !proposal.getProfessor().getId().equals(professor.getId())) {
            throw new NotFoundException("Proposition non trouvée");
        }
        return proposal;
    }

    private String formatPrice(java.math.BigDecimal price) {
        return price == null ? "0" : price.stripTrailingZeros().toPlainString();
    }

    private PriceProposalDTO toDTO(PriceProposal p) {
        PriceProposalDTO dto = new PriceProposalDTO();
        dto.setId(p.getId());
        dto.setOfferId(p.getOffer().getId());
        dto.setOfferTitle(p.getOffer().getTitle());
        dto.setInitialPrice(p.getInitialPrice());
        dto.setProposedPrice(p.getProposedPrice());
        dto.setProfessorId(p.getProfessor().getId());
        dto.setProfessorName(p.getProfessor().getUser().getFirstName()
                + " " + p.getProfessor().getUser().getLastName());
        dto.setStudentId(p.getStudent().getId());
        dto.setStudentName(p.getStudent().getUser().getFirstName()
                + " " + p.getStudent().getUser().getLastName());
        dto.setMessage(p.getMessage());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setRespondedAt(p.getRespondedAt());
        dto.setBookingId(p.getBooking() != null ? p.getBooking().getId() : null);
        return dto;
    }
}