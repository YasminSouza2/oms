package com.yasmin.oms.api.dto.response;

import com.yasmin.oms.domain.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String tipo;
    private UUID id;
    private String nome;
    private String email;
    private Role role;

    public static final String TIPO_BEARER = "Bearer";
}
