package com.url_shortner.url_shortner.Services;

import com.url_shortner.url_shortner.Entities.UrlMapping;
import com.url_shortner.url_shortner.Exceptions.UrlNotFoundException;
import com.url_shortner.url_shortner.Repository.UrlRepository;
import com.url_shortner.url_shortner.Util.Base62Encoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UrlService {

    @Autowired
    private UrlRepository urlRepository;

    public String shortenUrl(String longUrl, String userId) {
        UrlMapping mapping = new UrlMapping();
        mapping.setOriginalUrl(longUrl);
        mapping.setClickCount(0L);
        mapping.setCreatedAt(LocalDateTime.now());
        mapping.setUserId(userId);

        UrlMapping saved = urlRepository.save(mapping);
        String token = Base62Encoder.encode(saved.getId());
        saved.setShortToken(token);
        urlRepository.save(saved);

        return token;
    }

    public String getOriginalUrl(String shortToken) {
        UrlMapping mapping = urlRepository.findByShortToken(shortToken)
                .orElseThrow(() -> new UrlNotFoundException(shortToken));

        mapping.setClickCount(mapping.getClickCount() + 1);
        urlRepository.save(mapping);

        return mapping.getOriginalUrl();
    }

    public List<UrlMapping> getUserUrls(String userId) {
        return urlRepository.findByUserId(userId);
    }
}
