package hr.tvz.nppjj.studybuddy.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hr.tvz.nppjj.studybuddy.dto.FlashcardDTO;
import hr.tvz.nppjj.studybuddy.model.Flashcard;
import hr.tvz.nppjj.studybuddy.service.FlashcardService;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("flashcards")
@CrossOrigin(origins = "http://localhost:3000")
public class FlashcardController {
    private final FlashcardService flashcardService;

    public FlashcardController(@Qualifier("db") FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<FlashcardDTO> getById(@PathVariable UUID uuid){
        return flashcardService.findById(uuid).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<FlashcardDTO> getAll(){
        return flashcardService.findAll();
    }

    @PostMapping("/new")
    public ResponseEntity<FlashcardDTO> newFlashcard(@RequestBody Flashcard flashcard){
        return flashcardService.newFlashcard(flashcard).map(ResponseEntity::ok)
                .orElseGet(()-> ResponseEntity.badRequest().build());
    }

    @PutMapping("/update/{uuid}")
    public ResponseEntity<FlashcardDTO> updateFlashcard(@RequestBody FlashcardDTO flashcardDTO, @PathVariable UUID uuid){
        return flashcardService.updateFlashcard(uuid, flashcardDTO).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @DeleteMapping("/delete/{uuid}")
    public ResponseEntity<?> deleteFlashcard(@PathVariable UUID uuid){
        if(flashcardService.findById(uuid).isPresent())
        {
            flashcardService.deleteFlashcard(uuid);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.badRequest().build();
    }
}
