package com.coursconnect.service;

import com.coursconnect.dto.LevelDTO;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.Level;
import com.coursconnect.repository.LevelRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class LevelService {

    @EJB
    private LevelRepository levelRepository;

    public List<LevelDTO> getAll() {
        return levelRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<LevelDTO> getActive() {
        return levelRepository.findAllActive().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public LevelDTO create(LevelDTO dto) {
        Level level = new Level();
        level.setName(dto.getName());
        level.setDescription(dto.getDescription());
        level.setDisplayOrder(dto.getDisplayOrder());
        level.setActive(dto.isActive());
        level = levelRepository.save(level);
        return toDTO(level);
    }

    public LevelDTO update(Long id, LevelDTO dto) {
        Level level = levelRepository.findById(id);
        if (level == null) throw new NotFoundException("Niveau non trouvé");
        if (dto.getName() != null) level.setName(dto.getName());
        if (dto.getDescription() != null) level.setDescription(dto.getDescription());
        level.setDisplayOrder(dto.getDisplayOrder());
        level.setActive(dto.isActive());
        level = levelRepository.save(level);
        return toDTO(level);
    }

    public void delete(Long id) {
        Level level = levelRepository.findById(id);
        if (level == null) throw new NotFoundException("Niveau non trouvé");
        levelRepository.delete(id);
    }

    private LevelDTO toDTO(Level level) {
        return new LevelDTO(level.getId(), level.getName(), level.getDescription(),
                level.getDisplayOrder(), level.isActive());
    }
}