package hr.tvz.nppjj.studybuddy.enumerators;

public enum PomodoroSummaryRating {
    EXCELLENT("Izvrsno", "Dosegnuo/la si puni tjedni cilj. Sjajna dosljednost."),
    GREAT("Vrlo dobro", "Odličan tjedan učenja. Blizu si punog cilja."),
    GOOD("Dobro", "Stabilan napredak kroz tjedan."),
    OK("U redu", "Ovaj tjedan imaš korisnu količinu fokusa."),
    LOW("Lagano", "Lakši tjedan, ali svaka fokusirana sesija se računa.");

    private final String label;
    private final String message;

    PomodoroSummaryRating(String label, String message) {
        this.label = label;
        this.message = message;
    }

    public String getLabel() {
        return label;
    }

    public String getMessage() {
        return message;
    }
}
