package com.coursconnect.service;

import com.coursconnect.dto.MatiereDTO;
import com.coursconnect.dto.NiveauDTO;
import com.coursconnect.dto.PagedResult;
import com.coursconnect.dto.ProfesseurCreateDTO;
import com.coursconnect.dto.ProfesseurDTO;
import com.coursconnect.dto.ProfessorProfileDTO;
import com.coursconnect.dto.SearchCriteria;
import com.coursconnect.dto.SubjectDTO;
import com.coursconnect.dto.LevelDTO;
import com.coursconnect.dto.UpdateProfessorDTO;
import com.coursconnect.model.City;
import com.coursconnect.model.Matiere;
import com.coursconnect.model.Niveau;
import com.coursconnect.model.Professeur;
import com.coursconnect.model.User;
import com.coursconnect.repository.CityRepository;
import com.coursconnect.repository.ProfesseurRepository;
import com.coursconnect.repository.UserRepository;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class ProfesseurService {

    @EJB
    private ProfesseurRepository professeurRepository;

    @EJB
    private UserRepository userRepository;

    @EJB
    private CityRepository cityRepository;

    public ProfesseurDTO findById(Long id) {
        Professeur entity = professeurRepository.findById(id);
        if (entity == null) {
            return null;
        }
        return toDTO(entity);
    }

    public PagedResult<ProfesseurDTO> search(SearchCriteria criteria) {
        List<Professeur> entities = professeurRepository.search(
                criteria.getVille(), criteria.getMatiereId(), criteria.getNiveauId(),
                criteria.getTarifMin(), criteria.getTarifMax(),
                criteria.getPage(), criteria.getTaille());

        long totalElements = professeurRepository.countSearch(
                criteria.getVille(), criteria.getMatiereId(), criteria.getNiveauId(),
                criteria.getTarifMin(), criteria.getTarifMax());

        int totalPages = (int) Math.ceil((double) totalElements / criteria.getTaille());

        List<ProfesseurDTO> dtos = entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new PagedResult<>(dtos, criteria.getPage(), criteria.getTaille(),
                totalElements, totalPages);
    }

    public ProfesseurDTO create(ProfesseurCreateDTO dto) {
        Professeur entity = toEntity(dto);
        entity = professeurRepository.save(entity);
        return toDTO(entity);
    }

    public ProfesseurDTO update(Long id, ProfesseurCreateDTO dto) {
        Professeur existing = professeurRepository.findById(id);
        if (existing == null) {
            return null;
        }

        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setEmail(dto.getEmail());
        existing.setTelephone(dto.getTelephone());
        existing.setVille(dto.getVille());
        existing.setCodePostal(dto.getCodePostal());
        existing.setBio(dto.getBio());
        existing.setPhotoUrl(dto.getPhotoUrl());
        existing.setTarifHoraire(dto.getTarifHoraire());

        if (dto.getMatiereIds() != null) {
            List<Matiere> matieres = dto.getMatiereIds().stream()
                    .map(professeurRepository::findMatiereById)
                    .filter(m -> m != null)
                    .collect(Collectors.toList());
            existing.setMatieres(matieres);
        }

        if (dto.getNiveauIds() != null) {
            List<Niveau> niveaux = dto.getNiveauIds().stream()
                    .map(professeurRepository::findNiveauById)
                    .filter(n -> n != null)
                    .collect(Collectors.toList());
            existing.setNiveaux(niveaux);
        }

        existing = professeurRepository.save(existing);
        return toDTO(existing);
    }

    public void delete(Long id) {
        professeurRepository.delete(id);
    }

    public List<MatiereDTO> getAllMatieres() {
        return professeurRepository.findAllMatieres().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NiveauDTO> getAllNiveaux() {
        return professeurRepository.findAllNiveaux().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProfessorProfileDTO getProfessorProfile(Long userId) {
        User user = userRepository.findById(userId);
        if (user == null) return null;
        Professeur prof = professeurRepository.findByUser(user);
        if (prof == null) return null;
        return toProfileDTO(prof);
    }

    public ProfessorProfileDTO updateProfessorProfile(Long userId, UpdateProfessorDTO dto) {
        User user = userRepository.findById(userId);
        if (user == null) return null;
        Professeur prof = professeurRepository.findByUser(user);
        if (prof == null) return null;

        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
            prof.setTelephone(dto.getPhone());
        }

        if (dto.getCityId() != null) {
            City city = cityRepository.findById(dto.getCityId());
            if (city != null) {
                prof.setVille(city.getName());
            }
        }
        if (dto.getProfilePhoto() != null) {
            prof.setPhotoUrl(dto.getProfilePhoto());
        }
        if (dto.getBio() != null) {
            prof.setBio(dto.getBio());
        }
        if (dto.getExperienceYears() != null) {
            prof.setExperienceYears(dto.getExperienceYears());
        }

        userRepository.save(user);
        professeurRepository.save(prof);
        return toProfileDTO(prof);
    }

    private ProfessorProfileDTO toProfileDTO(Professeur entity) {
        if (entity == null) return null;
        ProfessorProfileDTO dto = new ProfessorProfileDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setFirstName(entity.getUser() != null ? entity.getUser().getFirstName() : entity.getPrenom());
        dto.setLastName(entity.getUser() != null ? entity.getUser().getLastName() : entity.getNom());
        dto.setEmail(entity.getUser() != null ? entity.getUser().getEmail() : entity.getEmail());
        dto.setPhone(entity.getUser() != null ? entity.getUser().getPhone() : entity.getTelephone());
        dto.setCityName(entity.getVille());
        dto.setProfilePhoto(entity.getPhotoUrl());
        dto.setBio(entity.getBio());
        dto.setExperienceYears(entity.getExperienceYears());
        dto.setVerified(entity.isVerified());
        dto.setAverageRating(entity.getAverageRating());
        dto.setTotalReviews(entity.getTotalReviews());

        List<SubjectDTO> matieres = entity.getMatieres() != null
                ? entity.getMatieres().stream()
                    .map(m -> new SubjectDTO(
                            m.getId(), m.getNom(), m.getDescription(), true))
                    .collect(Collectors.toList())
                : List.of();
        dto.setSubjects(matieres);

        List<LevelDTO> niveaux = entity.getNiveaux() != null
                ? entity.getNiveaux().stream()
                    .map(n -> new LevelDTO(
                            n.getId(), n.getNom(), n.getDescription(), n.getOrdre(), true))
                    .collect(Collectors.toList())
                : List.of();
        dto.setLevels(niveaux);

        return dto;
    }

    private ProfesseurDTO toDTO(Professeur entity) {
        if (entity == null) {
            return null;
        }

        List<MatiereDTO> matieres = entity.getMatieres() != null
                ? entity.getMatieres().stream().map(this::toDTO).collect(Collectors.toList())
                : List.of();

        List<NiveauDTO> niveaux = entity.getNiveaux() != null
                ? entity.getNiveaux().stream().map(this::toDTO).collect(Collectors.toList())
                : List.of();

        return new ProfesseurDTO(
                entity.getId(),
                entity.getNom(),
                entity.getPrenom(),
                entity.getEmail(),
                entity.getTelephone(),
                entity.getVille(),
                entity.getCodePostal(),
                entity.getBio(),
                entity.getPhotoUrl(),
                entity.getTarifHoraire(),
                matieres,
                niveaux,
                entity.getCreatedAt()
        );
    }

    private MatiereDTO toDTO(Matiere matiere) {
        if (matiere == null) {
            return null;
        }
        MatiereDTO dto = new MatiereDTO();
        dto.setId(matiere.getId());
        dto.setNom(matiere.getNom());
        dto.setDescription(matiere.getDescription());
        return dto;
    }

    private NiveauDTO toDTO(Niveau niveau) {
        if (niveau == null) {
            return null;
        }
        NiveauDTO dto = new NiveauDTO();
        dto.setId(niveau.getId());
        dto.setNom(niveau.getNom());
        dto.setDescription(niveau.getDescription());
        dto.setOrdre(niveau.getOrdre());
        return dto;
    }

    private Professeur toEntity(ProfesseurCreateDTO dto) {
        Professeur entity = new Professeur();
        entity.setNom(dto.getNom());
        entity.setPrenom(dto.getPrenom());
        entity.setEmail(dto.getEmail());
        entity.setTelephone(dto.getTelephone());
        entity.setVille(dto.getVille());
        entity.setCodePostal(dto.getCodePostal());
        entity.setBio(dto.getBio());
        entity.setPhotoUrl(dto.getPhotoUrl());
        entity.setTarifHoraire(dto.getTarifHoraire());

        if (dto.getMatiereIds() != null) {
            List<Matiere> matieres = dto.getMatiereIds().stream()
                    .map(professeurRepository::findMatiereById)
                    .filter(m -> m != null)
                    .collect(Collectors.toList());
            entity.setMatieres(matieres);
        }

        if (dto.getNiveauIds() != null) {
            List<Niveau> niveaux = dto.getNiveauIds().stream()
                    .map(professeurRepository::findNiveauById)
                    .filter(n -> n != null)
                    .collect(Collectors.toList());
            entity.setNiveaux(niveaux);
        }

        return entity;
    }
}
