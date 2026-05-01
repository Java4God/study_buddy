package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.model.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, UUID> {
    boolean existsByTokenHash(String tokenHash);
}