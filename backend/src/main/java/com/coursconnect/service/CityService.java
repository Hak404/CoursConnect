package com.coursconnect.service;

import com.coursconnect.dto.CityDTO;
import com.coursconnect.exception.NotFoundException;
import com.coursconnect.model.City;
import com.coursconnect.repository.CityRepository;
import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;
import java.util.List;
import java.util.stream.Collectors;

@Stateless
public class CityService {

    @EJB
    private CityRepository cityRepository;

    public List<CityDTO> getAll() {
        return cityRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<CityDTO> getActive() {
        return cityRepository.findAllActive().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CityDTO create(CityDTO dto) {
        City city = new City();
        city.setName(dto.getName());
        city.setRegion(dto.getRegion());
        city.setActive(dto.isActive());
        city = cityRepository.save(city);
        return toDTO(city);
    }

    public CityDTO update(Long id, CityDTO dto) {
        City city = cityRepository.findById(id);
        if (city == null) throw new NotFoundException("Ville non trouvée");
        if (dto.getName() != null) city.setName(dto.getName());
        if (dto.getRegion() != null) city.setRegion(dto.getRegion());
        city.setActive(dto.isActive());
        city = cityRepository.save(city);
        return toDTO(city);
    }

    public void delete(Long id) {
        City city = cityRepository.findById(id);
        if (city == null) throw new NotFoundException("Ville non trouvée");
        cityRepository.delete(id);
    }

    private CityDTO toDTO(City city) {
        return new CityDTO(city.getId(), city.getName(), city.getRegion(), city.isActive());
    }
}