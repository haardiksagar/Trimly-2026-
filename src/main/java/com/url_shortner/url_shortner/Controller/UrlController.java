package com.url_shortner.url_shortner.Controller;

import com.url_shortner.url_shortner.DTO.ShortenRequest;
import com.url_shortner.url_shortner.DTO.ShortenResponse;
import com.url_shortner.url_shortner.Services.UrlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.List;
import com.url_shortner.url_shortner.Entities.UrlMapping;

@RestController
@RequestMapping("/api/urls")
public class UrlController {

    @Autowired
    private UrlService urlService;

    @PostMapping
    public ShortenResponse shortenUrl(@RequestBody ShortenRequest request, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        String token = urlService.shortenUrl(request.getUrl(), userId);

        ShortenResponse response = new ShortenResponse();
        response.setShortToken(token);
        return response;
    }

    @GetMapping
    public List<UrlMapping> getUserUrls(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        return urlService.getUserUrls(userId);
    }
}
