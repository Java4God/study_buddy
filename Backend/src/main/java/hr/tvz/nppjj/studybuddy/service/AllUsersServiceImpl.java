package hr.tvz.nppjj.studybuddy.service;

import hr.tvz.nppjj.studybuddy.dto.UserDTO;
import hr.tvz.nppjj.studybuddy.repository.UserRepository;
import hr.tvz.nppjj.studybuddy.utils.UserDTOUtil;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class AllUsersServiceImpl implements AllUsersService{
    UserRepository userRepository;

    @Override
    public Page<UserDTO> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserDTOUtil::toDTO);
    }
}
