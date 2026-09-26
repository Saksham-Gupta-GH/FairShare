package com.saksham.splitr.model;

import jakarta.persistence.*;

@Entity
@Table(name = "friendships", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"requester_email", "friend_email"})
})
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requester_email", nullable = false)
    private String requesterEmail;

    @Column(name = "friend_email", nullable = false)
    private String friendEmail;

    // The display name of the friend (denormalized for quick access)
    private String friendUsername;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRequesterEmail() { return requesterEmail; }
    public void setRequesterEmail(String requesterEmail) { this.requesterEmail = requesterEmail; }
    public String getFriendEmail() { return friendEmail; }
    public void setFriendEmail(String friendEmail) { this.friendEmail = friendEmail; }
    public String getFriendUsername() { return friendUsername; }
    public void setFriendUsername(String friendUsername) { this.friendUsername = friendUsername; }
}
