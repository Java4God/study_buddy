package hr.tvz.nppjj.studybuddy.repository;

import hr.tvz.nppjj.studybuddy.model.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findAllByRoomIdOrderBySentAtDesc(UUID roomId, Pageable pageable);

    @Query("SELECT m FROM ChatMessage m WHERE m.room.id = :roomId AND m.sentAt < :before ORDER BY m.sentAt DESC")
    List<ChatMessage> findOlderMessages(@Param("roomId") UUID roomId,
                                        @Param("before") LocalDateTime before,
                                        Pageable pageable);

    @Modifying
    @Query("DELETE FROM ChatMessage m WHERE m.sentAt < :cutoff")
    int deleteAllOlderThan(@Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.sentAt < :cutoff")
    long countAllOlderThan(@Param("cutoff") LocalDateTime cutoff);
}