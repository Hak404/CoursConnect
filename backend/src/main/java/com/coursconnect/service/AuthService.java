package com.coursconnect.service;

import com.coursconnect.config.PasswordUtil;
import com.coursconnect.dto.AuthResponseDTO;
import com.coursconnect.dto.LoginDTO;
import com.coursconnect.dto.RegisterProfessorDTO;
import com.coursconnect.dto.RegisterStudentDTO;
import com.coursconnect.dto.UserDTO;
import com.coursconnect.exception.ConflictException;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.exception.UnauthorizedException;
import com.coursconnect.model.City;
import com.coursconnect.model.Level;
import com.coursconnect.model.Professor;
import com.coursconnect.model.Student;
import com.coursconnect.model.Subject;
import com.coursconnect.model.User;
import com.coursconnect.model.UserSession;
import com.coursconnect.model.enums.Role;
import com.coursconnect.repository.CityRepository;
import com.coursconnect.repository.LevelRepository;
import com.coursconnect.repository.ProfessorRepository;
import com.coursconnect.repository.StudentRepository;
import com.coursconnect.repository.SubjectRepository;
import com.coursconnect.repository.UserRepository;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;

@Stateless
public class AuthService {

    @EJB
    private UserRepository userRepository;

    @EJB
    private StudentRepository studentRepository;

    @EJB
    private ProfessorRepository professorRepository;

    @EJB
    private CityRepository cityRepository;

    @EJB
    private SubjectRepository subjectRepository;

    @EJB
    private LevelRepository levelRepository;

    public AuthResponseDTO registerStudent(RegisterStudentDTO dto) {
        String email = normalizeEmail(dto.getEmail());
        if (userRepository.findByEmail(email) != null) {
            throw new ConflictException("Cet email est déjà utilisé");
        }

        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(email);
        user.setPasswordHash(PasswordUtil.hashPassword(dto.getPassword()));
        user.setPhone(dto.getPhone());
        user.setRole(Role.STUDENT);
        user.setEnabled(true);
        user = userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        if (dto.getCityId() != null) {
            student.setCity(cityRepository.findById(dto.getCityId()));
        }
        student = studentRepository.save(student);

        UserSession session = userRepository.createSession(user);
        return toAuthResponse(session.getToken(), user);
    }

    public AuthResponseDTO registerProfessor(RegisterProfessorDTO dto) {
        String email = normalizeEmail(dto.getEmail());
        if (userRepository.findByEmail(email) != null) {
            throw new ConflictException("Cet email est déjà utilisé");
        }

        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(email);
        user.setPasswordHash(PasswordUtil.hashPassword(dto.getPassword()));
        user.setPhone(dto.getPhone());
        user.setRole(Role.PROFESSOR);
        user.setEnabled(true);
        user = userRepository.save(user);

        Professor prof = new Professor();
        prof.setUser(user);
        prof.setBio(dto.getBio());
        prof.setExperienceYears(dto.getExperienceYears());
        if (dto.getCityId() != null) {
            prof.setCity(cityRepository.findById(dto.getCityId()));
        }

        if (dto.getSubjectIds() != null) {
            List<Subject> subjects = dto.getSubjectIds().stream()
                    .map(subjectRepository::findById)
                    .filter(s -> s != null)
                    .collect(java.util.stream.Collectors.toList());
            prof.setSubjects(subjects);
        }

        if (dto.getLevelIds() != null) {
            List<Level> levels = dto.getLevelIds().stream()
                    .map(levelRepository::findById)
                    .filter(l -> l != null)
                    .collect(java.util.stream.Collectors.toList());
            prof.setLevels(levels);
        }

        professorRepository.save(prof);

        UserSession session = userRepository.createSession(user);
        return toAuthResponse(session.getToken(), user);
    }

    public AuthResponseDTO login(LoginDTO dto) {
        User user = userRepository.findByEmail(normalizeEmail(dto.getEmail()));
        if (user == null) {
            throw new UnauthorizedException("Email ou mot de passe incorrect");
        }
        if (!PasswordUtil.verifyPassword(dto.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email ou mot de passe incorrect");
        }
        if (!user.isEnabled()) {
            throw new UnauthorizedException("Compte désactivé");
        }

        UserSession session = userRepository.createSession(user);
        return toAuthResponse(session.getToken(), user);
    }

    public void logout(String token) {
        userRepository.invalidateSession(token);
    }

    public UserDTO getCurrentUser(Long userId) {
        User user = userRepository.findById(userId);
        if (user == null) throw new NotFoundException("Utilisateur non trouvé");
        return toUserDTO(user);
    }

    private AuthResponseDTO toAuthResponse(String token, User user) {
        AuthResponseDTO dto = new AuthResponseDTO();
        dto.setToken(token);
        dto.setUserId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        return dto;
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

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(java.util.Locale.ROOT);
    }
}