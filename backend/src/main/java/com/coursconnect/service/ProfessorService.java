package com.coursconnect.service;

import com.coursconnect.dto.*;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.*;
import com.coursconnect.model.enums.CourseType;
import com.coursconnect.repository.*;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class ProfessorService {

    @EJB
    private ProfessorRepository professorRepository;

    @EJB
    private UserRepository userRepository;

    @EJB
    private CityRepository cityRepository;

    @EJB
    private SubjectRepository subjectRepository;

    @EJB
    private LevelRepository levelRepository;

    @EJB
    private OfferRepository offerRepository;

    @EJB
    private AvailabilityRepository availabilityRepository;

    @EJB
    private ReviewRepository reviewRepository;

    public PagedResult<ProfessorCardDTO> search(SearchCriteriaDTO criteria) {
        ProfessorRepository.SearchArgs args = new ProfessorRepository.SearchArgs();
        args.cityId = criteria.getCityId();
        args.cityName = criteria.getCityName();
        args.subjectId = criteria.getSubjectId();
        args.levelId = criteria.getLevelId();
        args.minPrice = criteria.getMinPrice();
        args.maxPrice = criteria.getMaxPrice();
        args.minRating = criteria.getMinRating();
        args.verifiedOnly = criteria.getVerifiedOnly();
        args.sortBy = criteria.getSortBy();
        int page = Math.max(0, criteria.getPage());
        int size = criteria.getSize() > 0 ? Math.min(100, criteria.getSize()) : 10;
        args.page = page;
        args.size = size;
        if (criteria.getCourseType() != null && !criteria.getCourseType().isBlank()) {
            try {
                CourseType.valueOf(criteria.getCourseType());
                args.courseType = criteria.getCourseType();
            } catch (IllegalArgumentException ignored) {
                args.courseType = null;
            }
        }

        List<Professor> entities = professorRepository.search(args);
        long total = professorRepository.countSearch(args);
        int totalPages = (int) Math.ceil((double) total / args.size);

        List<ProfessorCardDTO> cards = entities.stream()
                .map(this::toCardDTO)
                .collect(Collectors.toList());

        return new PagedResult<>(cards, args.page, args.size, total, totalPages);
    }

    public ProfessorDetailDTO getPublicDetail(Long id) {
        Professor professor = professorRepository.findById(id);
        if (professor == null) throw new NotFoundException("Professeur non trouvé");

        ProfessorDetailDTO dto = new ProfessorDetailDTO();
        dto.setId(professor.getId());
        dto.setFirstName(userFirstName(professor));
        dto.setLastName(userLastName(professor));
        dto.setProfilePhoto(professor.getProfilePhoto());
        if (professor.getCity() != null) {
            dto.setCityId(professor.getCity().getId());
            dto.setCityName(professor.getCity().getName());
        }
        dto.setBio(professor.getBio());
        dto.setExperienceYears(professor.getExperienceYears());
        dto.setVerified(professor.isVerified());
        dto.setAverageRating(professor.getAverageRating());
        dto.setTotalReviews(professor.getTotalReviews());
        dto.setSubjects(professor.getSubjects().stream().map(this::toSubjectDTO).collect(Collectors.toList()));
        dto.setLevels(professor.getLevels().stream().map(this::toLevelDTO).collect(Collectors.toList()));
        dto.setOffers(offerRepository.findByProfessorId(professor.getId()).stream()
                .map(this::toOfferDTO).collect(Collectors.toList()));
        dto.setAvailabilities(availabilityRepository.findByProfessorId(professor.getId()).stream()
                .map(this::toAvailabilityDTO).collect(Collectors.toList()));
        List<ReviewResponseDTO> reviews = reviewRepository.findByProfessorId(professor.getId()).stream()
                .map(this::toReviewDTO).collect(Collectors.toList());
        dto.setReviews(reviews);
        dto.setReviewCount(reviews.size());
        return dto;
    }

    public ProfessorProfileDTO getMyProfile(Long userId) {
        Professor professor = findProfessorByUserId(userId);
        return toProfileDTO(professor);
    }

    public ProfessorProfileDTO updateMyProfile(Long userId, UpdateProfessorDTO dto) {
        User user = userRepository.findById(userId);
        if (user == null) throw new NotFoundException("Utilisateur non trouvé");
        Professor professor = professorRepository.findByUser(user);
        if (professor == null) throw new NotFoundException("Profil professeur non trouvé");

        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
            userRepository.save(user);
        }
        if (dto.getCityId() != null) {
            City city = cityRepository.findById(dto.getCityId());
            if (city != null && city.isActive()) {
                professor.setCity(city);
            }
        }
        if (dto.getProfilePhoto() != null) {
            professor.setProfilePhoto(dto.getProfilePhoto());
        }
        if (dto.getBio() != null) {
            professor.setBio(dto.getBio());
        }
        if (dto.getTeachingAddress() != null) {
            professor.setTeachingAddress(dto.getTeachingAddress());
        }
        if (dto.getExperienceYears() != null) {
            professor.setExperienceYears(dto.getExperienceYears());
        }
        if (dto.getSubjectIds() != null) {
            professor.setSubjects(dto.getSubjectIds().stream()
                    .map(subjectRepository::findById)
                    .filter(s -> s != null && s.isActive())
                    .collect(Collectors.toList()));
        }
        if (dto.getLevelIds() != null) {
            professor.setLevels(dto.getLevelIds().stream()
                    .map(levelRepository::findById)
                    .filter(l -> l != null && l.isActive())
                    .collect(Collectors.toList()));
        }
        professor = professorRepository.save(professor);
        return toProfileDTO(professor);
    }

    public Professor findProfessorByUserId(Long userId) {
        User user = userRepository.findById(userId);
        if (user == null) throw new NotFoundException("Utilisateur non trouvé");
        Professor professor = professorRepository.findByUser(user);
        if (professor == null) throw new NotFoundException("Profil professeur non trouvé");
        return professor;
    }

    public HomePageDTO getHomePageData() {
        List<CityDTO> cities = cityRepository.findAllActive().stream()
                .map(c -> new CityDTO(c.getId(), c.getName(), c.getRegion(), c.isActive()))
                .collect(Collectors.toList());
        List<SubjectDTO> subjects = subjectRepository.findAllActive().stream()
                .map(this::toSubjectDTO)
                .collect(Collectors.toList());
        List<LevelDTO> levels = levelRepository.findAllActive().stream()
                .map(this::toLevelDTO)
                .collect(Collectors.toList());
        List<ProfessorCardDTO> top = professorRepository.findBestForHome(6).stream()
                .map(this::toCardDTO)
                .collect(Collectors.toList());
        return new HomePageDTO(cities, subjects, levels, top);
    }

    public ProfessorCardDTO toCardDTO(Professor p) {
        ProfessorCardDTO dto = new ProfessorCardDTO();
        dto.setId(p.getId());
        dto.setFirstName(userFirstName(p));
        dto.setLastName(userLastName(p));
        dto.setProfilePhoto(p.getProfilePhoto());
        if (p.getCity() != null) {
            dto.setCityId(p.getCity().getId());
            dto.setCityName(p.getCity().getName());
        }
        dto.setBio(p.getBio());
        dto.setExperienceYears(p.getExperienceYears());
        dto.setVerified(p.isVerified());
        dto.setAverageRating(p.getAverageRating());
        dto.setTotalReviews(p.getTotalReviews());
        dto.setSubjects(p.getSubjects().stream().map(this::toSubjectDTO).collect(Collectors.toList()));
        dto.setLevels(p.getLevels().stream().map(this::toLevelDTO).collect(Collectors.toList()));
        List<OfferDTO> offers = offerRepository.findByProfessorId(p.getId()).stream()
                .map(this::toOfferDTO).collect(Collectors.toList());
        dto.setOffers(offers);
        dto.setMinPrice(offers.isEmpty() ? null :
                offers.stream().map(OfferDTO::getPrice).min(BigDecimal::compareTo).orElse(null));
        return dto;
    }

    private String userFirstName(Professor p) {
        return p.getUser() != null ? p.getUser().getFirstName() : "";
    }

    private String userLastName(Professor p) {
        return p.getUser() != null ? p.getUser().getLastName() : "";
    }

    private ProfessorProfileDTO toProfileDTO(Professor professor) {
        ProfessorProfileDTO dto = new ProfessorProfileDTO();
        dto.setId(professor.getId());
        dto.setUserId(professor.getUser() != null ? professor.getUser().getId() : null);
        dto.setFirstName(userFirstName(professor));
        dto.setLastName(userLastName(professor));
        dto.setEmail(professor.getUser() != null ? professor.getUser().getEmail() : null);
        dto.setPhone(professor.getUser() != null ? professor.getUser().getPhone() : null);
        if (professor.getCity() != null) {
            dto.setCityId(professor.getCity().getId());
            dto.setCityName(professor.getCity().getName());
        }
        dto.setProfilePhoto(professor.getProfilePhoto());
        dto.setBio(professor.getBio());
        dto.setTeachingAddress(professor.getTeachingAddress());
        dto.setExperienceYears(professor.getExperienceYears());
        dto.setVerified(professor.isVerified());
        dto.setAverageRating(professor.getAverageRating());
        dto.setTotalReviews(professor.getTotalReviews());
        dto.setSubjects(professor.getSubjects().stream().map(this::toSubjectDTO).collect(Collectors.toList()));
        dto.setLevels(professor.getLevels().stream().map(this::toLevelDTO).collect(Collectors.toList()));
        return dto;
    }

    private SubjectDTO toSubjectDTO(Subject subject) {
        return new SubjectDTO(subject.getId(), subject.getName(), subject.getDescription(), subject.isActive());
    }

    private LevelDTO toLevelDTO(Level level) {
        return new LevelDTO(level.getId(), level.getName(), level.getDescription(), level.getDisplayOrder(), level.isActive());
    }

    private OfferDTO toOfferDTO(Offer offer) {
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

    private AvailabilityDTO toAvailabilityDTO(Availability availability) {
        return new AvailabilityDTO(availability.getId(), availability.getProfessor().getId(),
                availability.getDayOfWeek(), availability.getStartTime(),
                availability.getEndTime(), availability.isActive());
    }

    private ReviewResponseDTO toReviewDTO(Review review) {
        ReviewResponseDTO dto = new ReviewResponseDTO();
        dto.setId(review.getId());
        dto.setBookingId(review.getBooking().getId());
        dto.setStudentId(review.getStudent().getId());
        dto.setStudentName(review.getStudent().getUser() != null
                ? review.getStudent().getUser().getFirstName() + " " + review.getStudent().getUser().getLastName().charAt(0) + "."
                : "");
        dto.setProfessorId(review.getProfessor().getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}