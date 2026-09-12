package com.coursconnect.repository;

import com.coursconnect.model.City;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Stateless
public class CityRepository {

    @PersistenceContext
    private EntityManager em;

    public City findById(Long id) {
        return em.find(City.class, id);
    }

    public City findByName(String name) {
        TypedQuery<City> q = em.createQuery("SELECT c FROM City c WHERE c.name = :name", City.class);
        q.setParameter("name", name);
        List<City> results = q.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public List<City> findAllActive() {
        return em.createQuery("SELECT c FROM City c WHERE c.active = true ORDER BY c.name", City.class)
                .getResultList();
    }

    public List<City> findAll() {
        return em.createQuery("SELECT c FROM City c ORDER BY c.name", City.class)
                .getResultList();
    }

    public City save(City city) {
        if (city.getId() == null) {
            em.persist(city);
            return city;
        }
        return em.merge(city);
    }

    public void delete(Long id) {
        City city = em.find(City.class, id);
        if (city != null) {
            em.remove(city);
        }
    }
}