package com.url_shortner.url_shortner.Repository;

import com.url_shortner.url_shortner.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Locale;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    default Optional<User> findByEmail(String email) {
        return email == null
                ? Optional.empty()
                : findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT));
    }

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
