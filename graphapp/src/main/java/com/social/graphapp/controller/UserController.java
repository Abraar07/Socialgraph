package com.social.graphapp.controller;

import com.social.graphapp.model.CreateUserRequest;
import com.social.graphapp.model.User;
import com.social.graphapp.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody CreateUserRequest request) {

        try {

            User createdUser = userService.createUser(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(createdUser);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public List<User> searchUsers(
            @RequestParam String query) {

        return userService.searchUsers(query);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserById(@PathVariable long userId) {

        User user = userService.getUserById(userId);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(user);
    }

    @PostMapping("/{userId}/friends/{friendId}")
    public ResponseEntity<String> addFriend(
            @PathVariable long userId,
            @PathVariable long friendId) {

        String result = userService.addFriend(userId, friendId);

        switch (result) {

            case "USER_NOT_FOUND":
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("User " + userId + " not found");

            case "FRIEND_NOT_FOUND":
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("User " + friendId + " not found");

            case "SAME_USER":
                return ResponseEntity
                        .badRequest()
                        .body("You cannot add yourself as a friend");

            case "SUCCESS":
                return ResponseEntity.ok("Friend added successfully");

            default:
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Unable to add friend");
        }
    }

    @DeleteMapping("/{userId}/friends/{friendId}")
    public ResponseEntity<String> removeFriend(
            @PathVariable long userId,
            @PathVariable long friendId) {

        boolean removed = userService.removeFriend(userId, friendId);

        if (!removed) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Friend relationship not found");
        }

        return ResponseEntity.ok("Friend removed successfully");
    }

    @GetMapping("/{userId}/friends/{friendId}/status")
    public ResponseEntity<Map<String, Boolean>> getFriendStatus(
            @PathVariable long userId,
            @PathVariable long friendId) {

        boolean friends = userService.areFriends(userId, friendId);

        return ResponseEntity.ok(
                Map.of("friends", friends)
        );
    }

    @GetMapping("/{userId}/friends")
    public List<User> getFriends(@PathVariable long userId) {
        return userService.getFriends(userId);
    }

    @GetMapping("/{userId}/recommendations")
    public List<User> getFriendRecommendations(@PathVariable long userId) {
        return userService.getFriendRecommendations(userId);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable long userId) {

        boolean deleted = userService.deleteUser(userId);

        if (!deleted) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User " + userId + " not found");
        }

        return ResponseEntity.ok("User deleted successfully");
    }

    @GetMapping("/discover")
    public List<User> discoverUsers(
            @RequestParam(required = false) Long userId) {

        if (userId == null) {
            return userService.getRandomUsersForVisitor();
        }

        return userService.getDiscoverUsers(userId);
    }


}