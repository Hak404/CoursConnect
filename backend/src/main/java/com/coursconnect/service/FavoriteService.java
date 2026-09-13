package com.coursconnect.service;

import com.coursconnect.dto.ProfessorCardDTO;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.Professor;
import com.coursconnect.model.ProfessorFavorite;
import com.coursconnect.model.Student;
import com.coursconnect.repository.ProfessorFavoriteRepository;
import com.coursconnect.repository.ProfessorRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;

import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class FavoriteService {

    @EJB
    private ProfessorFavoriteRepository favoriteRepository;

    @EJB
    private ProfessorRepository professorRepository;

    @EJB
    private StudentService studentService;

    @EJB
    private ProfessorService professorService;

    private Student requireStudent(Long userId) {
        Student student = studentService.findStudentByUserId(userId);
        if (student == null) {
            throw new NotFoundException("Profil étudiant non trouvé");
        }
        return student;
    }

    /** Ajoute un favori. Retourne true si le favori a été créé, false s'il existait déjà. */
    public boolean add(Long userId, Long professorId) {
        Student student = requireStudent(userId);
        Professor professor = professorRepository.findById(professorId);
        if (professor == null) {
            throw new NotFoundException("Professeur non trouvé");
        }
        if (favoriteRepository.exists(student.getId(), professorId)) {
            return false;
        }
        favoriteRepository.save(new ProfessorFavorite(student, professor));
        return true;
    }

    /** Retire un favori de façon idempotente. */
    public void remove(Long userId, Long professorId) {
        Student student = requireStudent(userId);
        favoriteRepository.delete(student.getId(), professorId);
    }

    public List<Long> getIds(Long userId) {
        Student student = studentService.findStudentByUserId(userId);
        if (student == null) {
            return java.util.Collections.emptyList();
        }
        return favoriteRepository.findProfessorIdsByStudent(student.getId());
    }

    public List<ProfessorCardDTO> getFavorites(Long userId) {
        Student student = requireStudent(userId);
        return favoriteRepository.findProfessorsByStudent(student.getId()).stream()
                .map(professorService::toCardDTO)
                .collect(Collectors.toList());
    }
}