package com.saksham.splitr.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
public class Expense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private Double amount;
    
    private String paidByEmail;
    private String splitWithEmail;
    
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    
    public String getPaidByEmail() { return paidByEmail; }
    public void setPaidByEmail(String paidByEmail) { this.paidByEmail = paidByEmail; }
    
    public String getSplitWithEmail() { return splitWithEmail; }
    public void setSplitWithEmail(String splitWithEmail) { this.splitWithEmail = splitWithEmail; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
