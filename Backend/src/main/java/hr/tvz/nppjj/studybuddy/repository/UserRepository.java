package hr.tvz.nppjj.studybuddy.repository;


import hr.tvz.nppjj.studybuddy.model.User;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>{
    Optional<User> findUserByEmail(String email);
    Optional<User> findUserById(UUID uuid);
    Optional<User> findUserByUsername(String username);
}
