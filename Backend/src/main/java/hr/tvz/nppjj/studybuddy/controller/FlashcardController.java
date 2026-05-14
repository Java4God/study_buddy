package hr.tvz.nppjj.studybuddy.controller;

import hr.tvz.nppjj.studybuddy.dto.FlashcardDTO;
import hr.tvz.nppjj.studybuddy.model.Flashcard;
import hr.tvz.nppjj.studybuddy.service.FlashcardService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("flashcards")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FlashcardController {
    FlashcardService flashcardService;

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
