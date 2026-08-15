package CongoDB;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.neo4j.driver.Session;
import org.neo4j.driver.Values;

import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CognoDBLoader {

    private static final int BATCH_SIZE = 1000;

    public static void main(String[] args) throws Exception {

        String uri = System.getenv("COGNODB_URI");
        String username = System.getenv("COGNODB_USERNAME");
        String password = System.getenv("COGNODB_PASSWORD");

        if (uri == null || username == null || password == null) {
            throw new RuntimeException(
                    "CognoDB environment variables are missing."
            );
        }

        Path usersFile = Paths.get(
                "data/benchmark/users.csv"
        );

        Path relationshipsFile = Paths.get(
                "data/benchmark/relationships.csv"
        );

        try (Driver driver = GraphDatabase.driver(
                uri,
                AuthTokens.basic(username, password))) {

            driver.verifyConnectivity();

            System.out.println("Connected to CognoDB!");

            // -----------------------------------------
            // 1. Create index
            // -----------------------------------------

            createIndex(driver);

            // -----------------------------------------
            // 2. Load users
            // -----------------------------------------

            long startTime = System.nanoTime();

            int usersLoaded = loadUsers(
                    driver,
                    usersFile
            );

            long afterUsers = System.nanoTime();

            // -----------------------------------------
            // 3. Load relationships
            // -----------------------------------------

            int relationshipsLoaded = loadRelationships(
                    driver,
                    relationshipsFile
            );

            long endTime = System.nanoTime();

            double userTime =
                    (afterUsers - startTime)
                            / 1_000_000_000.0;

            double totalTime =
                    (endTime - startTime)
                            / 1_000_000_000.0;

            double relationshipTime =
                    totalTime - userTime;

            // -----------------------------------------
            // 4. Results
            // -----------------------------------------

            System.out.println();
            System.out.println("========== LOADING COMPLETE ==========");

            System.out.println(
                    "Users loaded: " + usersLoaded
            );

            System.out.println(
                    "Relationships loaded: "
                            + relationshipsLoaded
            );

            System.out.printf(
                    "User loading time: %.3f seconds%n",
                    userTime
            );

            System.out.printf(
                    "Relationship loading time: %.3f seconds%n",
                    relationshipTime
            );

            System.out.printf(
                    "Total loading time: %.3f seconds%n",
                    totalTime
            );

            // -----------------------------------------
            // 5. Verify database
            // -----------------------------------------

            verifyDatabase(driver);
        }
    }

    // =====================================================
    // CREATE INDEX
    // =====================================================

    private static void createIndex(Driver driver) {

        try (Session session = driver.session()) {

            session.run(
                    "CREATE INDEX user_id_index IF NOT EXISTS " +
                            "FOR (u:User) ON (u.user_id)"
            ).consume();

            System.out.println(
                    "User index created."
            );
        }
    }

    // =====================================================
    // LOAD USERS
    // =====================================================

    private static int loadUsers(
            Driver driver,
            Path file
    ) throws Exception {

        int totalLoaded = 0;

        try (BufferedReader reader =
                     Files.newBufferedReader(file)) {

            // Skip CSV header
            reader.readLine();

            List<Map<String, Object>> batch =
                    new ArrayList<>(BATCH_SIZE);

            String line;

            while ((line = reader.readLine()) != null) {

                if (line.isBlank()) {
                    continue;
                }

                /*
                 * CSV format:
                 *
                 * user_id,name,gender,age,region,source
                 */

                String[] parts = line.split(",", -1);

                if (parts.length != 6) {
                    throw new RuntimeException(
                            "Invalid user row: " + line
                    );
                }

                long userId =
                        Long.parseLong(parts[0].trim());

                String name =
                        parseNullableString(parts[1]);

                Integer gender =
                        parseNullableInt(parts[2]);

                Integer age =
                        parseNullableInt(parts[3]);

                String region =
                        parseNullableString(parts[4]);

                String source =
                        parseNullableString(parts[5]);

                Map<String, Object> user =
                        new HashMap<>();

                user.put("user_id", userId);
                user.put("name", name);
                user.put("gender", gender);
                user.put("age", age);
                user.put("region", region);
                user.put("source", source);

                batch.add(user);

                if (batch.size() == BATCH_SIZE) {

                    insertUsers(
                            driver,
                            batch
                    );

                    totalLoaded += batch.size();

                    System.out.println(
                            "Users loaded: "
                                    + totalLoaded
                    );

                    batch.clear();
                }
            }

            // Last batch
            if (!batch.isEmpty()) {

                insertUsers(
                        driver,
                        batch
                );

                totalLoaded += batch.size();

                System.out.println(
                        "Users loaded: "
                                + totalLoaded
                );
            }
        }

        return totalLoaded;
    }

    // =====================================================
    // INSERT USERS
    // =====================================================

    private static void insertUsers(
            Driver driver,
            List<Map<String, Object>> users
    ) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run(
                        """
                        UNWIND $users AS user

                        CREATE (:User {
                            user_id: user.user_id,
                            name: user.name,
                            gender: user.gender,
                            age: user.age,
                            region: user.region,
                            source: user.source
                        })
                        """,
                        Values.parameters(
                                "users",
                                users
                        )
                ).consume();

                return null;
            });
        }
    }

    // =====================================================
    // LOAD RELATIONSHIPS
    // =====================================================

    private static int loadRelationships(
            Driver driver,
            Path file
    ) throws Exception {

        int totalLoaded = 0;

        try (BufferedReader reader =
                     Files.newBufferedReader(file)) {

            // Skip CSV header
            reader.readLine();

            List<Map<String, Object>> batch =
                    new ArrayList<>(BATCH_SIZE);

            String line;

            while ((line = reader.readLine()) != null) {

                if (line.isBlank()) {
                    continue;
                }

                /*
                 * CSV format:
                 *
                 * source_user_id,target_user_id
                 */

                String[] parts = line.split(",", -1);

                if (parts.length != 2) {
                    throw new RuntimeException(
                            "Invalid relationship row: "
                                    + line
                    );
                }

                long source =
                        Long.parseLong(parts[0].trim());

                long target =
                        Long.parseLong(parts[1].trim());

                if (source == target) {
                    throw new RuntimeException(
                            "Self relationship detected: "
                                    + source
                    );
                }

                Map<String, Object> relationship =
                        new HashMap<>();

                relationship.put(
                        "source",
                        source
                );

                relationship.put(
                        "target",
                        target
                );

                batch.add(relationship);

                if (batch.size() == BATCH_SIZE) {

                    insertRelationships(
                            driver,
                            batch
                    );

                    totalLoaded += batch.size();

                    System.out.println(
                            "Relationships loaded: "
                                    + totalLoaded
                    );

                    batch.clear();
                }
            }

            // Last batch
            if (!batch.isEmpty()) {

                insertRelationships(
                        driver,
                        batch
                );

                totalLoaded += batch.size();

                System.out.println(
                        "Relationships loaded: "
                                + totalLoaded
                );
            }
        }

        return totalLoaded;
    }

    // =====================================================
    // INSERT RELATIONSHIPS
    // =====================================================

    private static void insertRelationships(
            Driver driver,
            List<Map<String, Object>> relationships
    ) {

        try (Session session = driver.session()) {

            session.executeWrite(tx -> {

                tx.run(
                        """
                        UNWIND $relationships AS rel

                        MATCH (a:User {
                            user_id: rel.source
                        })

                        MATCH (b:User {
                            user_id: rel.target
                        })

                        MERGE (a)-[:FRIEND]->(b)
                        """,
                        Values.parameters(
                                "relationships",
                                relationships
                        )
                ).consume();

                return null;
            });
        }
    }

    // =====================================================
    // VERIFY DATABASE
    // =====================================================

    private static void verifyDatabase(
            Driver driver
    ) {

        try (Session session = driver.session()) {

            long users =
                    session.run(
                                    """
                                    MATCH (u:User)
                                    RETURN count(u) AS count
                                    """
                            )
                            .single()
                            .get("count")
                            .asLong();

            long relationships =
                    session.run(
                                    """
                                    MATCH ()-[r:FRIEND]->()
                                    RETURN count(r) AS count
                                    """
                            )
                            .single()
                            .get("count")
                            .asLong();

            System.out.println();
            System.out.println(
                    "========== VERIFICATION =========="
            );

            System.out.println(
                    "Users in CognoDB: "
                            + users
            );

            System.out.println(
                    "Relationships in CognoDB: "
                            + relationships
            );

            if (users == 1000 &&
                    relationships == 5000) {

                System.out.println(
                        "DATABASE VERIFICATION PASSED"
                );

            } else {

                System.out.println(
                        "DATABASE VERIFICATION FAILED"
                );
            }
        }
    }

    // =====================================================
    // HELPERS
    // =====================================================

    private static Integer parseNullableInt(
            String value
    ) {

        value = value.trim();

        if (value.equalsIgnoreCase("null") ||
                value.isEmpty()) {

            return null;
        }

        return Integer.parseInt(value);
    }

    private static String parseNullableString(
            String value
    ) {

        value = value.trim();

        if (value.equalsIgnoreCase("null") ||
                value.isEmpty()) {

            return null;
        }

        // Remove surrounding CSV quotes
        if (value.startsWith("\"") &&
                value.endsWith("\"")) {

            value = value.substring(
                    1,
                    value.length() - 1
            );
        }

        // CSV escaped quotes
        return value.replace(
                "\"\"",
                "\""
        );
    }
}