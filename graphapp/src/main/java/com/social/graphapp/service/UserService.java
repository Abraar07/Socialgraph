package com.social.graphapp.service;

import com.social.graphapp.model.User;
import com.social.graphapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import com.social.graphapp.model.CreateUserRequest;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(CreateUserRequest request) {

        long userId = userRepository.generateUserId();

        return userRepository.createUser(userId, request);
    }

    public List<User> searchUsers(String name) {
        return userRepository.searchUsers(name);
    }

    public User getUserById(long userId) {
        return userRepository.getUserById(userId);
    }

    public String addFriend(long userId, long friendId) {
        return userRepository.addFriend(userId, friendId);
    }

    public boolean removeFriend(long userId, long friendId) {
        return userRepository.removeFriend(userId, friendId);
    }

    public boolean areFriends(long userId, long friendId) {
        return userRepository.areFriends(userId, friendId);
    }

    public List<User> getFriends(long userId) {
        return userRepository.getFriends(userId);
    }

    public List<User> getFriendRecommendations(long userId) {
        return userRepository.getFriendRecommendations(userId);
    }

    public boolean deleteUser(long userId) {
        return userRepository.deleteUser(userId);
    }

    public List<User> getRandomUsers(long userId) {
        return userRepository.getRandomUsers(userId);
    }

    public List<User> getRandomUsersForVisitor() {
        return userRepository.getRandomUsersForVisitor();
    }

    public List<User> getDiscoverUsers(long userId) {

        List<User> friends = getFriends(userId);

        if (friends.isEmpty()) {
            return userRepository.getRandomUsers(userId);
        }

        return getFriendRecommendations(userId);
    }
}