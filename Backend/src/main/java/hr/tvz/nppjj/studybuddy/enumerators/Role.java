package hr.tvz.nppjj.studybuddy.enumerators;

public enum Role {
    ROLE_ADMIN("ROLE_ADMIN"),
    ROLE_BASIC_USER("ROLE_BASIC_USER");

    public final String role;
    Role(String role){
        this.role = role;
    }
}
