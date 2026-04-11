package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.PasswordResetConfirmDTO;
import hr.tvz.nppjj.studybuddy.dto.PasswordResetRequestDTO;

public interface PasswordResetService {
    void requestPasswordReset(PasswordResetRequestDTO dto);
    void confirmPasswordReset(PasswordResetConfirmDTO dto);
}