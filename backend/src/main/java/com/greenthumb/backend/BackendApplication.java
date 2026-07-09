package com.greenthumb.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

// UserDetailsServiceAutoConfiguration is excluded because auth is entirely self-issued JWTs
// (see AuthService/JwtAuthenticationFilter) - there's no UserDetailsService/AuthenticationManager
// in this app, so Boot's default in-memory user + generated password would otherwise be noise.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
