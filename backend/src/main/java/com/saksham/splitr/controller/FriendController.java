package com.saksham.splitr.controller;

import com.saksham.splitr.model.Friendship;
import com.saksham.splitr.model.User;
import com.saksham.splitr.repository.FriendshipRepository;
import com.saksham.splitr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin(origins = "*")
public class FriendController {

    @Autowired private FriendshipRepository friendshipRepository;
    @Autowired private UserRepository userRepository;

    // Add a friend by email
    @PostMapping("/add")
    public ResponseEntity<?> addFriend(@RequestBody Map<String, String> payload) {
        String requesterEmail = payload.get("requesterEmail");
        String friendEmail = payload.get("friendEmail");

        if (requesterEmail == null || friendEmail == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both emails are required"));
        }
        if (requesterEmail.equals(friendEmail)) {
            return ResponseEntity.badRequest().body(Map.of("error", "You cannot add yourself as a friend"));
        }

        Optional<User> friendUser = userRepository.findByEmail(friendEmail);
        if (friendUser.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No user found with that email"));
        }

        if (friendshipRepository.findByRequesterEmailAndFriendEmail(requesterEmail, friendEmail).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already friends"));
        }

        // Add friendship both ways so both can see each other
        Friendship f1 = new Friendship();
        f1.setRequesterEmail(requesterEmail);
        f1.setFriendEmail(friendEmail);
        f1.setFriendUsername(friendUser.get().getUsername() != null ? friendUser.get().getUsername() : friendEmail);
        friendshipRepository.save(f1);

        // Also add reverse so friend can see current user
        Optional<User> requesterUser = userRepository.findByEmail(requesterEmail);
        if (friendshipRepository.findByRequesterEmailAndFriendEmail(friendEmail, requesterEmail).isEmpty()) {
            Friendship f2 = new Friendship();
            f2.setRequesterEmail(friendEmail);
            f2.setFriendEmail(requesterEmail);
            f2.setFriendUsername(requesterUser.map(User::getUsername).orElse(requesterEmail));
            friendshipRepository.save(f2);
        }

        return ResponseEntity.ok(f1);
    }

    // Get all friends for a user
    @GetMapping("/{email}")
    public ResponseEntity<List<Friendship>> getFriends(@PathVariable String email) {
        List<Friendship> friends = friendshipRepository.findByRequesterEmail(email);
        return ResponseEntity.ok(friends);
    }
}
