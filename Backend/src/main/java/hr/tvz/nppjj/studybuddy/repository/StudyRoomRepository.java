package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.model.StudyRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudyRoomRepository extends JpaRepository<StudyRoom, UUID> {

    Optional<StudyRoom> findByAccessCode(String accessCode);

    boolean existsByAccessCode(String accessCode);

    List<StudyRoom> findAllByIsPublicTrueOrderByCreatedAtDesc();

    List<StudyRoom> findAllByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
}