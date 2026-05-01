package hr.tvz.nppjj.studybuddy.requests;


import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateUserRequest {

    @Size(min = 3, max = 50)
    private String username;

    @Email
    private String email;
}