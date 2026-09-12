package com.coursconnect.service;

import com.coursconnect.dto.AvailabilityDTO;
import com.coursconnect.exception.ConflictException;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.Availability;
import com.coursconnect.model.Professor;
import com.coursconnect.repository.AvailabilityRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class AvailabilityService {

    @EJB
    private AvailabilityRepository availabilityRepository;

    @EJB
    private ProfessorService professorService;

    public List<AvailabilityDTO> getMyAvailability(Long userId) {
        Professor professor = professorService.findProfessorByUserId(userId);
        return availabilityRepository.findByProfessor(professor).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public AvailabilityDTO create(Long userId, AvailabilityDTO dto) {
        Professor professor = professorService.findProfessorByUserId(userId);
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new ConflictException("L'heure de fin doit être après l'heure de début");
        }
        if (availabilityRepository.existsOverlap(professor, dto.getDayOfWeek(), dto.getStartTime(), dto.getEndTime(), null)) {
            throw new ConflictException("Un créneau existe déjà sur cette plage horaire");
        }
        Availability availability = new Availability();
        availability.setProfessor(professor);
        availability.setDayOfWeek(dto.getDayOfWeek());
        availability.setStartTime(dto.getStartTime());
        availability.setEndTime(dto.getEndTime());
        availability.setActive(true);
        availability = availabilityRepository.save(availability);
        return toDTO(availability);
    }

    public void delete(Long userId, Long availabilityId) {
        Professor professor = professorService.findProfessorByUserId(userId);
        Availability availability = availabilityRepository.findById(availabilityId);
        if (availability == null || !availability.getProfessor().getId().equals(professor.getId())) {
            throw new NotFoundException("Disponibilité non trouvée");
        }
        availabilityRepository.delete(availabilityId);
    }

    public AvailabilityDTO toggleActive(Long userId, Long availabilityId, boolean active) {
        Professor professor = professorService.findProfessorByUserId(userId);
        Availability availability = availabilityRepository.findById(availabilityId);
        if (availability == null || !availability.getProfessor().getId().equals(professor.getId())) {
            throw new NotFoundException("Disponibilité non trouvée");
        }
        availability.setActive(active);
        availability = availabilityRepository.save(availability);
        return toDTO(availability);
    }

    private AvailabilityDTO toDTO(Availability a) {
        return new AvailabilityDTO(a.getId(), a.getProfessor().getId(),
                a.getDayOfWeek(), a.getStartTime(), a.getEndTime(), a.isActive());
    }
}