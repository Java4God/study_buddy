package hr.tvz.nppjj.studybuddy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "study_room")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Room name is required")
    @Size(max = 100, message = "Room name must be at most 100 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @NotBlank(message = "Subject is required")
    @Size(max = 50, message = "Subject must be at most 50 characters")
    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "access_code", nullable = false, unique = true)
    private String accessCode;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;

    @Size(max = 500, message = "Description must be at most 500 characters")
    @Column(name = "description")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomMember> members = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}