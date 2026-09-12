package com.coursconnect.dto;

import java.util.List;

public class HomePageDTO {

    private List<CityDTO> popularCities;
    private List<SubjectDTO> popularSubjects;
    private List<LevelDTO> levels;
    private List<ProfessorCardDTO> topProfessors;

    public HomePageDTO() {}

    public HomePageDTO(List<CityDTO> popularCities, List<SubjectDTO> popularSubjects,
                       List<LevelDTO> levels, List<ProfessorCardDTO> topProfessors) {
        this.popularCities = popularCities;
        this.popularSubjects = popularSubjects;
        this.levels = levels;
        this.topProfessors = topProfessors;
    }

    public List<CityDTO> getPopularCities() { return popularCities; }
    public void setPopularCities(List<CityDTO> popularCities) { this.popularCities = popularCities; }
    public List<SubjectDTO> getPopularSubjects() { return popularSubjects; }
    public void setPopularSubjects(List<SubjectDTO> popularSubjects) { this.popularSubjects = popularSubjects; }
    public List<LevelDTO> getLevels() { return levels; }
    public void setLevels(List<LevelDTO> levels) { this.levels = levels; }
    public List<ProfessorCardDTO> getTopProfessors() { return topProfessors; }
    public void setTopProfessors(List<ProfessorCardDTO> topProfessors) { this.topProfessors = topProfessors; }
}