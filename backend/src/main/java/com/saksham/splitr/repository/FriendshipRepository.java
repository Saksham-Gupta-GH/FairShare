package com.saksham.splitr.repository;

import com.saksham.splitr.model.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findByRequesterEmail(String requesterEmail);
    Optional<Friendship> findByRequesterEmailAndFriendEmail(String requesterEmail, String friendEmail);
}
