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
        String shortUrl = urlService.shortenUrl(request.getUrl(), userId);

        ShortenResponse response = new ShortenResponse();
        response.setShortToken(shortUrl);
        return response;
    }
    //If you use your ShortenRequest class, you are telling Spring: "I expect the incoming JSON to perfectly match this exact blueprint."

    @GetMapping
    public List<UrlMapping> getUserUrls(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getClaimAsString("sub");
        return urlService.getUserUrls(userId);
    }
}
/*
1. "ShortenRequest" is just a simple Java class (like a blueprint for a box) that tells 
Spring Boot: "Expect a JSON object that contains a long URL."
2. "@RequestBody" is an instruction to Spring Boot that says: "Take the raw data sent in the HTTP request, 
open it up, and neatly pack it into our ShortenRequest box so we can use it easily in our code."

3.@AuthenticationPrincipal Jwt jwt -> That massive string of random-looking characters next to "access_token" (starting with eyJhbGci...) in your screenshot is the JWT (JSON Web Token).
*/