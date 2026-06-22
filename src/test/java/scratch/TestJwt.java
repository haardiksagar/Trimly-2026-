package scratch;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;

public class TestJwt {
    public static void main(String[] args) {
        try {
            String token = "eyJhbGciOiJFUzI1NiIsImtpZCI6IjNiZjA1M2I4LWVjZDMtNDRmOC04NDY2LTIyY2RjNDY4OThkNCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL21hY2FjdW1lb2FxcGRpZndsbGlyLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5YmUxOTg3NC02MjRmLTQ0ODYtYTJlYS1mOTRhMDgyNjI3MmYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzgyMTEwNjc2LCJpYXQiOjE3ODIxMDcwNzYsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzgyMTA3MDc2fV0sInNlc3Npb25faWQiOiIzZDA5ZTQ2ZC04N2JiLTQwMzUtYmNiMy0xODU3Y2QzNTgzNmIiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.ZsR8MlN26nuUDdtCrKDUTrjeGY-jVe6amDn2mK1Tb6hwB2tJcP10UPMvAWEM7gfhXwOpYzZZMJp95kH1XjuTMA";
            String jwkSetUri = "https://macacumeoaqpdifwllir.supabase.co/auth/v1/.well-known/jwks.json";
            
            JwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri)
                    .jwsAlgorithm(SignatureAlgorithm.ES256)
                    .build();
            
            Jwt jwt = decoder.decode(token);
            System.out.println("SUCCESS! Token Decoded: " + jwt.getClaims());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
