package com.yasmin.oms.api.dto.response;

import com.yasmin.oms.domain.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private UUID id;
    private String nome;
    private String email;
    private String telefone;
    private String cpf;
    private Role role;
    private LocalDateTime dataCadastro;
}
