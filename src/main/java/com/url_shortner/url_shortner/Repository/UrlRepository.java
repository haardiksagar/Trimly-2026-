package com.url_shortner.url_shortner.Repository;

import com.url_shortner.url_shortner.Entities.UrlMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<UrlMapping, Long> {
    Optional<UrlMapping> findByShortToken(String shortToken);
    List<UrlMapping> findByUserId(String userId);
}
