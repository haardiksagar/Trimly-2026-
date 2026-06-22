package com.url_shortner.url_shortner.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "url_mapping_data")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UrlMapping {
    @Id
    @Column(name = "id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "original_url", unique = true)
    private String originalUrl;
    @Column(name = "short_token")
    private String shortToken;
    @Column(name = "click_count")
    private Long clickCount;
    @Column(name = "time_created")
    private LocalDateTime createdAt;
    @Column(name = "external_ID")
    private UUID externalID;
    
    @Column(name = "user_id")
    private String userId;
}
