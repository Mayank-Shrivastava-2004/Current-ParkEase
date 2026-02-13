package com.parkease.backend.config;

import com.parkease.backend.entity.User;
import com.parkease.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

        @Autowired
        private JwtService jwtService;

        @Autowired
        private UserRepository userRepository;

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain) throws ServletException, IOException {

                String authHeader = request.getHeader("Authorization");

                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        filterChain.doFilter(request, response);
                        return;
                }

                String jwt = authHeader.substring(7);
                String userEmail = jwtService.extractUsername(jwt);

                if (userEmail != null &&
                                SecurityContextHolder.getContext().getAuthentication() == null) {

                        User user = userRepository.findByEmail(userEmail).orElse(null);

                        if (user == null) {
                                System.out.println("❌ JWT Filter: User not found in DB for email: " + userEmail);
                        } else if (jwtService.isTokenValid(jwt, user)) {

                                // ✅ ROLE RESOLUTION
                                String role = "ROLE_" + user.getRole().name();

                                // 🔥 DEBUG (THIS IS THE IMPORTANT ADDITION)
                                System.out.println("✅ JWT Filter: Authorized " + userEmail + " with role " + role);

                                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                                user,
                                                null,
                                                List.of(new SimpleGrantedAuthority(role)));

                                authToken.setDetails(
                                                new WebAuthenticationDetailsSource()
                                                                .buildDetails(request));

                                SecurityContextHolder.getContext()
                                                .setAuthentication(authToken);
                        }
                }

                filterChain.doFilter(request, response);
        }
}
