package com.coursconnect.service;

import com.coursconnect.dto.OfferDTO;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.Offer;
import com.coursconnect.model.Professor;
import com.coursconnect.repository.OfferRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class OfferService {

    @EJB
    private OfferRepository offerRepository;

    @EJB
    private ProfessorService professorService;

    public List<OfferDTO> getMyOffers(Long userId) {
        Professor professor = professorService.findProfessorByUserId(userId);
        return offerRepository.findByProfessor(professor).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public OfferDTO create(Long userId, OfferDTO dto) {
        Professor professor = professorService.findProfessorByUserId(userId);
        Offer offer = new Offer();
        offer.setProfessor(professor);
        applyDto(offer, dto);
        offer = offerRepository.save(offer);
        return toDTO(offer);
    }

    public OfferDTO update(Long userId, Long offerId, OfferDTO dto) {
        Professor professor = professorService.findProfessorByUserId(userId);
        Offer offer = offerRepository.findById(offerId);
        if (offer == null || !offer.getProfessor().getId().equals(professor.getId())) {
            throw new NotFoundException("Offre non trouvée");
        }
        applyDto(offer, dto);
        offer = offerRepository.save(offer);
        return toDTO(offer);
    }

    public void delete(Long userId, Long offerId) {
        Professor professor = professorService.findProfessorByUserId(userId);
        Offer offer = offerRepository.findById(offerId);
        if (offer == null || !offer.getProfessor().getId().equals(professor.getId())) {
            throw new NotFoundException("Offre non trouvée");
        }
        offerRepository.delete(offerId);
    }

    public OfferDTO toggleActive(Long userId, Long offerId, boolean active) {
        Professor professor = professorService.findProfessorByUserId(userId);
        Offer offer = offerRepository.findById(offerId);
        if (offer == null || !offer.getProfessor().getId().equals(professor.getId())) {
            throw new NotFoundException("Offre non trouvée");
        }
        offer.setActive(active);
        offer = offerRepository.save(offer);
        return toDTO(offer);
    }

    private void applyDto(Offer offer, OfferDTO dto) {
        if (dto.getTitle() != null) offer.setTitle(dto.getTitle());
        if (dto.getDescription() != null) offer.setDescription(dto.getDescription());
        if (dto.getPrice() != null) offer.setPrice(dto.getPrice());
        if (dto.getDurationMinutes() != null) offer.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getCourseType() != null) offer.setCourseType(dto.getCourseType());
        if (dto.getLocationType() != null) offer.setLocationType(dto.getLocationType());
        offer.setActive(dto.isActive());
    }

    private OfferDTO toDTO(Offer offer) {
        OfferDTO dto = new OfferDTO();
        dto.setId(offer.getId());
        dto.setProfessorId(offer.getProfessor().getId());
        dto.setTitle(offer.getTitle());
        dto.setDescription(offer.getDescription());
        dto.setPrice(offer.getPrice());
        dto.setDurationMinutes(offer.getDurationMinutes());
        dto.setCourseType(offer.getCourseType());
        dto.setLocationType(offer.getLocationType());
        dto.setActive(offer.isActive());
        dto.setCreatedAt(offer.getCreatedAt());
        return dto;
    }
}