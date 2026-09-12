package com.coursconnect.service;

import com.coursconnect.dto.SubjectDTO;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.Subject;
import com.coursconnect.repository.SubjectRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class SubjectService {

    @EJB
    private SubjectRepository subjectRepository;

    public List<SubjectDTO> getAll() {
        return subjectRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<SubjectDTO> getActive() {
        return subjectRepository.findAllActive().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public SubjectDTO create(SubjectDTO dto) {
        Subject subject = new Subject();
        subject.setName(dto.getName());
        subject.setDescription(dto.getDescription());
        subject.setActive(dto.isActive());
        subject = subjectRepository.save(subject);
        return toDTO(subject);
    }

    public SubjectDTO update(Long id, SubjectDTO dto) {
        Subject subject = subjectRepository.findById(id);
        if (subject == null) throw new NotFoundException("Matière non trouvée");
        if (dto.getName() != null) subject.setName(dto.getName());
        if (dto.getDescription() != null) subject.setDescription(dto.getDescription());
        subject.setActive(dto.isActive());
        subject = subjectRepository.save(subject);
        return toDTO(subject);
    }

    public void delete(Long id) {
        Subject subject = subjectRepository.findById(id);
        if (subject == null) throw new NotFoundException("Matière non trouvée");
        subjectRepository.delete(id);
    }

    private SubjectDTO toDTO(Subject subject) {
        return new SubjectDTO(subject.getId(), subject.getName(), subject.getDescription(), subject.isActive());
    }
}