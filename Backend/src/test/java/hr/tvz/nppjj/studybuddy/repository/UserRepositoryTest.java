package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.enumerators.Role;
import hr.tvz.nppjj.studybuddy.model.User;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
class UserRepositoryTest {
    @Autowired
    UserRepository userRepository;
    private User user;

    @BeforeEach
    void setup(){
        user = userRepository.save(new User(null, "testuser", "testuser@tvz.hr", "password",
                Role.ROLE_BASIC_USER));
    }

    @Test
    void findUserByEmail() {
        Optional<User> userOptional = userRepository.findUserByEmail(user.getEmail());
        assertThat(userOptional).isPresent();
    }

    @Test
    void findUserById() {
        Optional<User> userOptional = userRepository.findUserById(user.getId());
        assertThat(userOptional).isPresent();
    }

    @Test
    @Order(2)
    void findUserByUsername() {
        Optional<User> userOptional = userRepository.findUserByUsername(user.getUsername());
        assertThat(userOptional).isPresent();
    }

}
