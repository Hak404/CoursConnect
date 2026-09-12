package com.coursconnect.repository;

import com.coursconnect.model.Professor;
import com.coursconnect.model.User;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.math.BigDecimal;
import java.util.List;

@Stateless
public class ProfessorRepository {

    @PersistenceContext
    private EntityManager em;

    public Professor findById(Long id) {
        return em.find(Professor.class, id);
    }

    public Professor findByUser(User user) {
        TypedQuery<Professor> q = em.createQuery(
            "SELECT p FROM Professor p WHERE p.user = :user", Professor.class);
        q.setParameter("user", user);
        List<Professor> results = q.getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public List<Professor> findAll() {
        return em.createQuery("SELECT p FROM Professor p ORDER BY p.id", Professor.class)
                .getResultList();
    }

    public List<Professor> search(SearchArgs args) {
        StringBuilder jpql = new StringBuilder(
                "SELECT DISTINCT p FROM Professor p WHERE p.active = true");
        appendFilters(jpql, args);

        String sortBy = args.sortBy == null ? "rating" : args.sortBy;
        switch (sortBy) {
            case "priceAsc":
                jpql.append(" ORDER BY (SELECT MIN(o.price) FROM p.offers o WHERE o.active = true) ASC, p.id");
                break;
            case "priceDesc":
                jpql.append(" ORDER BY (SELECT MIN(o.price) FROM p.offers o WHERE o.active = true) DESC, p.id");
                break;
            case "reviews":
                jpql.append(" ORDER BY p.totalReviews DESC, p.id");
                break;
            case "newest":
                jpql.append(" ORDER BY p.createdAt DESC, p.id");
                break;
            default:
                jpql.append(" ORDER BY COALESCE(p.averageRating, 0) DESC, p.totalReviews DESC, p.id");
                break;
        }

        TypedQuery<Professor> query = em.createQuery(jpql.toString(), Professor.class);
        setParams(query, args);
        query.setFirstResult(args.page * args.size);
        query.setMaxResults(args.size);
        return query.getResultList();
    }

    public long countSearch(SearchArgs args) {
        StringBuilder jpql = new StringBuilder(
                "SELECT COUNT(DISTINCT p) FROM Professor p WHERE p.active = true");
        appendFilters(jpql, args);
        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);
        setParams(query, args);
        return query.getSingleResult();
    }

    private void appendFilters(StringBuilder jpql, SearchArgs args) {
        if (args.cityId != null) {
            jpql.append(" AND p.city.id = :cityId");
        } else if (args.cityName != null && !args.cityName.trim().isEmpty()) {
            jpql.append(" AND p.city.name = :cityName");
        }
        if (args.subjectId != null) {
            jpql.append(" AND :subjectId IN (SELECT s.id FROM p.subjects s)");
        }
        if (args.levelId != null) {
            jpql.append(" AND :levelId IN (SELECT l.id FROM p.levels l)");
        }
        if (args.minRating != null) {
            jpql.append(" AND COALESCE(p.averageRating, 0) >= :minRating");
        }
        if (Boolean.TRUE.equals(args.verifiedOnly)) {
            jpql.append(" AND p.verified = true");
        }
        if (args.minPrice != null || args.maxPrice != null || args.courseType != null) {
            jpql.append(" AND EXISTS (SELECT o FROM p.offers o WHERE o.active = true");
            if (args.minPrice != null) jpql.append(" AND o.price >= :minPrice");
            if (args.maxPrice != null) jpql.append(" AND o.price <= :maxPrice");
            if (args.courseType != null) jpql.append(" AND o.courseType = :courseType");
            jpql.append(")");
        }
    }

    private void setParams(TypedQuery<?> query, SearchArgs args) {
        if (args.cityId != null) query.setParameter("cityId", args.cityId);
        if (args.cityName != null && !args.cityName.trim().isEmpty()) query.setParameter("cityName", args.cityName);
        if (args.subjectId != null) query.setParameter("subjectId", args.subjectId);
        if (args.levelId != null) query.setParameter("levelId", args.levelId);
        if (args.minRating != null) query.setParameter("minRating", args.minRating);
        if (args.minPrice != null) query.setParameter("minPrice", args.minPrice);
        if (args.maxPrice != null) query.setParameter("maxPrice", args.maxPrice);
        if (args.courseType != null) query.setParameter("courseType", com.coursconnect.model.enums.CourseType.valueOf(args.courseType));
    }

    public static class SearchArgs {
        public Long cityId;
        public String cityName;
        public Long subjectId;
        public Long levelId;
        public java.math.BigDecimal minPrice;
        public java.math.BigDecimal maxPrice;
        public java.math.BigDecimal minRating;
        public String courseType;
        public Boolean verifiedOnly;
        public String sortBy = "rating";
        public int page = 0;
        public int size = 12;
    }

    public List<Professor> findTopRated(int limit) {
        return em.createQuery(
            "SELECT p FROM Professor p WHERE p.active = true AND p.verified = true ORDER BY p.averageRating DESC", Professor.class)
                .setMaxResults(limit)
                .getResultList();
    }

    public List<Professor> findBestForHome(int limit) {
        return em.createQuery(
            "SELECT p FROM Professor p WHERE p.active = true AND p.verified = true AND p.totalReviews > 0 ORDER BY p.averageRating DESC, p.totalReviews DESC", Professor.class)
                .setMaxResults(limit)
                .getResultList();
    }

    public Professor save(Professor professor) {
        if (professor.getId() == null) {
            em.persist(professor);
            return professor;
        }
        return em.merge(professor);
    }

    public void delete(Long id) {
        Professor professor = em.find(Professor.class, id);
        if (professor != null) {
            em.remove(professor);
        }
    }

    public void updateRating(Long professorId) {
        Professor professor = em.find(Professor.class, professorId);
        if (professor == null) return;

        TypedQuery<Object[]> q = em.createQuery(
            "SELECT AVG(r.rating), COUNT(r) FROM Review r WHERE r.professor.id = :professorId", Object[].class);
        q.setParameter("professorId", professorId);
        Object[] result = q.getSingleResult();

        if (result[0] != null) {
            professor.setAverageRating(((Number) result[0]).doubleValue() > 0
                    ? BigDecimal.valueOf(((Number) result[0]).doubleValue()).setScale(2, java.math.RoundingMode.HALF_UP)
                    : null);
        } else {
            professor.setAverageRating(null);
        }
        professor.setTotalReviews(((Number) result[1]).intValue());
        em.merge(professor);
    }
}