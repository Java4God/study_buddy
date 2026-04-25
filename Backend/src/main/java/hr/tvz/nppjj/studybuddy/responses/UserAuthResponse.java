package hr.tvz.nppjj.studybuddy.responses;


import com.fasterxml.jackson.annotation.JsonProperty;

public record UserAuthResponse(@JsonProperty("access_token") String accessToken,
                               @JsonProperty("refresh_token") String refreshToken)
{}