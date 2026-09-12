package com.coursconnect.dto;

public class AdminStatsDTO {

    private long totalUsers;
    private long totalStudents;
    private long totalProfessors;
    private long totalVerified;
    private long totalOffers;
    private long totalBookings;
    private long totalPendingBookings;
    private long totalReviews;

    public AdminStatsDTO() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }
    public long getTotalProfessors() { return totalProfessors; }
    public void setTotalProfessors(long totalProfessors) { this.totalProfessors = totalProfessors; }
    public long getTotalVerified() { return totalVerified; }
    public void setTotalVerified(long totalVerified) { this.totalVerified = totalVerified; }
    public long getTotalOffers() { return totalOffers; }
    public void setTotalOffers(long totalOffers) { this.totalOffers = totalOffers; }
    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    public long getTotalPendingBookings() { return totalPendingBookings; }
    public void setTotalPendingBookings(long totalPendingBookings) { this.totalPendingBookings = totalPendingBookings; }
    public long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(long totalReviews) { this.totalReviews = totalReviews; }
}