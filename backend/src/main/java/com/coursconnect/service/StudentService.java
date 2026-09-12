package com.coursconnect.service;

import com.coursconnect.dto.StudentProfileDTO;
import com.coursconnect.dto.UpdateStudentDTO;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.City;
import com.coursconnect.model.Student;
import com.coursconnect.model.User;
import com.coursconnect.repository.CityRepository;
import com.coursconnect.repository.StudentRepository;
import com.coursconnect.repository.UserRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;

@Stateless
public class StudentService {

    @EJB
    private StudentRepository studentRepository;

    @EJB
    private UserRepository userRepository;

    @EJB
    private CityRepository cityRepository;

    public StudentProfileDTO getProfile(Long userId) {
        User user = userRepository.findById(userId);
        if (user == null) throw new NotFoundException("Utilisateur non trouvé");
        Student student = studentRepository.findByUser(user);
        if (student == null) throw new NotFoundException("Profil étudiant non trouvé");
        return toProfileDTO(student);
    }

    public StudentProfileDTO updateProfile(Long userId, UpdateStudentDTO dto) {
        User user = userRepository.findById(userId);
        if (user == null) throw new NotFoundException("Utilisateur non trouvé");
        Student student = studentRepository.findByUser(user);
        if (student == null) throw new NotFoundException("Profil étudiant non trouvé");

        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
            userRepository.save(user);
        }
        if (dto.getProfilePhoto() != null) {
            student.setProfilePhoto(dto.getProfilePhoto());
        }
        if (dto.getCityId() != null) {
            City city = cityRepository.findById(dto.getCityId());
            if (city != null) {
                student.setCity(city);
            }
        }
        student = studentRepository.save(student);
        return toProfileDTO(student);
    }

    public Student findStudentByUserId(Long userId) {
        User user = userRepository.findById(userId);
        return user == null ? null : studentRepository.findByUser(user);
    }

    private StudentProfileDTO toProfileDTO(Student student) {
        StudentProfileDTO dto = new StudentProfileDTO();
        dto.setId(student.getId());
        dto.setUserId(student.getUser().getId());
        dto.setFirstName(student.getUser().getFirstName());
        dto.setLastName(student.getUser().getLastName());
        dto.setEmail(student.getUser().getEmail());
        dto.setPhone(student.getUser().getPhone());
        if (student.getCity() != null) {
            dto.setCityId(student.getCity().getId());
            dto.setCityName(student.getCity().getName());
        }
        dto.setProfilePhoto(student.getProfilePhoto());
        return dto;
    }
}