package hr.tvz.nppjj.studybuddy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "STUDY_ROOMS")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudyRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @NotBlank(message = "Name must be entered")
    private String name;
    @NotBlank(message = "Name must be given")
    private String topic;
    @Column(name = "invite_code")
    private String inviteCode;
    @Column(name = "is_active")
    private Boolean isActive;
}
