package com.coursconnect.repository;

import com.coursconnect.model.Offer;
import com.coursconnect.model.PriceProposal;
import com.coursconnect.model.Professor;
import com.coursconnect.model.Student;
import com.coursconnect.model.enums.PriceProposalStatus;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Stateless
public class PriceProposalRepository {

    @PersistenceContext
    private EntityManager em;

    public PriceProposal findById(Long id) {
        return em.find(PriceProposal.class, id);
    }

    public List<PriceProposal> findByStudentOrderByCreatedAtDesc(Student student) {
        TypedQuery<PriceProposal> q = em.createQuery(
            "SELECT p FROM PriceProposal p WHERE p.student = :student ORDER BY p.createdAt DESC",
            PriceProposal.class);
        q.setParameter("student", student);
        return q.getResultList();
    }

    public List<PriceProposal> findByProfessorOrderByCreatedAtDesc(Professor professor) {
        TypedQuery<PriceProposal> q = em.createQuery(
            "SELECT p FROM PriceProposal p WHERE p.professor = :professor ORDER BY p.createdAt DESC",
            PriceProposal.class);
        q.setParameter("professor", professor);
        return q.getResultList();
    }

    public boolean existsPendingByStudentAndOffer(Student student, Offer offer) {
        TypedQuery<Long> q = em.createQuery(
            "SELECT COUNT(p) FROM PriceProposal p WHERE p.student = :student AND p.offer = :offer AND p.status = :status",
            Long.class);
        q.setParameter("student", student);
        q.setParameter("offer", offer);
        q.setParameter("status", PriceProposalStatus.PENDING);
        return q.getSingleResult() > 0;
    }

    public PriceProposal save(PriceProposal proposal) {
        if (proposal.getId() == null) {
            em.persist(proposal);
            return proposal;
        }
        return em.merge(proposal);
    }
}