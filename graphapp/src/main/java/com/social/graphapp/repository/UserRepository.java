package com.social.graphapp.repository;

import com.social.graphapp.model.User;
import org.neo4j.driver.Driver;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.neo4j.driver.exceptions.Neo4jException;
import com.social.graphapp.model.CreateUserRequest;

@Repository
public class UserRepository {

    private final Driver driver;

    public UserRepository(Driver driver) {
        this.driver = driver;
    }

    public User createUser(long userId, CreateUserRequest user) {

        String cypher = """
        CREATE (u:User {
            user_id: $userId,
            name: $name,
            gender: $gender,
            age: $age,
            region: $region,
            source: $source
        })
        RETURN u
        """;

        try (var session = driver.session()) {

            var record = session.run(
                    cypher,
                    java.util.Map.of(
                            "userId", userId,
                            "name", user.name(),
                            "gender", user.gender(),
                            "age", user.age(),
                            "region", user.region(),
                            "source", "application"
                    )
            ).single();

            var node = record.get("u").asNode();

            return new User(
                    node.get("user_id").asLong(),
                    node.get("name").asString(),
                    node.get("gender").asInt(),
                    node.get("age").asInt(),
                    node.get("region").asString(),
                    node.get("source").asString()
            );

        } catch (Neo4jException e) {

            if ("Neo.ClientError.Schema.ConstraintValidationFailed".equals(e.code())) {
                throw new IllegalArgumentException("User ID already exists");
            }

            throw e;
        }
    }

    public long generateUserId() {

        String cypher = """
        MATCH (u:User)
        RETURN coalesce(max(u.user_id), 100000) + 1 AS nextId
        """;

        try (var session = driver.session()) {

            return session.run(cypher)
                    .single()
                    .get("nextId")
                    .asLong();
        }
    }

    public User getUserById(long userId) {

        String cypher = """
            MATCH (u:User {user_id: $userId})
            RETURN u
            """;

        try (var session = driver.session()) {

            var result = session.run(
                    cypher,
                    java.util.Map.of("userId", userId)
            );

            if (!result.hasNext()) {
                return null;
            }

            var record = result.single();
            var node = record.get("u").asNode();

            String name = node.containsKey("name")
                    && !node.get("name").isNull()
                    ? node.get("name").asString()
                    : null;

            Integer gender = node.containsKey("gender")
                    && !node.get("gender").isNull()
                    ? node.get("gender").asInt()
                    : null;

            Integer age = node.containsKey("age")
                    && !node.get("age").isNull()
                    ? node.get("age").asInt()
                    : null;

            String region = node.containsKey("region")
                    && !node.get("region").isNull()
                    ? node.get("region").asString()
                    : null;

            String source = node.containsKey("source")
                    && !node.get("source").isNull()
                    ? node.get("source").asString()
                    : null;

            return new User(
                    node.get("user_id").asLong(),
                    name,
                    gender,
                    age,
                    region,
                    source
            );
        }
    }

    public String addFriend(long userId, long friendId) {

        String cypher = """
        MATCH (u:User)
        WHERE u.user_id IN [$userId, $friendId]
        RETURN collect(u.user_id) AS ids
        """;

        try (var session = driver.session()) {

            var record = session.run(
                    cypher,
                    java.util.Map.of(
                            "userId", userId,
                            "friendId", friendId
                    )
            ).single();

            var ids = record.get("ids").asList(v -> v.asLong());

            boolean userExists = ids.contains(userId);
            boolean friendExists = ids.contains(friendId);

            if (!userExists) {
                return "USER_NOT_FOUND";
            }

            if (!friendExists) {
                return "FRIEND_NOT_FOUND";
            }

            if (userId == friendId) {
                return "SAME_USER";
            }

            String addCypher = """
            MATCH (u:User {user_id: $userId})
            MATCH (f:User {user_id: $friendId})
            MERGE (u)-[:FRIEND]->(f)
            """;

            session.run(
                    addCypher,
                    java.util.Map.of(
                            "userId", userId,
                            "friendId", friendId
                    )
            ).consume();

            return "SUCCESS";
        }
    }

    public boolean removeFriend(long userId, long friendId) {

        String cypher = """
        MATCH (u:User {user_id: $userId})
              -[r:FRIEND]->
              (f:User {user_id: $friendId})
        DELETE r
        """;

        try (var session = driver.session()) {

            var result = session.run(
                    cypher,
                    Map.of(
                            "userId", userId,
                            "friendId", friendId
                    )
            );

            return result.consume()
                    .counters()
                    .relationshipsDeleted() > 0;
        }
    }

    public List<User> getFriends(long userId) {

        String cypher = """
            MATCH (u:User {user_id: $userId})-[:FRIEND]->(friend:User)
            RETURN friend
            """;

        try (var session = driver.session()) {

            var result = session.run(
                    cypher,
                    java.util.Map.of("userId", userId)
            );

            List<User> friends = new ArrayList<>();

            while (result.hasNext()) {

                var record = result.next();
                var node = record.get("friend").asNode();

                String name = node.containsKey("name")
                        && !node.get("name").isNull()
                        ? node.get("name").asString()
                        : null;

                Integer gender = node.containsKey("gender")
                        && !node.get("gender").isNull()
                        ? node.get("gender").asInt()
                        : null;

                Integer age = node.containsKey("age")
                        && !node.get("age").isNull()
                        ? node.get("age").asInt()
                        : null;

                String region = node.containsKey("region")
                        && !node.get("region").isNull()
                        ? node.get("region").asString()
                        : null;

                String source = node.containsKey("source")
                        && !node.get("source").isNull()
                        ? node.get("source").asString()
                        : null;

                friends.add(new User(
                        node.get("user_id").asLong(),
                        name,
                        gender,
                        age,
                        region,
                        source
                ));
            }

            return friends;
        }
    }

    public List<User> getFriendRecommendations(long userId) {

        String cypher = """
        MATCH (u:User {user_id: $userId})
              -[:FRIEND]->()
              -[:FRIEND]->(recommendation:User)

        OPTIONAL MATCH (u)-[:FRIEND]->(directFriend)

        WITH u, recommendation, collect(directFriend) AS directFriends

        WHERE recommendation.user_id <> $userId
          AND NOT recommendation IN directFriends

        RETURN DISTINCT recommendation
        LIMIT 10
        """;

        try (var session = driver.session()) {

            var result = session.run(
                    cypher,
                    java.util.Map.of("userId", userId)
            );

            List<User> recommendations = new ArrayList<>();

            while (result.hasNext()) {

                var record = result.next();
                var node = record.get("recommendation").asNode();

                String name = node.containsKey("name")
                        && !node.get("name").isNull()
                        ? node.get("name").asString()
                        : null;

                Integer gender = node.containsKey("gender")
                        && !node.get("gender").isNull()
                        ? node.get("gender").asInt()
                        : null;

                Integer age = node.containsKey("age")
                        && !node.get("age").isNull()
                        ? node.get("age").asInt()
                        : null;

                String region = node.containsKey("region")
                        && !node.get("region").isNull()
                        ? node.get("region").asString()
                        : null;

                String source = node.containsKey("source")
                        && !node.get("source").isNull()
                        ? node.get("source").asString()
                        : null;

                recommendations.add(new User(
                        node.get("user_id").asLong(),
                        name,
                        gender,
                        age,
                        region,
                        source
                ));
            }

            return recommendations;
        }
    }

    public boolean deleteUser(long userId) {

        String cypher = """
            MATCH (u:User {user_id: $userId})
            DETACH DELETE u
            """;

        try (var session = driver.session()) {

            var result = session.run(
                    cypher,
                    java.util.Map.of("userId", userId)
            );

            return result.consume().counters().nodesDeleted() > 0;
        }
    }

    public List<User> searchUsers(String query) {

        String cypher = """
        MATCH (u:User)
        WHERE toLower(u.name) CONTAINS toLower($query)
           OR toString(u.user_id) STARTS WITH $query
        RETURN u
        LIMIT 20
        """;

        try (var session = driver.session()) {

            var result = session.run(
                    cypher,
                    java.util.Map.of("query", query)
            );

            List<User> users = new ArrayList<>();

            while (result.hasNext()) {

                var node = result.next()
                        .get("u")
                        .asNode();

                users.add(new User(
                        node.get("user_id").asLong(),
                        node.get("name").asString(),
                        node.get("gender").asInt(),
                        node.get("age").asInt(),
                        node.get("region").asString(),
                        node.get("source").asString()
                ));
            }

            return users;
        }
    }

    public boolean areFriends(long userId, long friendId) {

        String cypher = """
        MATCH (u:User {user_id: $userId})
        MATCH (f:User {user_id: $friendId})
        MATCH (u)-[:FRIEND]->(f)
        RETURN count(*) AS relationshipCount
        """;

        try (var session = driver.session()) {

            var result = session.run(
                    cypher,
                    Map.of(
                            "userId", userId,
                            "friendId", friendId
                    )
            );

            if (!result.hasNext()) {
                return false;
            }

            long count = result.single()
                    .get("relationshipCount")
                    .asLong();

            return count > 0;
        }
    }

    public List<User> getRandomUsers(long userId) {

        String cypher = """
        MATCH (me:User {user_id: $userId})
        MATCH (u:User)
        WHERE u <> me
          AND NOT (me)-[:FRIEND]->(u)
        RETURN u
        LIMIT 10
        """;

        try (var session = driver.session()) {

            var result = session.run(
                    cypher,
                    java.util.Map.of("userId", userId)
            );

            List<User> users = new ArrayList<>();

            while (result.hasNext()) {

                var node = result.next()
                        .get("u")
                        .asNode();

                users.add(new User(
                        node.get("user_id").asLong(),
                        node.get("name").asString(),
                        node.get("gender").asInt(),
                        node.get("age").asInt(),
                        node.get("region").asString(),
                        node.get("source").asString()
                ));
            }

            return users;
        }
    }

    public List<User> getRandomUsersForVisitor() {

        String cypher = """
        MATCH (u:User)
        RETURN u
        LIMIT 10
        """;

        try (var session = driver.session()) {

            var result = session.run(cypher);

            List<User> users = new ArrayList<>();

            while (result.hasNext()) {

                var node = result.next()
                        .get("u")
                        .asNode();

                users.add(new User(
                        node.get("user_id").asLong(),
                        node.get("name").asString(),
                        node.get("gender").asInt(),
                        node.get("age").asInt(),
                        node.get("region").asString(),
                        node.get("source").asString()
                ));
            }

            return users;
        }
    }


}